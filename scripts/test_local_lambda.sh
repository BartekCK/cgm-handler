cd ..
docker-compose up -d
NODE_ENV=development npm run migrations:latest
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'
docker-compose down
