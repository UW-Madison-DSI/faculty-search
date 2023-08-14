FROM python:slim-bullseye

WORKDIR /app

RUN pip install --upgrade pip
RUN pip install flask flask_mail langchain python-dotenv

COPY . .
EXPOSE 5000