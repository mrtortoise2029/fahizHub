# Operations

## Database migrations

Run `npm run db:migrate -w backend` before each application release. The migration runner records applied filenames and SHA-256 checksums in `schema_migrations` and refuses a changed migration that was already applied. Never edit an applied migration; create the next numbered file.

## Backups and restoration

Run `npm run db:backup -w backend`. The command uses the configured MySQL account, writes a timestamped SQL dump under `backups/`, and restricts the file to the current OS user. `backups/` is git-ignored.

Schedule it daily on the production host, encrypt and copy dumps to separate object storage, retain daily/weekly/monthly generations, and alert when a job or upload fails. Test restoration into a disposable database at least monthly:

```bash
mysql -h HOST -P PORT -u USER -p NEW_DATABASE < backups/FILE.sql
```

Uploads are not inside the SQL dump. Snapshot the persistent upload volume on the same schedule and verify that both backup sets have matching timestamps.

## Monitoring

- `/api/health` confirms the process is running and reports uptime.
- `/api/ready` checks database readiness and should gate deployment traffic.
- Monitor HTTP 5xx rate, p95 response time, CPU/memory/disk, MySQL connections and storage, certificate expiry, backup age, email failures in `email_log`, and public-AI usage/cost.
- Send structured application logs to the host's log service and configure alerts for repeated restarts, readiness failures, disk above 80%, and backup age above 26 hours.
- Use an external HTTPS uptime check against the public home page and `/api/ready` from at least two locations.

## Incident basics

Keep the previous application image available for rollback. Database changes must remain backward-compatible for one release. Rotate any exposed secret immediately, invalidate sessions by changing `JWT_SECRET` when necessary, and document the event and restoration validation.
