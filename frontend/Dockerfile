FROM python:3.11

WORKDIR /app

RUN apt-get update && apt-get install -y jq curl cron git gcc build-essential

# Frontend dependencies
COPY services/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip && pip install -r /tmp/requirements.txt

# Backend dependencies
RUN pip install git+https://github.com/UW-Madison-DSI/faculty-search.git@0.1.3

# Cron job to remove tmp files
RUN echo "* 0 * * * rm -rf /tmp/*" > /etc/cron.d/clean_tmp
RUN chmod 0644 /etc/cron.d/clean_tmp
RUN crontab /etc/cron.d/clean_tmp

COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

COPY . .

ENTRYPOINT ["/entrypoint.sh"]