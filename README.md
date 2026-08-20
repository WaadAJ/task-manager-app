# Task Manager App

A full-stack task management application with a FastAPI backend and a React (Vite) frontend styled with Tailwind CSS. Supports JWT-based user authentication, per-user task ownership, due dates, and light/dark mode.

## Features
- User registration and login with JWT access and refresh tokens
- Create, view, update, delete, and bulk-create tasks
- Mark tasks complete/incomplete
- Filter and search tasks
- Due-date tracking
- Light/dark theme
- Tasks are scoped per user — each user only sees their own

## Tech Stack
**Backend:** Python, FastAPI, SQLAlchemy, SQLite, python-jose (JWT), passlib/bcrypt (password hashing)
**Frontend:** React, Vite, Tailwind CSS
**Testing:** pytest, httpx
**CI/CD:** GitHub Actions (runs the test suite on every push and pull request)
**Containerization:** Docker, docker-compose

## Getting Started

### Backend
```bash
pip install -r requirements.txt
uvicorn main:app --reload
```
The API runs at `http://localhost:8000`. Interactive docs are available at `http://localhost:8000/docs`.

### Frontend
```bash
cd frontend
npm install
npm run dev
```
The app runs at `http://localhost:5173`.

### Running with Docker
```bash
docker compose up --build
```
This starts both the backend (`localhost:8000`) and frontend (`localhost:5173`) in containers.

## Running Tests
```bash
pip install -r requirements-dev.txt
pytest tests/ -v
```
Tests run against an isolated in-memory database and cover authentication, task CRUD, and per-user data isolation. The same suite runs automatically in CI on every push.

## Project Structure
```
app/
├── auth.py            # JWT creation/verification, password hashing
├── auth_routes.py      # /auth/register, /auth/login, /auth/refresh, /auth/me
├── routes.py           # /tasks CRUD endpoints
├── database.py         # SQLAlchemy engine/session setup
├── task_model.py       # Task ORM model
└── user_model.py       # User ORM model
frontend/                # React + Vite + Tailwind client
tests/                   # pytest test suite
```
