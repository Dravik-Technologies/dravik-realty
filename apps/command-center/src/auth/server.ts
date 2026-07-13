import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type {
  ClientPortalSession,
  CommandCenterSession,
} from "@dravik/contracts/identity";
import {
  CLIENT_SESSION_COOKIE,
  COMMAND_SESSION_COOKIE,
  LOCAL_CLIENT_SESSION_PREFIX,
  LOCAL_COMMAND_SESSION_VALUE,
  SESSION_COOKIE_OPTIONS,
} from "./cookies";
import { isEntraAreaConfigured } from "./entra";
import {
  LOCAL_CLIENT_SESSIONS,
  LOCAL_COMMAND_SESSION,
} from "./local-identity";
import {
  isEntraIdentityEnabled,
  isLocalIdentityEnabled,
} from "./provider";
import {
  decodeSignedPayload,
  encodeSignedPayload,
} from "./session-codec";

export { isEntraAreaConfigured, isEntraIdentityEnabled, isLocalIdentityEnabled };

export async function getCommandSession(): Promise<CommandCenterSession | null> {
  if (isEntraIdentityEnabled()) {
    const cookieStore = await cookies();
    return decodeSignedPayload<CommandCenterSession>(
      cookieStore.get(COMMAND_SESSION_COOKIE)?.value
    );
  }

  if (!isLocalIdentityEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(COMMAND_SESSION_COOKIE)?.value;

  if (value !== LOCAL_COMMAND_SESSION_VALUE) {
    return null;
  }

  return LOCAL_COMMAND_SESSION;
}

export async function requireCommandSession(): Promise<CommandCenterSession> {
  const session = await getCommandSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function createCommandSession() {
  if (isEntraIdentityEnabled()) {
    if (isEntraAreaConfigured("command-center")) {
      redirect("/auth/command/sign-in");
    }

    redirect("/login");
  }

  const cookieStore = await cookies();
  cookieStore.set(
    COMMAND_SESSION_COOKIE,
    LOCAL_COMMAND_SESSION_VALUE,
    SESSION_COOKIE_OPTIONS
  );
}

export async function setCommandSession(session: CommandCenterSession) {
  const cookieStore = await cookies();
  cookieStore.set(
    COMMAND_SESSION_COOKIE,
    encodeSignedPayload(session),
    {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 12,
    }
  );
}

export async function clearCommandSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COMMAND_SESSION_COOKIE);
}

export async function getClientPortalSession(): Promise<ClientPortalSession | null> {
  if (isEntraIdentityEnabled()) {
    const cookieStore = await cookies();
    return decodeSignedPayload<ClientPortalSession>(
      cookieStore.get(CLIENT_SESSION_COOKIE)?.value
    );
  }

  if (!isLocalIdentityEnabled()) {
    return null;
  }

  const cookieStore = await cookies();
  const value = cookieStore.get(CLIENT_SESSION_COOKIE)?.value;

  if (!value?.startsWith(LOCAL_CLIENT_SESSION_PREFIX)) {
    return null;
  }

  const clientId = value.slice(LOCAL_CLIENT_SESSION_PREFIX.length);
  return LOCAL_CLIENT_SESSIONS[clientId] ?? null;
}

export async function requireClientPortalSession(): Promise<ClientPortalSession> {
  const session = await getClientPortalSession();

  if (!session) {
    redirect("/portal/login");
  }

  return session;
}

export async function createClientPortalSession(clientId: string) {
  if (isEntraIdentityEnabled()) {
    if (isEntraAreaConfigured("client-portal")) {
      redirect("/auth/portal/sign-in");
    }

    redirect("/portal/login");
  }

  const session = LOCAL_CLIENT_SESSIONS[clientId];

  if (!session) {
    redirect("/portal/login");
  }

  const cookieStore = await cookies();
  cookieStore.set(
    CLIENT_SESSION_COOKIE,
    `${LOCAL_CLIENT_SESSION_PREFIX}${clientId}`,
    SESSION_COOKIE_OPTIONS
  );
}

export async function setClientPortalSession(session: ClientPortalSession) {
  const cookieStore = await cookies();
  cookieStore.set(
    CLIENT_SESSION_COOKIE,
    encodeSignedPayload(session),
    {
      ...SESSION_COOKIE_OPTIONS,
      maxAge: 60 * 60 * 12,
    }
  );
}

export async function clearClientPortalSession() {
  const cookieStore = await cookies();
  cookieStore.delete(CLIENT_SESSION_COOKIE);
}
