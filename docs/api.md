# API

Base URL in development: `http://localhost:3000/api`

Implemented foundation endpoints:

- `GET /health` — service status
- `POST /auth/login` — validate credentials and set secure authentication cookie
- `POST /auth/logout` — clear authentication cookie
- `GET /auth/me` — return the authenticated admin profile
- `GET /projects` — list published projects and related skills
- `GET /projects/:slug` — retrieve one published project
- `GET /projects/admin/all` — list all projects for the authenticated admin
- `POST /projects` — create a project (authenticated)
- `PUT /projects/:id` — update a project (authenticated)
- `DELETE /projects/:id` — delete a project (authenticated)
- `GET /content/profile` — retrieve public profile and hero content
- `GET /content/skills` — list published skills grouped by category
- `GET /content/education` — list published education records
- `GET /content/experience` — list published experience and leadership records

API responses use `{ success, data }` for success and `{ success: false, message, errors? }` for errors. Private CRUD endpoints will require authentication and feature-specific validation.
