export const COMMAND_SESSION_COOKIE = "dravik_command_session";
export const CLIENT_SESSION_COOKIE = "dravik_client_session";

export const LOCAL_COMMAND_SESSION_VALUE = "local:command:chris";
export const LOCAL_CLIENT_SESSION_PREFIX = "local:client:";

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
} as const;
