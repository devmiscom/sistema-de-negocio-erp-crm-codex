import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/session-token";

export async function POST(request: Request) {
  const form = await request.formData();
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");

  if (!email || !password) {
    return NextResponse.redirect(new URL("/login?error=Preencha e-mail e senha.", request.url));
  }

  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });

  if (!user || !user.isActive) {
    return NextResponse.redirect(new URL("/login?error=Usuário inválido ou inativo.", request.url));
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    return NextResponse.redirect(new URL("/login?error=Senha incorreta.", request.url));
  }

  const token = await createSessionToken({ userId: user.id, email: user.email });
  cookies().set({
    name: SESSION_COOKIE_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8
  });

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
