#!/bin/bash

CERT_PEM=/etc/letsencrypt/live/discover.datascience.wisc.edu/cert.pem
PRIVKEY_PEM=/etc/letsencrypt/live/discover.datascience.wisc.edu/privkey.pem
PROJECT_ROOT=/faculty-search

sudo certbot renew

cd $PROJECT_ROOT
sudo cp $CERT_PEM $PROJECT_ROOT
sudo cp $PRIVKEY_PEM $PROJECT_ROOT
