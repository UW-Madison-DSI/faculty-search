#! /bin/bash

cd /community-search
docker compose pull flask
docker compose up -d --build