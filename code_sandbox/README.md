Here is a fully cleaned-up, formatted, and corrected version.
I fixed grammar, removed repetition, corrected endpoint URLs, and ensured the flow is consistent.

---

# Code Sandbox

The **Code Sandbox** is an isolated environment used for executing Python and JavaScript code.
This feature is experimental and still under active development, but installation and setup are straightforward.

---

# Prerequisites

Before you begin, ensure the following are installed:

- **Git**
- **Python ≥ 3.10**
- **Poetry ≥ 1.8** (optional but recommended)
  Installation Guide: [https://python-poetry.org/docs/#installation](https://python-poetry.org/docs/#installation)

---

# 1. Clone the Repository

```bash
git clone https://github.com/lucib3196/Gestalt_Question_Review.git
cd Gestalt_Question_Review
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
cd code_sandbox
python3 -m venv venv
source venv/bin/activate
```

### Windows

```bash
cd code_sandbox
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
poetry run python -m code_sandbox.api.main
```

## Using Pip

```bash
python -m code_sandbox.api.main
```

---

# API Endpoints

The Code Sandbox server runs on port **8080**.

- API Root: [http://127.0.0.1:8080](http://127.0.0.1:8080)
- Swagger Documentation: [http://127.0.0.1:8080/docs](http://127.0.0.1:8080/docs)

---

# Need Assistance?

If you encounter any issues or need help during setup, feel free to reach out:

**[lberm007@ucr.edu](mailto:lberm007@ucr.edu)**

---
