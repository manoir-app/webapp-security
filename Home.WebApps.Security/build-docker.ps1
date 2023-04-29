docker build . -f ..\..\..\Dockerfile.Release -t 192.168.2.184:5000/webapps-security:latest

docker tag 192.168.2.184:5000/webapps-security:latest 192.168.2.100:5000/webapps-security:latest

docker push 192.168.2.184:5000/webapps-security:latest
docker push 192.168.2.100:5000/webapps-security:latest

docker image rm 192.168.2.184:5000/webapps-security:latest
docker image rm 192.168.2.100:5000/webapps-security:latest
