# Dependency Matrix

## Purpose
Make blocking relationships explicit before tasks are split across agents.

## Scope
This matrix defines spec-level dependencies, not implementation-level subtasks.

## Locked Decisions
- Product and design decisions feed every other layer.
- Frontend structure defines the frontend project layout, FSD rules, and routing/data placement policy.
- Project structure defines the repo topology and the backend hexagonal boundary policy.
- Frontend intake can block backend-facing specs if a frontend exists.
- Git workflow is cross-cutting and mandatory for all task decomposition.

## Interfaces and Responsibilities
- Product scope defines public behavior and editorial boundaries.
- Design system defines visual constraints and interaction language.
- Frontend structure defines FSD layers, route shells, route-tree ownership, and frontend data placement rules.
- Project structure defines top-level repo layout, backend module boundaries, port/adapter placement, and composition-root ownership.
- Frontend architecture defines routes, component layers, and API expectations.
- Data model defines entities, relationships, and state transitions.
- Backend architecture defines services, endpoints, auth, and moderation.
- Media storage defines upload and persistence rules.
- Admin CMS defines operational editing surfaces.
- Infra deployment defines runtime topology.
- Verification defines cross-layer quality gates.

## Data/Contracts Touched
- Page and route inventory
- Content entity contracts
- API contracts
- Upload and filesystem contracts
- Auth and moderation contracts

## Dependency Table
| From | Depends on | Reason |
| --- | --- | --- |
| Frontend Intake | README | Consumes harness rules and gate semantics. |
| Frontend Analyzer | Frontend Intake | Uses intake procedure and report expectations. |
| Product Scope | README | Establishes baseline product truth. |
| Design System | Product Scope | Needs locked IA and content surfaces. |
| Frontend Structure | Frontend Analyzer, Product Scope, Design System | Defines frontend folder boundaries, shells, and FSD rules from actual UI scope and analyzer reality. |
| Project Structure | README | Defines repo topology and backend hexagonal boundary rules before backend-facing specs are tasked. |
| Frontend Architecture | Frontend Analyzer, Product Scope, Design System, Frontend Structure | Must reconcile planned or existing frontend to product/design and apply the frontend structure policy concretely. |
| Backend Architecture | Frontend Intake, Frontend Analyzer, Product Scope, Frontend Architecture, Project Structure, Git Workflow | Backend tasks depend on frontend reconciliation, structural rules, and workflow policy. |
| Data Model | Frontend Intake, Frontend Analyzer, Product Scope, Frontend Architecture, Project Structure, Backend Architecture | Persistence design must follow the hexagonal backend core and actual UI contracts. |
| Media Storage | Project Structure, Backend Architecture, Data Model | Storage layout depends on backend port boundaries and persistence ownership. |
| Admin CMS | Product Scope, Design System, Frontend Structure, Frontend Architecture, Project Structure, Backend Architecture, Data Model | Admin depends on user flows, frontend shells, backend ports, and data rules. |
| Infra Deployment | Project Structure, Backend Architecture, Media Storage, Git Workflow | Infra reflects runtime services, backend composition-root needs, and release process. |
| Verification | Design System, Frontend Structure, Frontend Architecture, Project Structure, Backend Architecture, Data Model, Media Storage, Admin CMS, Infra Deployment | QA criteria derive from every implementation-facing layer and both structural policies. |

## Acceptance Checklist
- [ ] Every spec in the tracker appears here with explicit upstream dependencies.
- [ ] `frontend-structure.md` appears as a hard dependency for frontend-facing specs.
- [ ] `project-structure.md` appears as a hard dependency for backend-facing specs.
- [ ] No backend-facing spec omits frontend intake/analyzer dependencies.
- [ ] Cross-cutting specs are identified as blockers where appropriate.
- [ ] Dependency edges are compatible with the tasking rule in the tracker.

## Dependencies
- [tracker.md](/Users/vinicius/Projects/vinicius.dev/docs/specs/tracker.md)

## Open Questions
- None for the current harness draft.

## Task-Splitting Notes
- Use this file to sequence spec authoring and review tasks.
- When a spec changes its dependency surface, update this matrix in the same task branch.

## Git Branch Implications
- Dependency changes require their own task branch.
- Tasks that alter blocking relationships should not be bundled with unrelated spec edits.
