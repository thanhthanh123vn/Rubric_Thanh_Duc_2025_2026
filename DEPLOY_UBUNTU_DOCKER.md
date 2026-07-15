# Deploy LMS Rubric on Ubuntu with Docker

## 1. Server requirements

- Ubuntu 22.04/24.04, recommended minimum 4 CPU and 8 GB RAM.
- Docker Engine with the Compose plugin.
- Git, a domain name, and HTTPS are recommended for production.

Verify the installation:

```bash
docker --version
docker compose version
```

## 2. Prepare the project

Clone/copy the repository to the server, then enter its root directory:

```bash
git clone <YOUR_REPOSITORY_URL> LMS_rubric
cd LMS_rubric
cp .env.docker.example .env.docker
```

Edit `.env.docker`. At minimum, replace `DB_PASSWORD`, `DB_ROOT_PASSWORD`, and
`JWT_SECRET`. Generate a JWT secret with:

```bash
openssl rand -base64 48
```

Copy the Navicat dump supplied with this project:

```bash
cp /path/to/db_rubric.sql docker/mysql/init/db_rubric.sql
```

The dump is imported only on the first creation of the `mysql-data` volume.
Keep `SET FOREIGN_KEY_CHECKS = 0` at the beginning and the corresponding `= 1`
at the end of the dump.

## 3. Build and run

```bash
docker compose --env-file .env.docker config
docker compose --env-file .env.docker build
docker compose --env-file .env.docker up -d
docker compose --env-file .env.docker ps
```

Follow startup logs:

```bash
docker compose --env-file .env.docker logs -f --tail=200
```

The application is available at `http://SERVER_IP` (or the `APP_PORT` selected
in `.env.docker`). Only Nginx is published; MySQL, MongoDB, Redis, Eureka, and
the Java services remain inside the Docker network.

## 4. Firewall

If UFW is enabled, expose SSH and the web ports:

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

For production, put a TLS reverse proxy such as Caddy, Traefik, or host Nginx
in front of port 80. Google OAuth also requires its authorized redirect URI to
match the public HTTPS domain.

## 5. Updating the application

```bash
git pull
docker compose --env-file .env.docker up -d --build
docker image prune -f
```

Volumes are retained by the update command. Do not use `docker compose down -v`
unless all database data should be deleted.

## 6. Backup and restore

Create a SQL backup:

```bash
docker compose --env-file .env.docker exec -T mysql \
  mariadb-dump -uroot -p"$DB_ROOT_PASSWORD" db_rubric > backup.sql
```

Because shell variables are not automatically loaded from `.env.docker`, run
`set -a; source .env.docker; set +a` first, or enter the password interactively.

To re-import the initial dump after a failed first import, inspect the logs,
fix the dump, and recreate only the database volume (this deletes its data):

```bash
docker compose --env-file .env.docker down
docker volume ls
# Confirm the exact project-prefixed volume name before removing it.
docker volume rm <project>_mysql-data
docker compose --env-file .env.docker up -d
```

## 7. Common checks

```bash
docker compose --env-file .env.docker logs mysql
docker compose --env-file .env.docker logs eureka-server
docker compose --env-file .env.docker logs api-gateway
docker compose --env-file .env.docker exec mysql \
  mariadb -ulms -p db_rubric -e 'SHOW TABLES;'
```

If a backend repeatedly reports connection refused, verify it uses Docker host
names (`mysql`, `mongodb`, `redis`, and `eureka-server`) rather than `localhost`.
