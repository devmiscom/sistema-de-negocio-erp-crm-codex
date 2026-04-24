import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "sb_session";
const encoder = new TextEncoder();

type SessionToken = {
  userId: string;
  email: string;
};

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error("JWT_SECRET inválido. Defina um segredo forte no .env");
  }
  return encoder.encode(secret);
}

export async function createSessionToken(payload: SessionToken): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(payload.userId)
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(getSecret());
}

export async function verifySessionToken(token: string): Promise<SessionToken | null> {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return {
      userId: String(payload.userId ?? payload.sub ?? ""),
      email: String(payload.email ?? "")
    };
  } catch (_error) {
    return null;
  }
}
