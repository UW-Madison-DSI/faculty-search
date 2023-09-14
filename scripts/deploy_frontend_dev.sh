#! /bin/bash
# This is suppose to be run on GCP 

cd /faculty-search
sudo su lcmjlo

# Pull the latest image
docker compose down flask
docker compose pull flask
docker compose up flask --build -d

# Start the frontend container
docker compose up -d flask

docker cp ./frontend/config/config.dev.json flask:/app/config/config.json