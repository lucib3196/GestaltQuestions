# Code Sandbox

This is a sandbox environemt for code execution currently this is 
an experimental feature in development this. There is not much to it but for installation follow this 

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
cd backend
python3 -m venv venv
source venv/bin/activate
```

### Windows

```bash
cd backend
python -m venv venv
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```


---

# Running the Server

## Using Poetry

```bash
poetry run python -m backend.api.main
```

## Using Pip

```bash
python -m code_sandbox.api.main
```
