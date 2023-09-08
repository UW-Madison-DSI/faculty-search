#!/bin/bash

# Flask
docker compose cp cert.pem flask:/app/cert.pem
docker compose cp privkey.pem flask:/app/privkey.pem

# FastAPI
docker compose cp cert.pem fastapi:/app/cert.pem
docker compose cp privkey.pem fastapi:/app/privkey.pem