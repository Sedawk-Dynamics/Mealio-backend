import { SignJWT, jwtVerify } from "jose";

/**
 * Minimal session auth for the admin panel.
 *
 * On login we verify the username/password against the values in .env and,
 * if they match, issue a short JWT stored in an HttpOnly cookie. Middleware
 * and admin API routes verify that cookie on every request.
 */

export const SESSION_COOKIE = "mealio_admin_session";
const SESSION_DURATION_SECONDS = 60 * 60 * 8; // 8 hours

function getSecretKey(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("Missing AUTH_SECRET env var.");
  }
  return new TextEncoder().encode(secret);
}

/** Returns true when the supplied credentials match the .env admin creds. */
export function verifyCredentials(username: string, password: string): boolean {
  const expectedUser = process.env.ADMIN_USERNAME;
  const expectedPass = process.env.ADMIN_PASSWORD;
  if (!expectedUser || !expectedPass) {
    throw new Error("ADMIN_USERNAME / ADMIN_PASSWORD not configured.");
  }
  return username === expectedUser && password === expectedPass;
}

export async function createSessionToken(username: string): Promise<string> {
  return new SignJWT({ sub: username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION_SECONDS}s`)
    .sign(getSecretKey());
}

/** Verify a session token. Returns the payload or null if invalid/expired. */
export async function verifySessionToken(
  token: string | undefined | null
): Promise<{ sub: string; role: string } | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    if (payload.role !== "admin") return null;
    return { sub: String(payload.sub), role: String(payload.role) };
  } catch {
    return null;
  }
}

export const SESSION_MAX_AGE = SESSION_DURATION_SECONDS;
