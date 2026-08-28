# Production Dockerfile for Module 3 AI Forecasting API (Cloud Run)
FROM python:3.11-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PORT=8080 \
    GANESH_MODULE_DIR=/app/ganesh_module

WORKDIR /app

# Install system dependencies if required
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
# Install CPU-only PyTorch to minimize image size and maximize build speed
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu && \
    pip install --no-cache-dir -r requirements.txt

# Copy application source code and artifacts
COPY api.py .
COPY src/ ./src/
COPY artifacts/ ./artifacts/
COPY ganesh_module/ ./ganesh_module/

# Expose port (Cloud Run sets $PORT dynamically)
EXPOSE 8080

# Run uvicorn on $PORT
CMD exec uvicorn api:app --host 0.0.0.0 --port ${PORT:-8080} --workers 1
