#! /bin/bash
# This is suppose to be run on GCP 

cd /community-search
sudo su lcmjlo

# Pull the latest image
docker compose down flask
docker compose pull flask
docker compose build flask

# Copy the certificates to frontend container
docker compose cp cert.pem flask:/app
docker compose cp privkey.pem flask:/app

# Start the frontend container
docker compose up flask