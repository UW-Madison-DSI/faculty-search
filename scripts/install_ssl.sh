sudo apt install certbot
sudo certbot certonly --standalone -d discover.datascience.wisc.edu

# Copy the certificates to the community-search directory
sudo cp /etc/letsencrypt/live/discover.datascience.wisc.edu/cert.pem /community-search/frontend
sudo cp /etc/letsencrypt/live/discover.datascience.wisc.edu/privkey.pem /community-search/frontend
