
---

# Frontend Setup Guide

## Prerequisites

Before you begin, ensure the following are installed:

* **Git**
* **Node.js ≥ 18** (npm included)

---

## 1. Clone the Repository

```bash
git clone https://github.com/lucib3196/Gestalt_Question_Review.git
cd Gestalt_Question_Review
```

---

## 2. Configure Environment Variables

Create a `.env` file inside the `frontend` directory and add the required values:

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

VITE_API_URL=http://localhost:8000
```

These variables configure Firebase services and provide the frontend with the backend API URL.

---

## 3. Install Frontend Dependencies (Recommended Method)

The preferred method is a manual Node.js installation.

```bash
cd frontend
npm install
```

Start the development server:

```bash
npm run dev
```

Your local development server will typically be available at:

```
http://localhost:5173
```

---

## 4. Using Docker (Docker Compose)

Two Dockerfiles are included for the frontend:

* **Dockerfile** – Production build
* **Dockerfile.dev** – Development build with live reload (used by default)

Both are designed to work with the project’s root `docker-compose.yml`.

To build and run the frontend using Docker:

```bash
docker compose up --build
```

This will start the development server inside a container using `Dockerfile.dev`.

---

## Need Help?

If you encounter issues or have setup questions, feel free to reach out:

**[lberm007@ucr.edu](mailto:lberm007@ucr.edu)**

---
