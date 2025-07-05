# Use an official Python runtime as a parent image
FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Create a non-root user and group
RUN groupadd -r appuser && useradd --no-log-init -r -g appuser appuser

# Set the working directory in the container
WORKDIR /app/backend

# Install system dependencies if any were needed (none for now for this basic setup)
# RUN apt-get update && apt-get install -y --no-install-recommends some-package && rm -rf /var/lib/apt/lists/*

# Copy the requirements file into the container at /app/backend
COPY requirements.txt .

# Install any needed packages specified in requirements.txt
# Use --no-cache-dir to reduce image size.
# Ensure pip is up to date.
RUN pip install --upgrade pip
RUN pip install --no-cache-dir -r requirements.txt

# Copy the rest of the backend application code into the container at /app/backend
# This includes main.py, services.py, predictor.py, features.py, ml_trainer.py, schemas.py, and the models/ directory
COPY . .

# Ensure the models directory exists (though it should be copied if present)
# And ensure the appuser owns the application files
RUN mkdir -p /app/backend/models && chown -R appuser:appuser /app
USER appuser

# Expose the port the app runs on
EXPOSE 8000

# Define the command to run the application
# The host 0.0.0.0 is important to make it accessible from outside the container
# The model will be loaded at startup due to the lifespan event in main.py
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
