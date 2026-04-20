#!/bin/bash

# Start cron service
service cron start

# Run gunicorn (plain HTTP; TLS is terminated by Traefik)
exec gunicorn -w "2" -b 0.0.0.0:8080 services.app:app --log-level 'debug'
