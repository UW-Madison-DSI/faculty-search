FROM python:slim-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y jq curl cron

# Frontend dependencies
COPY services/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip && pip install -r /tmp/requirements.txt

# Backend dependencies
COPY services/install_latest_release.sh /tmp/install_latest_release.sh
RUN chmod +x /tmp/install_latest_release.sh
RUN /tmp/install_latest_release.sh

# Cron job to remove tmp files
RUN echo "* 0 * * * rm -rf /tmp/*" > /etc/cron.d/clean_tmp
RUN chmod 0644 /etc/cron.d/clean_tmp
RUN crontab /etc/cron.d/clean_tmp

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .

ENTRYPOINT ["/entrypoint.sh"]