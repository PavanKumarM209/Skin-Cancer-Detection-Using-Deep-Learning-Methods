# Backend Dockerfile
FROM python:3.13-slim

# Set working directory
WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first for better caching
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY app.py .
COPY ensemble_model.py .
COPY explainability.py .
COPY temporal_augmentation.py .
COPY migrations ./migrations

# Create directories for uploads and instance
RUN mkdir -p static/uploads instance

# Expose port
EXPOSE 5001

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV PYTHONUNBUFFERED=1

# Run database migrations and start the application
CMD ["sh", "-c", "flask db upgrade && python app.py"]
