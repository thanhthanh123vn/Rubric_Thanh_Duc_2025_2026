# Service database split

The system now uses five service-owned logical databases:

| Service | MariaDB | MongoDB |
| --- | --- | --- |
| user-service | `db_user` | — |
| course-service | `db_course` | `db_course` |
| rubric-service | `db_rubric_service` | — |
| grading-service | `db_grading` | — |
| notification-service | `db_notification` | `db_notification` |

Redis remains a cache/message infrastructure component and is not a system of
record for a service database.

## Docker startup

Copy `.env.docker.example` to `.env.docker`, fill in the required secrets, then
start the stack:

```powershell
docker compose --env-file .env.docker up --build
```

`database-init` creates the five MariaDB schemas and grants the application
user access before any backend starts. `mongodb-init` creates/copies the two
service-owned MongoDB databases before the dependent services start.

If the existing volumes contain the legacy `db_rubric` database, startup
automatically copies its tables and collections into the new databases. The
legacy database is intentionally retained as a rollback source. A destination
table or collection that already contains data is never overwritten.

## Manual migration

The same non-destructive migrations can be run manually when Docker is not
used:

```powershell
Get-Content -Raw scripts/split-service-databases.sql | mariadb -h localhost -u root -p
mongosh mongodb://localhost:27017/db_rubric scripts/split-mongodb-databases.js
```

After verifying row/document counts and application behavior, archive the old
`db_rubric` database. Do not remove it before a backup has been tested.

## Compatibility note

Course CLO data is owned by `course-service`. `rubric-service` maps that table
through the `db_course` catalog to preserve the existing CLO endpoints. OBE and
assessment read models in `course-service` use explicitly qualified, read-only
joins to rubric and grading schemas. Writes remain in the owning service.
