export type AuthProvider = "local" | "entra";

export function getAuthProvider(): AuthProvider {
  const configured = process.env.AUTH_PROVIDER?.trim().toLowerCase();

  if (configured === "local" || configured === "entra") {
    return configured;
  }

  return process.env.APP_ENV === "prod" ? "entra" : "local";
}

export function isLocalIdentityEnabled() {
  return getAuthProvider() === "local";
}

export function isEntraIdentityEnabled() {
  return getAuthProvider() === "entra";
}
