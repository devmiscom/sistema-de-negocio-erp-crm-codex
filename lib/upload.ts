import path from "path";
import { prisma } from "@/lib/prisma";

export function normalizeExtensions(raw: string): string[] {
  return raw
    .split(",")
    .map((ext) => ext.trim().toLowerCase().replace(".", ""))
    .filter(Boolean);
}

export function getFileExtension(fileName: string): string {
  return path.extname(fileName).replace(".", "").toLowerCase();
}

export async function validateUploadBySystemSettings(fileName: string, sizeBytes: number) {
  const setting = await prisma.uploadSetting.findUnique({ where: { id: 1 } });
  if (!setting) {
    throw new Error("Configuração de upload não encontrada.");
  }

  const extension = getFileExtension(fileName);
  const allowed = normalizeExtensions(setting.allowedExtensions);

  if (!allowed.includes(extension)) {
    throw new Error(`Extensão .${extension} não permitida.`);
  }

  const maxBytes = setting.maxFileSizeMb * 1024 * 1024;
  if (sizeBytes > maxBytes) {
    throw new Error(`Arquivo excede o limite de ${setting.maxFileSizeMb}MB.`);
  }

  return { extension, setting };
}
