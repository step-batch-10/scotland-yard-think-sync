#! /bin/bash
set -e
roomId="${1:-100001}";

curl http:/localhost:8000/login -X POST -d "playerName=player1" -c cookie.txt
curl http:/localhost:8000/setup/join-room -X POST -d "roomId=$roomId" -b cookie.txt

curl http:/localhost:8000/login -X POST -d "playerName=player2" -c cookie.txt
curl http:/localhost:8000/setup/join-room -X POST -d "roomId=$roomId" -b cookie.txt

curl http:/localhost:8000/login -X POST -d "playerName=player3" -c cookie.txt
curl http:/localhost:8000/setup/join-room -X POST -d "roomId=$roomId" -b cookie.txt

curl http:/localhost:8000/login -X POST -d "playerName=player4" -c cookie.txt
curl http:/localhost:8000/setup/join-room -X POST -d "roomId=$roomId" -b cookie.txt

curl http:/localhost:8000/login -X POST -d "playerName=player5" -c cookie.txt
curl http:/localhost:8000/setup/join-room -X POST -d "roomId=$roomId" -b cookie.txt

echo "5 Players added...."