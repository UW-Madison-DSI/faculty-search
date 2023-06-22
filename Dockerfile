FROM python:3.11-slim

WORKDIR /app

RUN pip install --upgrade pip
COPY .devcontainer/requirements.txt .
RUN pip install -r requirements.txt

COPY . .
RUN pip install .

COPY app.py .

EXPOSE 8501
ENTRYPOINT ["streamlit", "run", "app.py"]