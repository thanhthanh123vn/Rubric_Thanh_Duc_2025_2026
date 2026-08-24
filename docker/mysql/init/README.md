# MariaDB initialization

`01-create-service-databases.sh` creates one schema for each microservice:

- `db_user`
- `db_course`
- `db_rubric_service`
- `db_grading`
- `db_notification`

MariaDB executes files in this directory only when the `mysql-data` volume is
empty. For an existing `db_rubric`, run `scripts/split-service-databases.sql`
once before starting the services with their new configuration.

Do not commit production dumps or secrets to Git.
