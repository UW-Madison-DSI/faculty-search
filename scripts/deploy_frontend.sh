#! /bin/bash

cd /community-search
sudo su lcmjlo
docker compose pull flask
docker compose up -d --build