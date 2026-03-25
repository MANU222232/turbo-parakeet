# SwiftTor Monorepo

Welcome to the SwiftTor roadside assistance platform monorepo.

## Structure
- `apps/web`: Next.js 14 (App Router, Tailwind, Framer Motion)
- `apps/api`: FastAPI (SQLAlchemy, Alembic, Redis, MongoDB)
- `apps/driver`: Expo (React Native) Stub
- `packages/types`: Shared TypeScript interfaces
- `packages/utils`: Shared helper functions

## Getting Started

### 1. Environment Setup
Copy `.env.example` to `.env` in the root and provide your **Neon PostgreSQL** credentials.
```bash
cp .env.example .env
```

### 2. Databases
Start local Redis and MongoDB services:
```bash
docker-compose up -d
```

### 3. API (FastAPI)
```bash
cd apps/api
# Install dependencies
pip install -r requirements.txt
# Run migrations (ensure DATABASE_URL is set in .env)
alembic upgrade head
# Seed data
python seed.py
# Start server
uvicorn main:app --reload
```

### 4. Web (Next.js)
```bash
cd apps/web
# Install dependencies
npm install
# Start development server
npm run dev
```

### 5. Health Check
Verify system status at: `http://localhost:8000/health`
