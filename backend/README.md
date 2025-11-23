
---

# Prerequisites

Before you begin, ensure the following are installed:

* **Git**
* **Python ≥ 3.10**
* **Poetry ≥ 1.8** (optional but recommended)
  Installation Guide: [https://python-poetry.org/docs/#installation](https://python-poetry.org/docs/#installation)

---

# 1. Clone the Repository

```bash
git clone https://github.com/lucib3196/Gestalt_Question_Review.git
cd Gestalt_Question_Review
```

---

# 2. Environment Variables

Create a `.env` file in the project root.
If you need a template, email [lberm007@ucr.edu](mailto:lberm007@ucr.edu).

Example:

```env
# ========================
# Backend (FastAPI)
# ========================
HOST=0.0.0.0
PORT=8000
MODE=dev
SECRET_KEY=change_to_something_secret
LOGLEVEL=10
SQLITE_DB_PATH=src/api/database.db
ALLOWED_ORIGINS=http://localhost:5173

# ========================
# Code Sandbox
# ========================
SANDBOX_URL=http://code_sandbox:8080

# ========================
# Firebase
# ========================
STORAGE_SERVICE=local
STORAGE_BUCKET=my-storage-bucket
FIREBASE_CRED=FIREBASE_CRED.json

# ========================
# General
# ========================
PYTHONUTF8=1
```

---

# Installation Methods

There are three supported installation methods:

1. Poetry
2. Pip
3. Docker

Choose the method that best fits your workflow.

---

# Virtual Environment (Pip Workflow)

If installing dependencies manually, create and activate a virtual environment.

### macOS/Linux

```bash
cd ai_workspace
python3 -m venv venv
source venv/bin/activate
```

### Windows

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

# Docker Build

Two Dockerfiles are included:

* `Dockerfile` (default production configuration)
* `Dockerfile.dev` (development configuration with live reload)

### Build with default Dockerfile

```bash
docker build -t backend:latest .
```

### Build with development Dockerfile

```bash
docker build -f Dockerfile.dev -t backend:dev .
```

---

# Running the Server

## Using Poetry

```bash
poetry run python -m backend.api.main
```

## Using Pip

```bash
python -m backend.api.main
```

## Using Docker

```bash
docker run --rm -it -p 8000:8000 backend:latest
```

or for development mode:

```bash
docker run --rm -it -p 8000:8000 backend:dev
```

---

# API Endpoints

The server runs on port **8000** (not 8001—your Docker and FastAPI commands use 8000).

* API Root: [http://127.0.0.1:8000](http://127.0.0.1:8000)
* Swagger Documentation: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---

# Need Assistance?

If you encounter any issues or need help during setup, contact:

**[lberm007@ucr.edu](mailto:lberm007@ucr.edu)**

---
