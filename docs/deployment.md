# Deployment

## Staging prerequisites

Use a host with Docker Compose, a DNS name, HTTPS termination, and persistent storage. Copy `.env.staging.example` to `.env.staging` on the host and set unique staging secrets. Required values include database credentials, `JWT_SECRET`, admin credentials, `CLIENT_URL`, and `STAGING_URL`. For complete workflows also configure SMTP and Cloudflare Turnstile keys. The Compose build passes the public Turnstile key into the frontend image.

Do not copy the development `.env` to a server or commit `.env.staging`.

Run `npm run staging:preflight` before a release. It checks that Docker Compose is available, required secrets/integrations are configured, URLs use HTTPS, and obvious placeholder values have been removed without printing any secrets.

## Release workflow

```bash
docker compose --env-file .env.staging -f docker-compose.staging.yml build
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d db
docker compose --env-file .env.staging -f docker-compose.staging.yml run --rm api npm run db:migrate -w backend
docker compose --env-file .env.staging -f docker-compose.staging.yml up -d
docker compose --env-file .env.staging -f docker-compose.staging.yml ps
```

The web container exposes port 8080. Put it behind an HTTPS reverse proxy. The included Nginx configuration serves the React application and proxies `/api` and `/uploads` to the API container.

Verify `/api/health`, `/api/ready`, `robots.txt`, and the database-backed `sitemap.xml`, then run Playwright against the staging URL by overriding `PLAYWRIGHT_BASE_URL`. Test login, all CRUD modules, uploads, contact delivery, booking/confirmation email, CAPTCHA, AI quotas, and responsive layouts before promoting the release.

## Physical phone checklist

On at least one current Android phone and one iPhone, verify portrait and landscape navigation, admin drawer, forms and date/time controls, uploads from camera/files, meeting booking, AI chat, links, keyboard behavior, touch targets, dark mode, and slow-network/error states. Physical-device sign-off cannot be replaced by desktop emulation.

See [operations](operations.md) for backups, migrations, monitoring, restoration, and rollback expectations.
