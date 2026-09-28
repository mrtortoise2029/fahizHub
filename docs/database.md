# Database

The initial migration lives in `database/migrations/001_initial_schema.sql`. It creates the verified core entities, indexes frequent status/date queries, and uses foreign keys for related content. Times for meetings are stored in UTC and displayed in the configured user timezone (initially Asia/Dhaka).

Run `npm run db:setup -w backend` after configuring `.env`. This applies the base migration, adds only the supplied profile/project data, hashes the configured admin password with bcrypt, and creates the admin account.

Further migrations will add student-center, learning-resource, achievement, certification, service, analytics, and upload metadata tables as their phases are implemented.

Migration `002_productivity_content.sql` adds courses, assignments, learning goals/resources, achievements, services, and privacy-conscious analytics events.
