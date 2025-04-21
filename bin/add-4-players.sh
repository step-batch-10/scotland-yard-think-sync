#! /bin/bash
set -e

DEPLOYMENT_URL=$1

curl $DEPLOYMENT_URL/login -X POST -d "playerName=player2" -c cookie.txt
curl $DEPLOYMENT_URL/setup/join-room -X POST -d "roomId=100001" -b cookie.txt

curl $DEPLOYMENT_URL/login -X POST -d "playerName=player3" -c cookie.txt
curl $DEPLOYMENT_URL/setup/join-room -X POST -d "roomId=100001" -b cookie.txt

curl $DEPLOYMENT_URL/login -X POST -d "playerName=player4" -c cookie.txt
curl $DEPLOYMENT_URL/setup/join-room -X POST -d "roomId=100001" -b cookie.txt

curl $DEPLOYMENT_URL/login -X POST -d "playerName=player5" -c cookie.txt
curl $DEPLOYMENT_URL/setup/join-room -X POST -d "roomId=100001" -b cookie.txt
echo $DEPLOYMENT_URL
echo "4 Players added...."
