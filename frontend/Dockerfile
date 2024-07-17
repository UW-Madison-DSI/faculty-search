FROM python:3.11-slim

WORKDIR /app

# Frontend dependencies
RUN apt-get update && apt-get install -y jq curl cron
COPY services/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip && pip install -r /tmp/requirements.txt

# Cron job to remove tmp files
RUN echo "* 0 * * * rm -rf /tmp/*" > /etc/cron.d/clean_tmp
RUN chmod 0644 /etc/cron.d/clean_tmp
RUN crontab /etc/cron.d/clean_tmp

COPY . .
WORKDIR /app/services
CMD [ "/bin/bash", "run.sh" ]