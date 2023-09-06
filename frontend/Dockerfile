FROM python:slim-bullseye

WORKDIR /app

RUN apt-get update && apt-get install -y jq curl

COPY services/requirements.txt /tmp/requirements.txt
RUN pip install --upgrade pip && pip install -r /tmp/requirements.txt
RUN sudo pip install gunicorn

COPY services/install_latest_release.sh /tmp/install_latest_release.sh
RUN chmod +x /tmp/install_latest_release.sh
RUN /tmp/install_latest_release.sh

COPY . .
EXPOSE 5000