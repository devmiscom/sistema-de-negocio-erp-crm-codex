import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";
import { validateUploadBySystemSettings } from "@/lib/upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const access = await requirePermission("upload.manage");
  if (!access.ok) {
    return NextResponse.redirect(new URL("/dashboard/uploads?error=Sem permissão para upload.", request.url));
  }

  try {
    const form = await request.formData();
    const module = String(form.get("module") ?? "general").trim().toLowerCase();
    const entityType = String(form.get("entityType") ?? "").trim();
    const entityId = String(form.get("entityId") ?? "").trim();
    const file = form.get("file");

    if (!entityType || !entityId || !file || !(file instanceof File)) {
      throw new Error("Informe módulo, entidade e arquivo.");
    }

    const bytes = Buffer.from(await file.arrayBuffer());
    const { extension } = await validateUploadBySystemSettings(file.name, bytes.byteLength);

    const fileNameSafe = file.name.replace(/\s+/g, "_");
    const storedName = `${Date.now()}_${randomUUID()}.${extension}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    const destPath = path.join(uploadDir, storedName);
    const publicUrl = `/uploads/${storedName}`;

    await mkdir(uploadDir, { recursive: true });
    await writeFile(destPath, bytes);

    await prisma.attachment.create({
      data: {
        module,
        entityType,
        entityId,
        fileName: fileNameSafe,
        storedName,
        extension,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: bytes.byteLength,
        url: publicUrl,
        uploadedBy: access.user.id
      }
    });

    return NextResponse.redirect(new URL("/dashboard/uploads?success=Arquivo enviado com sucesso.", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha no upload.";
    return NextResponse.redirect(new URL(`/dashboard/uploads?error=${encodeURIComponent(message)}`, request.url));
  }
}
