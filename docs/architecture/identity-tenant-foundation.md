# Identity and Tenant Foundation

This phase introduces the application-owned auth boundary that Azure identity
services will plug into later. The current implementation is intentionally local
and dependency-free: it proves routing, session shape, and test coverage before
production identity wiring.

## Boundaries

- **Command Center** uses an internal session cookie and protects the `(shell)`
  route group. It represents realtors, brokers, admins, and staff.
- **Client Portal** uses a separate client session cookie and protects `/portal`.
  Client sessions do not unlock the command center, and internal sessions do not
  unlock the client portal.
- Login pages are local stubs:
  - `/login`
  - `/portal/login`

## Tenant Model

The session includes a `TenantIdentity` so all future data access can be scoped to
the current brokerage/customer. The local fixture tenant is Dravik Realty; in
production this tenant context should come from the identity/token claims plus
the tenant registry.

## Azure Replacement Seam

Azure should replace only the session creation/validation internals:

- Microsoft Entra / Entra External ID validates the user.
- The app maps the identity to a tenant, role, permissions, and entitlements.
- The app keeps enforcing route boundaries, tenant context, and authorization.

Do not rely on hosting-only auth as the whole solution. Azure can authenticate
requests, but the app must still decide which tenant and area the principal may
access.

## Current Local Session Files

- `apps/command-center/src/auth/local-identity.ts`
- `apps/command-center/src/auth/server.ts`
- `packages/contracts/src/identity/session.ts`

These files are the intended swap point for production providers.
