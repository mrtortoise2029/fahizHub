# FahizHub

FahizHub is Fahiz Ahmed's public professional portfolio and private productivity workspace. It combines a content-driven developer portfolio with a secure dashboard for projects, messages, meetings, tasks, learning, student work, and an eventual AI assistant.

## Current phase

The production workflow is implemented locally:

- React/Vite/Tailwind public experience with responsive phone, tablet, laptop, and desktop layouts
- Mobile-first public navigation and an off-canvas mobile admin dashboard
- Public home, projects, project detail, profile pages, contact, and meeting foundations
- Secure Express API structure with HTTP-only cookie authentication, validation, rate limiting, CORS, and security headers
- Normalized MySQL base schema and verified seed content
- Admin login, protected routes, dashboard, navigation, honest empty states, light/dark mode
- Database-backed profile, projects, skills, education, and experience pages
- Loading, empty, and API error states across public dynamic content
- Authenticated project create, edit, publish/draft, and delete workflow in the responsive admin dashboard
- Working public contact form with private inbox, read/archive/delete actions, and email reply link
- Public one-hour meeting requests with UTC storage, collision prevention, and admin status management
- Private task creation, editing, completion, priorities, categories, due dates, and deletion
- Student Center with editable courses and assignments, configurable grading rules, grade entries, and GPA calculation
- Editable learning goals and linked learning resources
- Fahiz AI conversation history, server-side Gemini integration, and opt-in personal context
- Public Fahiz AI chat at `/ai`, isolated from all private admin data and rate-limited per visitor
- Live dashboard summaries and editable public profile settings
- Admin-controlled public achievements and services with honest empty states
- Database-generated resume view with browser PDF export
- Admin management for education, experience, and categorized skills
- Configurable weekly meeting availability, unavailable dates, blocked slots, generated slots, and overlap prevention
- Project image, certificate, and CV uploads with authenticated validation and metadata
- Recurring daily, weekly, and monthly tasks
- SMTP-backed contact and meeting notifications with a delivery audit log
- Dynamic page metadata, Open Graph/Twitter tags, sitemap, and robots generation
- Cloudflare Turnstile support and database-backed daily quotas for public AI
- Incremental database migrations, automated MySQL backup command, health/readiness probes, and staging containers
- Desktop Chrome and Pixel 5 Playwright workflows in addition to unit/API tests
- Private notification center and non-invasive page/project analytics
- Installable PWA with offline public portfolio/resume data and calendar exports after booking
- English/Bangla navigation, high-contrast mode, skip navigation, reduced-motion support, and route focus management
- Rich project case studies with screenshots, demo links, architecture, outcomes, draft preview, autosave, version history, rollback, and scheduled publishing
- Admin operations center with global search, bulk publishing, media library, email retries, analytics trends, audit logs, backup history, 2FA, and session revocation
- Optional Google Calendar OAuth sync for confirmed meetings
- Public AI suggested questions, portfolio source links, and helpful/not-helpful feedback
- Frontend and backend tests, linting, and production build scripts

SMTP, CAPTCHA, production URLs, and public contact links activate when their verified values are added to the environment/admin settings. Physical-device testing and deployment require access to the target staging host and phones.

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
npm run test:e2e -w frontend
npm run db:migrate -w backend
npm run db:backup -w backend
```

## Mobile and desktop support

Both the public site and private dashboard are designed for 360px, 390px, 768px, 1024px, and 1440px widths. Interactive controls use touch-friendly sizing, dense rows become stacked mobile cards, filter controls can scroll horizontally, and the desktop admin sidebar becomes a mobile drawer.

See [architecture](docs/architecture.md), [database](docs/database.md), [API](docs/api.md), [deployment](docs/deployment.md), and [operations](docs/operations.md).
