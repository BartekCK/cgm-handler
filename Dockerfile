FROM amazon/aws-lambda-nodejs:16 AS build

WORKDIR /usr/app

COPY src/ ./src
COPY package*.json ./
COPY tsconfig.json ./

RUN npm ci
RUN npm run build

FROM amazon/aws-lambda-nodejs:16 AS development

WORKDIR /usr/app

COPY package*.json ./

RUN npm ci

COPY --from=build /usr/app/dist ./src

ENV NODE_ENV=development

CMD ["/usr/app/src/app.lambdaHandler"]

FROM amazon/aws-lambda-nodejs:16 AS production

WORKDIR /usr/app

COPY package*.json ./

RUN npm install --only=production

COPY --from=build /usr/app/dist ./src

ENV NODE_ENV=production

CMD ["/usr/app/src/app.lambdaHandler"]
