cd ..
docker build --no-cache -t cgm-handler --platform linux/amd64 .
docker run -d -p 9000:8080 --name cgm-handler-contaier cgm-handler:latest
curl -XPOST "http://localhost:9000/2015-03-31/functions/function/invocations" -d '{}'

docker stop cgm-handler-contaier
docker rm cgm-handler-contaier
docker image rm cgm-handler

