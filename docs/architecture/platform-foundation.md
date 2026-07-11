# DRAVIK Platform Foundation — Architecture Design

> Status: Proposed (superseded in key areas) · Date: 2026-06-10
> **See [../planning/phases.md](../planning/phases.md) for the current reconciled phase model and status.**
> Scope: identity, multi-tenancy, authorization, entitlements, API, database, deployment, and the
> extraction path for CRM, Realty, Lending, Marketing, Referrals, Broker Suite, and Client Portal.
> Companion to the repository assessment (frontend prototype, clean domain boundaries, no backend).
> Note: implementation-spec.md + phases.md supersede the phase numbering and `apps/web` layout details here.

**Key decisions up front:** one Entra External ID tenant for all end users (brokerage = *application*
tenant, never an Entra tenant); a single shared Postgres database with one schema per module,
`tenant_id` on every row, and Row-Level Security as the isolation backstop; one modular-monolith API
service in TypeScript behind a Next.js BFF; authorization resolved from the database (not from token
claims); entitlements modeled as a tenant-level snapshot computed from subscriptions and cached;
three Container Apps (`web`, `api`, `worker`) in one environment, scaling by KEDA; extraction later
is "lift a module folder + its schema + its event topics," which the design makes mechanical rather
than surgical.

---

## 1. Domain model

Tenancy and identity form a **core platform domain** that every module depends on; business modules
own their entities and reference across boundaries by ID only — exactly the discipline the current
codebase already approximates with its `linkedLeadId`-style soft references.

**Core platform (owned by no business module):**

- **Tenant** — a brokerage. Holds branding, custom domain, locale, status. The unit of isolation,
  billing, and entitlement.
- **Office / Team** — sub-structures within a tenant (the existing HierarchyView implies this).
- **User** — one record per human, keyed by Entra `oid`. A user exists once globally, not per tenant.
- **Membership** — (user, tenant) pair with status. A user can belong to multiple tenants — the
  referral network makes this a hard requirement, not a nicety (a partner agent at another brokerage
  is a member of two tenants).
- **RoleAssignment** — (membership, role, optional scope: office/team).
- **Invitation** — pending membership; this is how agents and clients onboard (invite-only, see §4).
- **AuditEvent** — append-only, platform-wide; the mock SecurityAuditLog becomes real here.

**Business modules and their entities:**

| Module | Owns | References (by ID only) |
|---|---|---|
| **CRM** | Lead, Activity, Conversation, Message, ProspectingCampaign, SellerLead | User (assignee) |
| **Realty** | Listing/Property, Transaction, TransactionParty, CommissionLine | Lead, User |
| **Lending** | LoanApplication, LoanDocument, LoanCondition | Lead, Transaction |
| **Marketing** | Campaign, Template, LandingPage, Flyer | Property |
| **Referrals** | PartnerAgent, Referral, SplitAgreement | Lead, User |
| **Broker Suite** | AgentProfile, CommissionPlan, ComplianceItem, TenantSettings | User |
| **Billing** | Plan, Subscription, AddOn, EntitlementSnapshot, Disbursement | Tenant, CommissionLine |
| **Client Portal** | PortalGrant (which client sees which transaction/loan), DocumentShare | Transaction, LoanApplication |
| **Command Center** | nothing — pure aggregation | everyone's read APIs |

Three ownership calls worth flagging because today's code scatters them: commission **plans** live
in Broker Suite (they're brokerage policy), commission **lines** live in Realty (they're facts about
a transaction), and **disbursements** live in Billing (they're money movement). The Client Portal
owns *grants*, not data — it projects Realty/Lending data through explicit sharing records, which
kills the current type duplication where portal types re-model transactions.

Conventions: every business row carries `tenant_id`; IDs are UUIDv7 (time-ordered, index-friendly);
all timestamps ISO-8601 UTC — this retires the `"May 15"` display strings in the mortgage fixtures
at the contract level.

## 2. Database architecture

**Recommendation: one Azure Database for PostgreSQL Flexible Server, one database, one schema per
module** (`core`, `crm`, `realty`, `lending`, `marketing`, `referrals`, `broker`, `billing`,
`portal`), shared-schema multi-tenancy via `tenant_id` + Postgres Row-Level Security.

Rules that make extraction cheap later:

- **No cross-schema foreign keys.** `lending.loan_application.lead_id` is a plain UUID, validated at
  the application layer. FKs are allowed freely *within* a schema.
- **Module code touches only its own schema.** Cross-module reads go through the owning module's API
  or a subscribed projection — never a cross-schema JOIN. (Command Center and reporting are the
  exception, handled via read models, below.)
- **RLS on every tenant-scoped table**, keyed on a per-request `SET LOCAL app.tenant_id`. The
  repository layer also filters by tenant — RLS is the backstop, not the only line. A bug that
  forgets a WHERE clause leaks nothing.
- **Transactional outbox table per schema.** State change + outbox row commit atomically; a
  dispatcher publishes to Service Bus. This is the event backbone extraction will ride on.
- **Migrations are per-module folders**, owned by the module, applied in dependency order
  (`core` first).

Reporting/Command Center: don't let the dashboard re-introduce cross-module joins. Each module emits
events; a `reporting` read schema materializes the KPI projections the dashboard needs. (Near-term
pragmatism: a read-only reporting role with cross-schema SELECT is acceptable until events exist —
but treat it as scaffolding with a removal date.)

**Tradeoffs considered:**

| Option | Why not (now) |
|---|---|
| Database-per-tenant | Operationally heavy at brokerage counts in the hundreds; migrations × N; connection pool explosion. Keep as an *escape hatch* — the schema design (tenant_id everywhere) lets you peel a whale tenant onto a dedicated server later via logical replication. |
| Schema-per-tenant | Worst of both: migration fan-out without real isolation wins. |
| Database-per-module now | Premature distributed systems: you'd pay for cross-DB consistency before having a single paying tenant. Schema-per-module gives the boundary without the cost. |
| Azure SQL instead of Postgres | Viable (has RLS, elastic pools). Postgres wins on RLS ergonomics, PostGIS (the mapping/geo-farming features will want it), and exit options. |

Sensitive data: Lending will hold GLBA-class PII (income, credit scores). Plan for column-level
encryption (pgcrypto or app-layer) on those fields specifically, encrypted-at-rest everywhere by
default, and immutable audit storage (append-only table + periodic export to immutable Blob).

## 3. API architecture

**Recommendation: one separate API service (TypeScript — NestJS or Fastify with a module
convention), structured as a modular monolith, fronted by the Next.js app acting as a BFF.**

- **Shape:** `apps/api/src/modules/<module>/` each containing router, service, repository, and an
  `index.ts` public surface. Routes mount at `/api/v1/<module>/…`. Module-to-module calls in-process
  go through the public surface only — enforced by lint rules, same trick as the frontend boundaries.
- **BFF pattern:** the Next.js server holds the user's tokens and session (cookie-based, httpOnly);
  the browser never sees an access token. Server components and route handlers call `api`
  service-to-service with the user's token. This matters because there are two frontends with
  different trust levels (broker shell, client portal) sharing one API.
- **Contracts:** OpenAPI generated per module from typed schemas (zod), published from a shared
  `packages/contracts` workspace so web and api share types. This package *is* the future
  inter-service contract — when a module extracts, its contract file doesn't change.
- **Cross-cutting:** request pipeline order is fixed and non-negotiable — authenticate → resolve
  principal + memberships → bind tenant context → check role permission → check entitlement →
  handler. Errors as RFC 9457 problem+json. Idempotency keys on mutating endpoints that money or
  messaging touch. Async work (campaign sends, document processing, event dispatch) goes to the
  `worker` app via Service Bus, never inline.
- **Versioning:** URL-versioned (`/v1`); modules version independently after extraction.

**Tradeoffs:** Keeping the API *inside* Next.js route handlers (one deployable) is simpler and
legitimate for the next ~6 months, but it tangles UI and API scaling, makes the worker awkward, and
makes extraction a bigger leap — only choose it if the team is 1–2 people. .NET minimal APIs are the
strongest Entra/Azure pairing and a real alternative when hiring .NET; TypeScript is recommended
purely because the existing 25K-line codebase and team are TS — one language across the monorepo
compounds. A separate GraphQL layer is not warranted; the BFF gives the aggregation point GraphQL
would have provided.

An API gateway (Azure API Management) is **deferred**: with one API service it adds cost and hops
for little gain. The extraction trigger for APIM is the second independently-deployed service, when
stable public routing across services is needed.

## 4. Identity architecture (Entra External ID)

**Recommendation: one Entra External ID *external tenant* for all platform end users — agents,
brokers, and portal clients. DRAVIK staff stay in the corporate workforce tenant and reach the
platform through a separate admin surface.**

The critical non-decision to get right: **a brokerage is NOT an Entra tenant.** Application tenancy
lives in the `core.tenant` table. Creating an Entra directory per brokerage would mean per-brokerage
app registrations, user flows, and admin overhead — an operational dead end. Entra answers "who is
this human"; the database answers "what brokerages do they belong to and as what."

Structure:

- **App registrations:** `dravik-web` (confidential client, broker shell BFF), `dravik-portal`
  (confidential client, client portal BFF), `dravik-api` (exposes scopes like `api.access`; later
  per-module scopes if needed). Separate registrations for shell vs portal keep the two audiences'
  redirect URIs, session policies, and conditional access independent — they are different attack
  surfaces.
- **Flows:** OIDC authorization code + PKCE via the BFFs. Email + password and email OTP for
  clients; require MFA for broker-side roles (Entra External ID supports MFA policies). Social IdPs
  optional for portal clients only.
- **Onboarding is invite-only for both realms.** An agent exists because a Broker Admin invited them
  (creates Invitation → user signs up → Membership activates). A client exists because an agent
  shared a transaction (creates PortalGrant + Invitation). Open self-service sign-up creates orphan
  users with no tenant — disable it.
- **Claims:** keep tokens thin — `oid`, email, name. Do **not** push roles or tenant lists into
  tokens via custom claim extensions. Reasons: per-tenant roles don't fit Entra app roles cleanly,
  entitlements change mid-session when subscriptions change, and stale claims in long-lived tokens
  become authorization bugs. The API resolves principal → memberships → roles from `core` (cached)
  on each request.
- **White-label sign-in:** Entra External ID custom branding covers the basics; tenant-specific look
  is handled at the BFF (tenant resolved from custom domain/subdomain before redirecting to Entra).

**Alternatives:** Azure AD B2C is the legacy path — Microsoft has positioned External ID as its
successor; don't start new on B2C in 2026. Auth0/Okta would work and have nicer per-tenant
organization primitives (Auth0 Organizations), but the Azure-native integration (managed identities,
conditional access, same support contract) justifies Entra. Two separate external tenants
(staff-of-brokerage vs clients) adds isolation but doubles flow maintenance; the app-registration
split achieves the separation more cheaply.

## 5. Authorization model

Four layers, evaluated in order, each answering a different question:

1. **Authentication** (Entra): who are you? → `oid`
2. **Tenant context**: which brokerage is this request operating in? Resolved from the request
   (custom domain / explicit tenant slug), then **verified against Membership** — a valid token for
   tenant A must never act in tenant B.
3. **RBAC**: what can your role do here? Roles are per-membership: `platform_admin` (DRAVIK staff,
   cross-tenant, heavily audited), `broker_owner`, `broker_admin`, `team_lead`, `agent`,
   `lending_officer`, `marketing_manager`, `client` (portal-only). Roles map to permissions shaped
   as `module.resource.action` (`crm.leads.read`, `realty.transactions.close`,
   `billing.subscription.manage`). Permissions are code-defined constants; role→permission mappings
   live in `core` so Broker Owners can eventually customize within guardrails.
4. **Resource scope**: can you touch *this record*? Agents see their own leads; team leads see their
   team's; broker admins see the tenant's. Clients see only records a PortalGrant names. This layer
   is repository-level predicates, not middleware.

The current hardcoded `"Chris M."` assignee filter in the leads page becomes layer 4.

**Tradeoffs:** A full policy engine (OPA, Cerbos, SpiceDB/ReBAC) is the upgrade path if permission
logic becomes graph-shaped (deal-level collaborator sharing across teams hints it might). Start with
the table-driven RBAC + scope predicates — it's auditable, fast, and 90% of a brokerage's model is
hierarchical, which RBAC + team scoping handles. Entra app roles as the RBAC source were rejected in
§4: they're per-application, not per-(user, brokerage).

## 6. Entitlement model

Entitlements answer a question RBAC must never answer: **what did this tenant pay for?** Keep the
two systems separate — a Broker Owner (top role) at a Core-plan brokerage still can't open Lending
if the plan excludes it.

- **Plan** → a versioned bundle of **features** with **limits**: module gates (`lending.enabled`),
  capacity (`crm.seats: 25`, `marketing.landing_pages: 10`), and metered allowances
  (`marketing.sms_credits: 1000/mo`).
- **Subscription** — tenant ↔ plan + add-ons + state (`trialing`, `active`, `past_due`,
  `canceled`), synced from the payment provider by webhook.
- **EntitlementSnapshot** — the computed, denormalized answer (plan + add-ons + manual overrides for
  enterprise deals), cached in Redis, invalidated by Billing events. Enforcement reads the snapshot,
  never recomputes from subscription state — this keeps the per-request check at sub-millisecond and
  gives one place for grace-period policy (e.g., `past_due` → read-only mode rather than lockout).
- **Enforcement points:** API middleware rejects calls into ungated modules (`403` with a
  machine-readable `entitlement_required` problem type); the web shell uses the same snapshot to
  render nav — the existing `[module]` catch-all "Coming Soon" page becomes the upgrade prompt;
  limits enforce at creation time (seat invites, page publishes); metered usage decrements via the
  worker.

**Billing provider:** Stripe Billing recommended (subscription lifecycle, dunning, tax, usage-based
pricing are solved problems); Azure Marketplace only if Microsoft co-sell motions are expected — it
can be added beside Stripe later. Building subscription state machines in-house is the classic trap;
don't.

## 7. Container architecture (Azure Container Apps)

One ACA **environment per runtime stage** (dev, staging, prod), three apps to start:

```
Internet
   │
Azure Front Door (WAF, custom domains per tenant, TLS)
   │
   ├──► web    (Next.js BFF: shell + portal)   ext. ingress, scale on HTTP concurrency
   │              │ internal call
   │              ▼
   ├──► api    (modular monolith)              INTERNAL ingress only
   │
   └─ (no route) worker (outbox dispatch,      no ingress, KEDA scale on
                  Service Bus consumers, cron)  Service Bus queue length, min 0

Supporting: PostgreSQL Flexible Server · Azure Cache for Redis · Service Bus
            Blob Storage (documents) · Key Vault · ACR · Log Analytics/App Insights
```

- **`api` is internal-only ingress** — reachable from `web` and `worker` inside the environment,
  never from the internet. This single decision removes a whole attack-surface class while
  pre-extraction.
- **Managed identities everywhere**: web→api auth, api→Postgres (Entra auth to Flexible Server),
  →Key Vault, →Service Bus, →Blob. Zero connection strings in app config.
- **Revisions** give blue/green per app; deploy via GitHub Actions → ACR → `az containerapp update`,
  with migration jobs run as ACA Jobs before traffic shift.
- **Per-tenant custom domains** terminate at Front Door, which passes the hostname through — that's
  the white-label hook from §4.
- **Extraction-ready:** when a module becomes a service, it's a fourth container app in the same
  environment; Front Door/ingress rules re-point `/api/v1/<module>/*`; nothing else moves.

**Why ACA over the alternatives:** AKS buys service mesh, custom operators, and pain not needed
below ~10 services and a platform team; App Service is simpler but its multi-service story (one plan
per app, weak eventing scale rules) ages badly against the extraction roadmap. ACA sits in the
middle deliberately: KEDA-native scaling, scale-to-zero for the worker, Dapr available later for
service invocation/pub-sub abstractions. The honest cost of ACA: less control over node-level
concerns and occasionally lagging K8s features — acceptable here.

## 8. Recommended repository structure

Monorepo (pnpm workspaces + Turborepo), structured so a module's extraction is a directory move:

```
dravik/
├─ apps/
│  ├─ web/                      # Next.js BFF (shell + portal routes)
│  ├─ api/
│  │  └─ src/
│  │     ├─ platform/           # core: tenancy, identity, rbac, entitlements, audit
│  │     └─ modules/
│  │        ├─ crm/             # router/ service/ repo/ events/ index.ts (public surface)
│  │        ├─ realty/  lending/  marketing/  referrals/
│  │        ├─ broker/  billing/  portal/
│  │        └─ ...
│  └─ worker/                   # outbox dispatcher, consumers, scheduled jobs
├─ packages/
│  ├─ contracts/                # per-module zod schemas + generated OpenAPI types
│  ├─ ui/                       # design system (extracted from current components/ui + tokens)
│  └─ config/                   # eslint (incl. boundary rules), tsconfig bases
├─ db/
│  └─ migrations/{core,crm,realty,lending,...}/
├─ infra/                       # Bicep or Terraform: ACA env, Postgres, SB, Redis, FD, KV
└─ .github/workflows/
```

Boundary enforcement is lint-level (`eslint-plugin-boundaries` or dependency-cruiser): module A
imports module B only via `modules/b/index.ts` or `packages/contracts`. The current frontend's
domain folders map 1:1 into `apps/web` feature folders mirroring the same module names. Polyrepo is
deferred until a module is *deployed* separately — and even then, extracting only the deployable
while contracts stay in the monorepo is a sound middle state.

## 9. Migration phases

**Phase 0 — Hygiene (week 1).** Carry-over from the assessment: install deps, resolve the nested
`agency-agents` repo, settle naming under Dravik, CI with lint + typecheck + build + Playwright
smoke over all 14 routes. *Exit: green pipeline on every PR.*

**Phase 1 — Identity & infra skeleton (weeks 2–4).** Provision via IaC: ACA env, Postgres, Redis,
Service Bus, Key Vault, Front Door. Stand up the Entra external tenant, app registrations, BFF auth
in `web` (login works, session cookie, signed-in shell). `core` schema: tenant, user, membership,
role assignment, invitation. Seed one real tenant. *Exit: an invited agent signs in via Entra and
sees the shell scoped to their brokerage; portal and shell sessions are separate.*

**Phase 2 — API spine + first module (weeks 4–8).** `api` app with the full middleware pipeline
(authN → tenant → RBAC → entitlement stub), `crm` schema + migrations, and the Leads page converted
from `SAMPLE_LEADS` fixtures to the API. This proves every layer end-to-end on the highest-traffic
domain. Outbox + worker dispatching first events. *Exit: leads CRUD is real, RLS verified by test
(tenant A cannot read tenant B even with a buggy query), fixtures deleted for CRM.*

**Phase 3 — Module build-out (weeks 8–20).** Convert remaining modules in the assessment's coupling
order — Portal grants, Referrals, Marketing, Lending, Realty, Broker Suite — each as: schema →
contracts → API module → frontend rewire → fixture deletion. Command Center converts last, onto
reporting projections fed by events.

**Phase 4 — Billing & entitlements live (overlaps, weeks 16–22).** Stripe integration, plans,
subscription webhooks, EntitlementSnapshot + Redis cache, middleware gates flipped from stub to
enforcing, nav gating + upgrade page. *Exit: a Core-plan tenant is actually blocked from Lending,
and a plan upgrade unlocks it without redeploy.*

**Phase 5 — Operate, then extract on triggers (quarter 3+).** Extraction is now mechanical per
module — move the folder to a new app, move its schema to a dedicated DB (pg_dump or logical
replication; no cross-schema FKs to break), re-point ingress, contracts and topics unchanged. But
extract **only on a trigger**: divergent scale profile (Marketing's send bursts), independent team
ownership, or compliance isolation (Lending's PII makes it the likeliest candidate after Client
Portal). Client Portal goes first regardless — separate audience, separate attack surface, smallest
blast radius. No trigger, no extraction: a well-bounded modular monolith on ACA is a perfectly good
end-state for years.

---

**The one tradeoff that governs everything else:** this design consistently chooses *logical*
separation now (schemas, module folders, internal contracts) and defers *physical* separation
(services, databases) until a named trigger fires. The cost is discipline — boundaries held by lint
rules and review rather than network gaps. The payoff is shipping a revenue-capable multi-tenant
platform on three containers and one database, with extraction remaining a week-scale move per
module instead of a rewrite. If team discipline is the thing trusted least, the first thing to
harden is the boundary linting in CI, not the infrastructure.
