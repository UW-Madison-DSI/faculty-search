#!/bin/bash

# Start cron service
service cron start

# Run gunicorn
exec gunicorn -w "2" -b 0.0.0.0:443 --certfile=/etc/ssl/cert.pem --keyfile=/etc/ssl/privkey.pem services.app:app
