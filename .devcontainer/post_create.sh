#!/bin/bash

pip install --upgrade pip
pip install -r .devcontainer/requirements.txt
pip install -e .
source .env
rsconnect add --server https://data-viz.it.wisc.edu/ --name wisc --api-key $POSIT_API_KEY