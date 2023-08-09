FROM python:slim-bullseye

WORKDIR /app

RUN pip install --upgrade pip
RUN pip install flask flask_mail

COPY . .
EXPOSE 5000