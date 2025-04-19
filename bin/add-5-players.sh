#! /bin/bash
set -e
curl http:/localhost:8000/login -X POST -d "playerName=player1" -c cookie.txt
curl http:/localhost:8000/setup/create-room -X POST -b cookie.txt

curl http:/localhost:8000/login -X POST -d "playerName=player2" -c cookie.txt
curl http:/localhost:8000/setup/join-room -X POST -d "roomId=100001" -b cookie.txt

curl http:/localhost:8000/login -X POST -d "playerName=player3" -c cookie.txt
curl http:/localhost:8000/setup/join-room -X POST -d "roomId=100001" -b cookie.txt

curl http:/localhost:8000/login -X POST -d "playerName=player4" -c cookie.txt
curl http:/localhost:8000/setup/join-room -X POST -d "roomId=100001" -b cookie.txt

curl http:/localhost:8000/login -X POST -d "playerName=player5" -c cookie.txt
curl http:/localhost:8000/setup/join-room -X POST -d "roomId=100001" -b cookie.txt

echo "5 Players added...."