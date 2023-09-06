#!/bin/bash

# Flask
docker compose cp cert.pem flask:/app/cert.pem
docker compose cp privkey.pem flask:/app/privkey.pem

# FastAPI
docker compose cp /etc/letsencrypt/live/discover.datascience.wisc.edu/cert.pem fastapi:/app/cert.pem
docker compose cp /etc/letsencrypt/live/discover.datascience.wisc.edu/privkey.pem fastapi:/app/privkey.pem