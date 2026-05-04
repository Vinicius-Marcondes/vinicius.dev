# Infra environment and volume policy (INFRA-003)

## Environment isolation strategy

- Environment isolation is enforced by `COMPOSE_PROJECT_NAME`.
- Use different values per environment (for example `vinicius_dev` and `vinicius_prod`).
- Compose prefixes named volumes with that project name, keeping Postgres and media storage separate.

## Compose files

- Base: `docker-compose.yml` (shared and production-safe defaults).
- Development override: `docker-compose.dev.yml` (source bind mounts and install-on-start workflow).

## Env templates

- Development template: `.env.dev.example`
- Production template: `.env.prod.example`
- Generic template: `.env.example`

## Run examples

Development:

```bash
docker compose --env-file .env.dev -f docker-compose.yml -f docker-compose.dev.yml up -d
```

Production:

```bash
docker compose --env-file .env.prod -f docker-compose.yml up -d
```

## Secret policy

- Never commit real secrets.
- Keep committed files as placeholders/samples only (`change-me-*`).
- Production `.env` files must set `AUTH_SESSION_SECRET` and `AUTH_ROOM_PASSWORD_SECRET` to unique high-entropy values.
