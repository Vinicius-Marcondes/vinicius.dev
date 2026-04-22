# Project Structure

## Purpose
Define the canonical repo structure and the backend architectural boundary rules so all backend-facing specs and tasks follow one structural policy.

## Scope
Top-level repo layout, backend code organization, composition-root ownership, dependency-direction rules, and the structural expectations that downstream backend-facing specs must follow.

## Locked Decisions
- The repo keeps `frontend/`, `backend/`, `docs/`, and `scripts/` as top-level directories.
- `Project Structure` is the top-priority structural policy for backend-facing specs and tasks.
- The backend follows pure Hexagonal Architecture with one application hexagon.
- Backend core code is organized module-first under `content`, `chat`, `auth`, `admin`, `media`, and `shared`.
- The harness uses `inbound port`, `outbound port`, `inbound adapter`, `outbound adapter`, and `composition root` as the canonical boundary terms.
- `domain`, `application`, and `ports` stay inside the hexagon; adapters and framework code stay outside it.
- `bootstrap` is the only backend location that wires concrete adapters to core use cases for runtime and tests.
- Frontend remains a separate app; frontend-internal folder policy is defined separately in [frontend-structure.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/frontend-structure.md).
- This spec defines structural rules only and does not select an enforcement tool yet.

## Interfaces and Responsibilities
- Canonical backend target:

```text
backend/
  src/
    modules/
      content/
        domain/
        application/
        ports/
          inbound/
          outbound/
      chat/
        domain/
        application/
        ports/
          inbound/
          outbound/
      auth/
        domain/
        application/
        ports/
          inbound/
          outbound/
      admin/
        domain/
        application/
        ports/
          inbound/
          outbound/
      media/
        domain/
        application/
        ports/
          inbound/
          outbound/
      shared/
        domain/
        application/
    adapters/
      inbound/
        http/
          hono/
      outbound/
        persistence/
          prisma/
        storage/
          filesystem/
        mail/
        security/
        time/
        ids/
    bootstrap/
      config/
      container/
      server.ts
    tests/
      core/
      adapters/
      contracts/
```

- `backend/src/modules/*/domain`: entities, value objects, domain services, invariants, and domain rules only.
- `backend/src/modules/*/application`: use cases, orchestration, transaction boundaries, and use-case DTOs.
- `backend/src/modules/*/ports/inbound`: contracts that drivers call into the core.
- `backend/src/modules/*/ports/outbound`: contracts the core uses for persistence, storage, email, time, ids, security, and other external concerns.
- `backend/src/adapters/inbound`: Hono HTTP routes, controllers, presenters, and request mapping.
- `backend/src/adapters/outbound`: Prisma repositories, filesystem storage, email providers, password hashing, session/token implementations, and other integrations.
- `backend/src/bootstrap`: the backend composition root for configuration loading, dependency wiring, and server startup.
- `backend/src/tests`: core, adapter, and contract-focused tests that exercise the architecture boundary.

## Data/Contracts Touched
- repo folder layout
- module ownership and boundaries
- inbound and outbound port contracts
- adapter responsibilities
- dependency direction and composition-root rules
- test seam expectations

## Acceptance Checklist
- [ ] Repo structure keeps `frontend/`, `backend/`, `docs/`, and `scripts/` as top-level directories.
- [ ] Backend structure is defined as one application hexagon with module-first core organization.
- [ ] `domain`, `application`, and `ports` responsibilities are explicit and limited to core concerns.
- [ ] Inbound and outbound adapter responsibilities are explicit and kept outside the core.
- [ ] `bootstrap` is defined as the only backend wiring layer.
- [ ] Dependency direction prevents `domain` or `application` code from depending on adapters, frameworks, or provider SDKs.
- [ ] Cross-module core access is restricted to explicit contracts and shared core types.
- [ ] Frontend is explicitly kept separate and handed off to `frontend-structure.md` for frontend-internal rules.
- [ ] Backend-facing specs are required to align with this structure before task split.
- [ ] Explicit non-goal: implementation-time enforcement tooling is not selected in this spec.

## Dependencies
- [README.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/README.md)

## Open Questions
- Which automated boundary checks should later enforce these rules can be decided during implementation planning.

## Task-Splitting Notes
- No backend-facing implementation task should be created until this spec is approved and cited as a structural source.
- Backend tasks should describe the use case and ports first, then the adapters needed to satisfy them.
- Structural refactors should be isolated from behavior changes whenever possible.

## Git Branch Implications
- Structural policy changes use `spec/` branches.
- Backend tasks that reshape boundaries or module placement must reference this spec and avoid bundling unrelated feature changes.
