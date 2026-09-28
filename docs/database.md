# Database

The initial migration lives in `database/migrations/001_initial_schema.sql`. It creates the verified core entities, indexes frequent status/date queries, and uses foreign keys for related content. Times for meetings are stored in UTC and displayed in the configured user timezone (initially Asia/Dhaka).

Run `npm run db:setup -w backend` after configuring `.env`. This applies the base migration, adds only the supplied profile/project data, hashes the configured admin password with bcrypt, and creates the admin account.

Migration `002_productivity_content.sql` adds courses, assignments, learning goals/resources, achievements, services, and privacy-conscious analytics events.

Migration `003_production_workflows.sql` adds secure upload metadata, grading rules and grade entries, meeting exclusions, public settings, email delivery logs, and public-AI daily usage counters.

Use `npm run db:migrate -w backend` for repeatable incremental migrations. Applied filenames and checksums are stored in `schema_migrations`.
