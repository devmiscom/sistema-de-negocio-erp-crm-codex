import { NextResponse } from "next/server";

export function apiError(message: string, status = 400) {
  return NextResponse.json({ ok: false, message }, { status });
}

export function backWithMessage(pathname: string, message: string, type: "success" | "error" = "success") {
  const url = new URL(pathname, "http://localhost");
  url.searchParams.set(type, message);
  return NextResponse.redirect(url);
}
