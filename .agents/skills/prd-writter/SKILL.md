---
name: prd-writter
description: Create concise vinicius.dev PRDs from user feature ideas. Use when the user asks to create, draft, plan, or write a PRD for this repo, especially prompts like "let's create a PRD for..." or "plan this feature". The skill asks enough clarifying questions, follows docs/rules, creates docs/prds/PRD-###/PRD-###.md, and does not split tasks or implement code.
---

# PRD Writter

## Workflow
1. Read `docs/rules/AGENTS.md`, `docs/rules/supervised-workflow.md`, `docs/rules/prd-and-tracker.md`, `docs/rules/architecture.md`, and `docs/rules/product-and-platform.md`.
2. Read the user's feature description and identify unknowns that would affect product behavior, implementation, or acceptance.
3. Ask focused question batches until the PRD can be planned without major ambiguity. Prefer 3-7 questions per batch.
4. Scan `docs/prds/` and choose the next `PRD-###` ID.
5. Create `docs/prds/PRD-###/PRD-###.md` using the PRD template from `docs/rules/prd-and-tracker.md`.
6. Keep the PRD concise. Put detailed execution plans in future task files, not in the PRD.
7. Do not create task files, `docs/TRACKER.md`, branches, commits, or implementation changes.

## Question Coverage
Ask only what is needed, but cover these areas before writing:
- user-facing goal and success criteria
- included and excluded workflows
- affected public/admin surfaces
- data, API, media, auth, or deployment implications
- visual/product judgment that requires human review later
- deterministic acceptance criteria
- constraints, dependencies, and known risks

If the user explicitly says to make reasonable assumptions, proceed and record assumptions in the PRD.

## PRD Requirements
- Status starts as `DRAFT` unless Vinicius explicitly says the PRD is ready.
- Use `Ready` only after explicit approval.
- Include `Summary`, `Goals`, `Non-Goals`, `Context`, `Requirements`, `Implementation Overview`, `Acceptance Criteria`, and `Open Questions`.
- Make acceptance criteria checkbox-based.
- Keep `Implementation Overview` brief and sequencing-oriented.
- Preserve existing rules from `docs/rules/architecture.md` and `docs/rules/product-and-platform.md`.

## Stop Conditions
Stop and ask before writing if:
- the feature conflicts with a rule in `docs/rules/`
- the work needs secrets, production access, or external product decisions
- the requested PRD would mix unrelated initiatives
- the user asks for implementation before the PRD is accepted
