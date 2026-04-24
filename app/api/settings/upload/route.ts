import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { normalizeExtensions } from "@/lib/upload";

export async function POST(request: Request) {
  const access = await requirePermission("upload.manage");
  if (!access.ok) {
    return NextResponse.redirect(new URL("/dashboard/settings?error=Sem permissão para upload.", request.url));
  }

  const form = await request.formData();
  const allowedExtensionsRaw = String(form.get("allowedExtensions") ?? "");
  const maxFileSizeMb = Number(form.get("maxFileSizeMb") ?? 0);

  try {
    const normalized = normalizeExtensions(allowedExtensionsRaw);
    if (!normalized.length) {
      throw new Error("Informe ao menos uma extensão válida.");
    }

    if (!Number.isFinite(maxFileSizeMb) || maxFileSizeMb < 1 || maxFileSizeMb > 1024) {
      throw new Error("Tamanho máximo deve estar entre 1MB e 1024MB.");
    }

    await prisma.uploadSetting.upsert({
      where: { id: 1 },
      update: {
        allowedExtensions: normalized.join(","),
        maxFileSizeMb
      },
      create: {
        id: 1,
        allowedExtensions: normalized.join(","),
        maxFileSizeMb
      }
    });

    return NextResponse.redirect(new URL("/dashboard/settings?success=Regras de upload salvas.", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar upload.";
    return NextResponse.redirect(new URL(`/dashboard/settings?error=${encodeURIComponent(message)}`, request.url));
  }
}
