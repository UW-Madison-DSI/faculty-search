#!/bin/bash

CERT_PEM=/etc/letsencrypt/live/discover.datascience.wisc.edu/cert.pem
PRIVKEY_PEM=/etc/letsencrypt/live/discover.datascience.wisc.edu/privkey.pem
PROJECT_ROOT=/community-search

sudo certbot renew

cd $PROJECT_ROOT
sudo cp $CERT_PEM $PROJECT_ROOT
sudo cp $PRIVKEY_PEM $PROJECT_ROOT

containers=("flask" "fastapi")
# Flask
for container in "${containers[@]}"; do
    sudo docker compose cp cert.pem "$container:/app";
    sudo docker compose cp privkey.pem "$container:/app";
done
