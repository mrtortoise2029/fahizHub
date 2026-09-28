# API

Base URL in development: `http://localhost:3000/api`

Implemented foundation endpoints:

- `GET /health` — service status
- `POST /auth/login` — validate credentials and set secure authentication cookie
- `POST /auth/logout` — clear authentication cookie
- `GET /auth/me` — return the authenticated admin profile
- `GET /projects` — list published projects and related skills
- `GET /projects/:slug` — retrieve one published project

API responses use `{ success, data }` for success and `{ success: false, message, errors? }` for errors. Private CRUD endpoints will require authentication and feature-specific validation.

