import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const DEFAULT_TTL_SECONDS = 60 * 60 * 12;

interface SignedEnvelope<T> {
  data: T;
  exp: number;
  iat: number;
}

export function createRandomToken(bytes = 32) {
  return base64UrlEncode(randomBytes(bytes));
}

export function encodeSignedPayload<T>(
  data: T,
  ttlSeconds = DEFAULT_TTL_SECONDS
): string {
  const now = Math.floor(Date.now() / 1000);
  const envelope: SignedEnvelope<T> = {
    data,
    exp: now + ttlSeconds,
    iat: now,
  };
  const payload = base64UrlEncode(Buffer.from(JSON.stringify(envelope), "utf8"));
  return `${payload}.${sign(payload)}`;
}

export function decodeSignedPayload<T>(value: string | undefined): T | null {
  if (!value) return null;

  const [payload, signature] = value.split(".");
  if (!payload || !signature || !isValidSignature(payload, signature)) {
    return null;
  }

  try {
    const envelope = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf8")
    ) as SignedEnvelope<T>;

    if (typeof envelope.exp !== "number" || envelope.exp < Date.now() / 1000) {
      return null;
    }

    return envelope.data;
  } catch {
    return null;
  }
}

function sign(payload: string) {
  return createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("base64url");
}

function isValidSignature(payload: string, signature: string) {
  const expected = Buffer.from(sign(payload), "base64url");
  const actual = Buffer.from(signature, "base64url");

  return expected.length === actual.length && timingSafeEqual(expected, actual);
}

function getSessionSecret() {
  const secret = process.env.AUTH_SESSION_SECRET;

  if (!secret || secret.length < 32) {
    throw new Error("AUTH_SESSION_SECRET must be at least 32 characters.");
  }

  return secret;
}

function base64UrlEncode(value: Buffer) {
  return value.toString("base64url");
}
