import { NextResponse } from "next/server";
import { deriveSessionToken, SESSION_COOKIE } from "@/lib/auth/token";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

export async function POST(request: Request) {
  const appPassword = process.env.APP_PASSWORD;

  if (!appPassword) {
    return NextResponse.json(
      { error: "認証は無効です（APP_PASSWORDが未設定）" },
      { status: 400 }
    );
  }

  let password: unknown;
  try {
    ({ password } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (typeof password !== "string" || password.length === 0) {
    return NextResponse.json(
      { error: "パスワードを入力してください" },
      { status: 400 }
    );
  }

  // Compare derived tokens rather than raw strings to avoid leaking
  // password length via timing
  const expected = await deriveSessionToken(appPassword);
  const provided = await deriveSessionToken(password);

  if (provided !== expected) {
    return NextResponse.json(
      { error: "パスワードが正しくありません" },
      { status: 401 }
    );
  }

  const isHttps =
    request.headers.get("x-forwarded-proto") === "https" ||
    new URL(request.url).protocol === "https:";

  const response = NextResponse.json({ success: true });
  response.cookies.set(SESSION_COOKIE, expected, {
    httpOnly: true,
    sameSite: "lax",
    secure: isHttps,
    maxAge: SESSION_MAX_AGE_SECONDS,
    path: "/",
  });
  return response;
}
