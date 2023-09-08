gcloud compute ssh --project=community-search-392420  --zone=us-central1-a 	 lcmjlo@community-search 
cd /home/lcmjlo/community-search
git pull

# TODO: migrate the docker-volume outside of the devcontainer
# docker compose up --build
