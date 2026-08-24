#!/bin/bash
set -e

# The official MariaDB entrypoint runs this file only for a new data volume.
# One MariaDB instance hosts five isolated schemas, one for each microservice.
if [ -n "${MARIADB_SOCKET:-}" ]; then
    connection_args=(--protocol=socket --socket="${MARIADB_SOCKET}")
else
    connection_args=(-h"${MARIADB_HOST:-localhost}")
fi

mariadb "${connection_args[@]}" -uroot -p"${MARIADB_ROOT_PASSWORD}" <<-EOSQL
CREATE DATABASE IF NOT EXISTS db_user CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_course CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_rubric_service CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_grading CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS db_notification CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

GRANT ALL PRIVILEGES ON db_user.* TO '${MARIADB_USER}'@'%';
GRANT ALL PRIVILEGES ON db_course.* TO '${MARIADB_USER}'@'%';
GRANT ALL PRIVILEGES ON db_rubric_service.* TO '${MARIADB_USER}'@'%';
GRANT ALL PRIVILEGES ON db_grading.* TO '${MARIADB_USER}'@'%';
GRANT ALL PRIVILEGES ON db_notification.* TO '${MARIADB_USER}'@'%';
FLUSH PRIVILEGES;
EOSQL

# Existing installations may still contain the former shared db_rubric schema.
# The migration is safe to rerun and never removes the source database.
if [ -r "${SERVICE_DB_MIGRATION_FILE:-}" ]; then
    legacy_database_exists="$(mariadb "${connection_args[@]}" -uroot -p"${MARIADB_ROOT_PASSWORD}" -Nse \
        "SELECT COUNT(*) FROM information_schema.schemata WHERE schema_name = 'db_rubric'")"
    if [ "${legacy_database_exists}" -gt 0 ]; then
        mariadb "${connection_args[@]}" -uroot -p"${MARIADB_ROOT_PASSWORD}" \
            < "${SERVICE_DB_MIGRATION_FILE}"
    fi
fi
