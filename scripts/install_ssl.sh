sudo apt install certbot
sudo certbot certonly --standalone -d discover.datascience.wisc.edu

# Copy the certificates to the community-search directory
sudo cp /etc/letsencrypt/live/discover.datascience.wisc.edu/cert.pem /faculty-search
sudo cp /etc/letsencrypt/live/discover.datascience.wisc.edu/privkey.pem /faculty-search
