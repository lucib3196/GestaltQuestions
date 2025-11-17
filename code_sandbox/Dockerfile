FROM python:3.11-slim

# Install dependencies for building Python packages
RUN apt-get update && apt-get install -y \
    curl \
    gcc \
    libpq-dev \
    python3-dev \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install Node.js (optional for your sandbox)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Install Poetry
RUN pip install --no-cache-dir poetry

WORKDIR /app

# Poetry dependencies first for caching
COPY pyproject.toml poetry.lock* ./

# Configure Poetry and install dependencies 
RUN poetry config virtualenvs.create false \
    && poetry install --no-root --no-interaction --no-ansi



# Copy all project files
COPY . .

# Create non-root user
RUN useradd -ms /bin/bash sandbox
USER sandbox

EXPOSE 8080

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080"]
