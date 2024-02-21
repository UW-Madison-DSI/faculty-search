FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y jq curl cron
# Frontend dependencies
COPY services/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip && pip install -r /tmp/requirements.txt

# Cron job to remove tmp files
RUN echo "* 0 * * * rm -rf /tmp/*" > /etc/cron.d/clean_tmp
RUN chmod 0644 /etc/cron.d/clean_tmp
RUN crontab /etc/cron.d/clean_tmp

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .

ENTRYPOINT ["/entrypoint.sh"]