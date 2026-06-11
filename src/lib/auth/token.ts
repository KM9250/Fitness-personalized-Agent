// Session token derivation shared by the Edge middleware and Node API routes.
// Uses Web Crypto only, so it runs on both runtimes.

export const SESSION_COOKIE = "fitcoach_session";

const TOKEN_CONTEXT = "fitcoach-session-v1";

export async function deriveSessionToken(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(TOKEN_CONTEXT)
  );
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
