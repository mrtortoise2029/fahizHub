# FahizHub

FahizHub is Fahiz Ahmed's public professional portfolio and private productivity workspace. It combines a content-driven developer portfolio with a secure dashboard for projects, messages, meetings, tasks, learning, student work, and an eventual AI assistant.

## Current phase

Phase 1 foundation and the public content portion of Phase 2 are implemented:

- React/Vite/Tailwind public experience with responsive phone, tablet, laptop, and desktop layouts
- Mobile-first public navigation and an off-canvas mobile admin dashboard
- Public home, projects, project detail, profile pages, contact, and meeting foundations
- Secure Express API structure with HTTP-only cookie authentication, validation, rate limiting, CORS, and security headers
- Normalized MySQL base schema and verified seed content
- Admin login, protected routes, dashboard, navigation, honest empty states, light/dark mode
- Database-backed profile, projects, skills, education, and experience pages
- Loading, empty, and API error states across public dynamic content
- Authenticated project create, edit, publish/draft, and delete workflow in the responsive admin dashboard
- Frontend and backend tests, linting, and production build scripts

The feature-rich CRUD modules listed in the product brief remain incremental work. Placeholder admin pages are deliberately empty rather than showing fake analytics or content.

## Structure

```text
frontend/   React application
backend/    Express REST API
database/   MySQL migrations and verified seed content
docs/       Architecture and API notes
uploads/    Local development storage
```

## Local setup

1. Install Node.js 20+ and MySQL 8.
2. Copy `.env.example` to `.env` and replace secrets and admin credentials.
3. Install dependencies: `npm install`
4. Put your existing MySQL root password in `DB_PASSWORD` (or use another MySQL account with database-creation permission).
5. Set up the database: `npm run db:setup -w backend`
6. Start both apps: `npm run dev`
7. Open `http://localhost:5173`; the API runs at `http://localhost:3000`.

Never commit `.env`. The initial admin user is generated from `ADMIN_EMAIL` and `ADMIN_PASSWORD`; no plaintext password is stored.

## Quality commands

```bash
npm run lint
npm run test
npm run build
```

## Mobile and desktop support

Both the public site and private dashboard are designed for 360px, 390px, 768px, 1024px, and 1440px widths. Interactive controls use touch-friendly sizing, dense rows become stacked mobile cards, filter controls can scroll horizontally, and the desktop admin sidebar becomes a mobile drawer.

See [architecture](docs/architecture.md), [database](docs/database.md), [API](docs/api.md), and [deployment](docs/deployment.md).
