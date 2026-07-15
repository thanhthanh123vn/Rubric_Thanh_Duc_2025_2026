# MySQL initialization

Copy the database dump to this directory as `db_rubric.sql` before the first
`docker compose up`. MariaDB executes files in this directory only when the
`mysql-data` volume is empty.

Do not commit production dumps or secrets to Git.

