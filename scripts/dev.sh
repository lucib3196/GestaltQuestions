#!/usr/bin/env bash
set -euo pipefail

cleanup() {
  echo "Stopping development services..."
  if [[ -n "${FIREBASE_PID:-}" ]]; then
    kill "$FIREBASE_PID" 2>/dev/null || true
  fi
  docker compose -f compose.dev.yaml down || true
}

trap cleanup EXIT INT TERM

echo "Starting Firebase emulators..."
firebase emulators:start &
FIREBASE_PID=$!

echo "Starting backend container..."
docker compose -f compose.dev.yaml up --build