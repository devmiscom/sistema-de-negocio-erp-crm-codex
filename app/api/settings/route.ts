import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

function isHexColor(color: string) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

export async function POST(request: Request) {
  const access = await requirePermission("settings.manage");
  if (!access.ok) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=Sem permissão para identidade visual.", request.url));
  }

  const form = await request.formData();
  const systemName = String(form.get("systemName") ?? "").trim();
  const primaryColor = String(form.get("primaryColor") ?? "").trim();
  const secondaryColor = String(form.get("secondaryColor") ?? "").trim();

  try {
    if (!systemName || !isHexColor(primaryColor) || !isHexColor(secondaryColor)) {
      throw new Error("Informe nome e cores HEX válidas (ex: #0057B8).");
    }

    await prisma.systemSetting.upsert({
      where: { id: 1 },
      update: { systemName, primaryColor, secondaryColor },
      create: { id: 1, systemName, primaryColor, secondaryColor }
    });

    return NextResponse.redirect(new URL("/dashboard/settings?success=Configurações salvas.", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar configurações.";
    return NextResponse.redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(message)}`, request.url));
  }
}
