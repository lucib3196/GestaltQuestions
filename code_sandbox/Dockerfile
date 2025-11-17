FROM python:3.11-slim
# Install curl and node.js
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean

RUN useradd -ms /bin/bash sandbox
USER sandbox
WORKDIR /home/sandbox

COPY . .

CMD ["python", "executor.py"]
