# AI Workspace Installation Guide

This guide provides instructions for installing and running the AI Workspace module.
The AI Workspace contains utilities for code generation using LangChain, LangGraph, and OpenAI.
It also includes a FastAPI server that exposes core functionality.

---

## Prerequisites

Ensure the following tools are installed before continuing:

- Git
- Python 3.10+
- Poetry (recommended but optional) → [Installation Guide](https://python-poetry.org/docs/#installation)

---

## 1. Clone the Repository

If you have not already done so, clone the repository:

```bash
git clone https://github.com/lucib3196/Gestalt_Question_Review.git
cd Gestalt_Question_Review
```

---

## 2. Environment Variables

Create a `.env` file in the project root.
If you need a default template, email [lberm007@ucr.edu](mailto:lberm007@ucr.edu).

The following environment variables are required.
For embeddings, the workspace currently uses `text-embedding-3-large`, so ensure you have a valid OpenAI API key.

```env
# Example .env file

AI_base_model__PROVIDER=
AI_base_model__MODEL=
AI_base_model__API_KEY=

OPENAI_API_KEY=
LANGSMITH_API_KEY=
LANGCHAIN_PROJECT=

AI_EMBEDDING_MODEL=text-embedding-3-large
```

---

# Installation Methods

There are three supported installation methods:

1. Poetry
2. Pip
3. Docker

You may choose whichever fits your workflow.

---

## Poetry Installation

Poetry must be installed on your system.

Navigate into the AI Workspace directory:

```bash
cd ai_workspace
poetry install
```

---

## Pip Installation

If installing with pip, first export Poetry dependencies to a `requirements.txt` file:

```bash
poetry lock
poetry export -f requirements.txt --output requirements.txt
```

### Create and Activate a Virtual Environment

**macOS/Linux:**

```bash
cd ai_workspace
python3 -m venv venv
source venv/bin/activate
```

**Windows:**

```bash
cd ai_workspace
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

---

## Docker Build

There are two Dockerfiles:

- `Dockerfile` (default)
- `Dockerfile.dev` (recommended for development due to live reload support)

### Build Commands

Using the default Dockerfile:

```bash
docker build -t ai_workspace:latest .
```

Using the development Dockerfile:

```bash
docker build -f Dockerfile.dev -t ai_workspace:dev .
```

---

# Running the Server

## Using Poetry

```bash
poetry run python -m ai_workspace.api.main
```

## Using Pip

```bash
python -m ai_workspace.api.main
```

## Using Docker

```bash
# Choose the appropriate one based on previous step
docker run --rm -it -p 8001:8001 ai_workspace:latest
docker run --rm -it -p 8001:8001 ai_workspace:dev
```

The server runs on port **8001**.

- API Root: [http://127.0.0.1:8001](http://127.0.0.1:8001)
- Swagger Documentation: [http://127.0.0.1:8001/docs](http://127.0.0.1:8001/docs)


---

## Experimental: LangGraph Development Server

This feature is currently **experimental**. It provides access to a LangGraph development server that exposes an interactive Studio on **port 2024** for testing chatbots and agent workflows.

### Agent Configuration

All available agents are configured in:

```
./ai_workspace/langgraph_project/langgraph.json
```

### Notes

This feature is **not yet available in Docker**. It must be run locally.

### Running the LangGraph Dev Server

**Using Poetry:**

```bash
poetry run langgraph dev --config ./ai_workspace/langgraph_project/langgraph.json
```

**Using pip:**

```bash
langgraph dev --config ./ai_workspace/langgraph_project/langgraph.json
```

## Need Assistance?

If you encounter issues or need help setting up the workspace, contact:

**[lberm007@ucr.edu](mailto:lberm007@ucr.edu)**

---
