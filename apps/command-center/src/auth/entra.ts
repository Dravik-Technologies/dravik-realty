import { createHash } from "node:crypto";
import { cookies } from "next/headers";
import {
  ConfidentialClientApplication,
  type AuthenticationResult,
  type Configuration,
} from "@azure/msal-node";
import type {
  ClientPortalSession,
  CommandCenterSession,
  InternalRole,
  TenantIdentity,
} from "@dravik/contracts/identity";
import { CORE_ROLE_PERMISSIONS, type CoreRoleKey } from "@dravik/database/core";
import { SESSION_COOKIE_OPTIONS } from "./cookies";
import {
  createRandomToken,
  decodeSignedPayload,
  encodeSignedPayload,
} from "./session-codec";

type AuthArea = "command-center" | "client-portal";
type CommandRole = Exclude<CoreRoleKey, "client">;

interface EntraAuthState {
  area: AuthArea;
  codeVerifier: string;
  nonce: string;
  returnTo: string;
  state: string;
}

interface EntraClaims {
  email?: string;
  family_name?: string;
  given_name?: string;
  name?: string;
  oid?: string;
  preferred_username?: string;
  sub?: string;
}

interface EntraConfig {
  authority: string;
  clientId: string;
  clientSecret: string;
  commandRedirectUri: string;
  knownAuthorities: string[];
  portalRedirectUri: string;
  postLogoutRedirectUri: string;
  scopes: string[];
}

const AUTH_STATE_TTL_SECONDS = 10 * 60;
const STATE_COOKIE_BY_AREA: Record<AuthArea, string> = {
  "client-portal": "dravik_entra_portal_state",
  "command-center": "dravik_entra_command_state",
};
const DEFAULT_ENTITLEMENTS = [
  "crm.enabled",
  "listings.enabled",
  "portal.enabled",
  "referrals.enabled",
  "transactions.enabled",
];
const DEFAULT_PORTAL_ENTITLEMENTS = ["portal.enabled"];
const ENTRA_REQUIRED_BASE_ENV = [
  "AUTH_SESSION_SECRET",
  "ENTRA_CLIENT_ID",
  "ENTRA_CLIENT_SECRET",
  "ENTRA_AUTHORITY or ENTRA_TENANT_ID",
] as const;

let cachedClient: ConfidentialClientApplication | null = null;

export function getEntraMissingConfig(area: AuthArea): string[] {
  const missing: string[] = [...ENTRA_REQUIRED_BASE_ENV].filter((key) => {
    if (key === "ENTRA_AUTHORITY or ENTRA_TENANT_ID") {
      return !process.env.ENTRA_AUTHORITY && !process.env.ENTRA_TENANT_ID;
    }

    if (key === "AUTH_SESSION_SECRET") {
      return !process.env.AUTH_SESSION_SECRET || process.env.AUTH_SESSION_SECRET.length < 32;
    }

    return !process.env[key];
  });

  if (!redirectUriForArea(area)) {
    missing.push(
      area === "command-center"
        ? "ENTRA_COMMAND_REDIRECT_URI or ENTRA_REDIRECT_URI"
        : "ENTRA_PORTAL_REDIRECT_URI or ENTRA_REDIRECT_URI"
    );
  }

  if (!allowedEmailsForArea(area).length) {
    missing.push(
      area === "command-center"
        ? "ENTRA_ALLOWED_EMAILS"
        : "ENTRA_PORTAL_ALLOWED_EMAILS"
    );
  }

  if (process.env.APP_ENV === "prod" && !process.env.ENTRA_POST_LOGOUT_REDIRECT_URI) {
    missing.push("ENTRA_POST_LOGOUT_REDIRECT_URI");
  }

  return missing;
}

export function isEntraAreaConfigured(area: AuthArea) {
  return getEntraMissingConfig(area).length === 0;
}

export async function createEntraSignInUrl(
  area: AuthArea,
  returnTo = area === "command-center" ? "/dashboard" : "/portal"
) {
  const config = getEntraConfig(area);
  const pkce = createPkcePair();
  const authState: EntraAuthState = {
    area,
    codeVerifier: pkce.verifier,
    nonce: createRandomToken(24),
    returnTo,
    state: createRandomToken(24),
  };

  await setAuthState(authState);

  return getEntraClient().getAuthCodeUrl({
    codeChallenge: pkce.challenge,
    codeChallengeMethod: "S256",
    nonce: authState.nonce,
    redirectUri: redirectUriFromConfig(config, area),
    responseMode: "query",
    scopes: config.scopes,
    state: authState.state,
  });
}

export async function completeEntraCommandSignIn(request: Request) {
  const result = await completeEntraCallback("command-center", request);
  return {
    redirectTo: result.returnTo,
    session: createCommandSessionFromResult(result.authResult),
  };
}

export async function completeEntraPortalSignIn(request: Request) {
  const result = await completeEntraCallback("client-portal", request);
  return {
    redirectTo: result.returnTo,
    session: createPortalSessionFromResult(result.authResult),
  };
}

export function createEntraLogoutUrl(area: AuthArea) {
  const config = getEntraConfig(area);
  const logout = new URL(`${config.authority.replace(/\/$/, "")}/oauth2/v2.0/logout`);
  logout.searchParams.set(
    "post_logout_redirect_uri",
    area === "command-center"
      ? config.postLogoutRedirectUri
      : portalLogoutRedirectUri(config)
  );
  return logout.toString();
}

async function completeEntraCallback(area: AuthArea, request: Request) {
  const requestUrl = new URL(request.url);
  const error = requestUrl.searchParams.get("error");

  if (error) {
    throw new Error(
      `Entra sign-in failed: ${error} ${requestUrl.searchParams.get("error_description") ?? ""}`.trim()
    );
  }

  const code = requestUrl.searchParams.get("code");
  const state = requestUrl.searchParams.get("state");
  const authState = await consumeAuthState(area);

  if (!code || !state || !authState || authState.state !== state) {
    throw new Error("Entra sign-in state could not be verified.");
  }

  const config = getEntraConfig(area);
  const authResult = await getEntraClient().acquireTokenByCode({
    code,
    codeVerifier: authState.codeVerifier,
    redirectUri: redirectUriFromConfig(config, area),
    scopes: config.scopes,
    state,
  });

  if (!authResult) {
    throw new Error("Entra did not return an authentication result.");
  }

  return {
    authResult,
    returnTo: authState.returnTo,
  };
}

function createCommandSessionFromResult(
  authResult: AuthenticationResult
): CommandCenterSession {
  const identity = extractIdentity(authResult);
  const role = commandRoleFromEnv();
  assertEmailAllowed("command-center", identity.email);

  return {
    area: "command-center",
    entitlements: parseList(process.env.ENTRA_BOOTSTRAP_ENTITLEMENTS, DEFAULT_ENTITLEMENTS),
    permissions: [...CORE_ROLE_PERMISSIONS[role]],
    tenant: tenantFromEnv(),
    user: {
      email: identity.email,
      id: identity.id,
      initials: initialsForName(identity.name, identity.email),
      name: identity.name,
      role: role as InternalRole,
      title: titleForRole(role),
    },
  };
}

function createPortalSessionFromResult(
  authResult: AuthenticationResult
): ClientPortalSession {
  const identity = extractIdentity(authResult);
  assertEmailAllowed("client-portal", identity.email);

  return {
    area: "client-portal",
    entitlements: parseList(
      process.env.ENTRA_PORTAL_BOOTSTRAP_ENTITLEMENTS,
      DEFAULT_PORTAL_ENTITLEMENTS
    ),
    permissions: [...CORE_ROLE_PERMISSIONS.client],
    tenant: tenantFromEnv(),
    user: {
      clientId: process.env.ENTRA_PORTAL_BOOTSTRAP_CLIENT_ID ?? identity.id,
      email: identity.email,
      id: identity.id,
      name: identity.name,
    },
  };
}

function extractIdentity(authResult: AuthenticationResult) {
  const claims = authResult.idTokenClaims as EntraClaims;
  const email =
    authResult.account?.username ??
    claims.email ??
    claims.preferred_username ??
    "";
  const name =
    authResult.account?.name ??
    claims.name ??
    [claims.given_name, claims.family_name].filter(Boolean).join(" ") ??
    email;
  const id = claims.oid ?? claims.sub ?? authResult.uniqueId ?? stableIdForEmail(email);

  if (!email) {
    throw new Error("Entra sign-in did not include an email claim.");
  }

  return {
    email: email.toLowerCase(),
    id,
    name: name || email,
  };
}

function getEntraClient() {
  cachedClient ??= new ConfidentialClientApplication(msalConfig());
  return cachedClient;
}

function getEntraConfig(area: AuthArea = "command-center"): EntraConfig {
  const missing = getEntraMissingConfig(area).filter(
    (item) => item !== "ENTRA_ALLOWED_EMAILS" && item !== "ENTRA_PORTAL_ALLOWED_EMAILS"
  );

  if (missing.length) {
    throw new Error(`Missing Entra auth configuration: ${missing.join(", ")}`);
  }

  return {
    authority: authorityFromEnv(),
    clientId: process.env.ENTRA_CLIENT_ID!,
    clientSecret: process.env.ENTRA_CLIENT_SECRET!,
    commandRedirectUri: redirectUriForArea("command-center") ?? redirectUriForArea(area)!,
    knownAuthorities: knownAuthoritiesFromEnv(),
    portalRedirectUri: redirectUriForArea("client-portal") ?? redirectUriForArea(area)!,
    postLogoutRedirectUri:
      process.env.ENTRA_POST_LOGOUT_REDIRECT_URI ??
      process.env.ENTRA_LOGIN_REDIRECT_URI ??
      process.env.ENTRA_REDIRECT_BASE_URL ??
      "http://localhost:3000/login",
    scopes: parseList(process.env.ENTRA_SCOPES, [
      "openid",
      "profile",
      "email",
      "offline_access",
    ]),
  };
}

function msalConfig(): Configuration {
  const config = getEntraConfig();
  return {
    auth: {
      authority: config.authority,
      clientId: config.clientId,
      clientSecret: config.clientSecret,
      knownAuthorities: config.knownAuthorities,
    },
  };
}

function authorityFromEnv() {
  if (process.env.ENTRA_AUTHORITY) {
    return process.env.ENTRA_AUTHORITY;
  }

  return `https://login.microsoftonline.com/${process.env.ENTRA_TENANT_ID}`;
}

function knownAuthoritiesFromEnv() {
  const configured = parseList(process.env.ENTRA_KNOWN_AUTHORITIES, []);
  if (configured.length) return configured;

  const host = safeHost(authorityFromEnv());
  return host.includes("ciamlogin.com") ? [host] : [];
}

function redirectUriForArea(area: AuthArea) {
  if (area === "command-center") {
    return process.env.ENTRA_COMMAND_REDIRECT_URI ?? process.env.ENTRA_REDIRECT_URI;
  }

  return process.env.ENTRA_PORTAL_REDIRECT_URI ?? process.env.ENTRA_REDIRECT_URI;
}

function redirectUriFromConfig(config: EntraConfig, area: AuthArea) {
  return area === "command-center"
    ? config.commandRedirectUri
    : config.portalRedirectUri;
}

function portalLogoutRedirectUri(config: EntraConfig) {
  return (
    process.env.ENTRA_PORTAL_POST_LOGOUT_REDIRECT_URI ??
    config.postLogoutRedirectUri.replace(/\/login$/, "/portal/login")
  );
}

async function setAuthState(authState: EntraAuthState) {
  const cookieStore = await cookies();
  cookieStore.set(
    STATE_COOKIE_BY_AREA[authState.area],
    encodeSignedPayload(authState, AUTH_STATE_TTL_SECONDS),
    {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: AUTH_STATE_TTL_SECONDS,
    }
  );
}

async function consumeAuthState(area: AuthArea) {
  const cookieStore = await cookies();
  const cookieName = STATE_COOKIE_BY_AREA[area];
  const state = decodeSignedPayload<EntraAuthState>(
    cookieStore.get(cookieName)?.value
  );
  cookieStore.delete(cookieName);

  return state?.area === area ? state : null;
}

function allowedEmailsForArea(area: AuthArea) {
  return parseList(
    area === "command-center"
      ? process.env.ENTRA_ALLOWED_EMAILS
      : process.env.ENTRA_PORTAL_ALLOWED_EMAILS,
    []
  ).map((email) => email.toLowerCase());
}

function assertEmailAllowed(area: AuthArea, email: string) {
  const allowed = allowedEmailsForArea(area);

  if (!allowed.includes(email.toLowerCase())) {
    throw new Error(`Entra user ${email} is not invited for ${area}.`);
  }
}

function tenantFromEnv(): TenantIdentity {
  return {
    id: process.env.ENTRA_BOOTSTRAP_TENANT_ID ?? "tenant_drvik_demo",
    name: process.env.ENTRA_BOOTSTRAP_TENANT_NAME ?? "Dravik Realty",
    plan: normalizeTenantPlan(process.env.ENTRA_BOOTSTRAP_TENANT_PLAN),
    slug: process.env.ENTRA_BOOTSTRAP_TENANT_SLUG ?? "dravik-realty",
    status: normalizeTenantStatus(process.env.ENTRA_BOOTSTRAP_TENANT_STATUS),
  };
}

function commandRoleFromEnv(): CommandRole {
  const configured = process.env.ENTRA_BOOTSTRAP_ROLE;

  if (configured && configured in CORE_ROLE_PERMISSIONS && configured !== "client") {
    return configured as CommandRole;
  }

  return "broker_owner";
}

function createPkcePair() {
  const verifier = createRandomToken(48);
  const challenge = createHash("sha256").update(verifier).digest("base64url");
  return { challenge, verifier };
}

function initialsForName(name: string, email: string) {
  const source = name || email;
  const parts = source
    .split(/[\s@._-]+/)
    .filter(Boolean)
    .slice(0, 2);

  return (parts.map((part) => part[0]).join("") || "DR").toUpperCase();
}

function titleForRole(role: CommandRole) {
  return role
    .split("_")
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(" ");
}

function normalizeTenantPlan(value: string | undefined): TenantIdentity["plan"] {
  return value === "starter" || value === "enterprise" ? value : "growth";
}

function normalizeTenantStatus(value: string | undefined): TenantIdentity["status"] {
  return value === "trialing" || value === "suspended" ? value : "active";
}

function parseList(value: string | undefined, fallback: string[]) {
  const parsed = value
    ?.split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parsed?.length ? parsed : fallback;
}

function stableIdForEmail(email: string) {
  return `entra_${createHash("sha256").update(email).digest("hex").slice(0, 24)}`;
}

function safeHost(value: string) {
  try {
    return new URL(value).host;
  } catch {
    return "";
  }
}
