#! /bin/bash

export PYTHONPATH=/community-search:$PYTHONPATH
cd /community-search
docker compose up -d --build
