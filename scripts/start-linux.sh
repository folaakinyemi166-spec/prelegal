#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

if [ ! -f .env ]; then
  cp .env.example .env
  echo "Created .env from .env.example — edit it before running in production."
fi

docker compose up --build -d
echo "Prelegal is running at http://localhost:8000"
