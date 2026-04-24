import { NextResponse } from "next/server";
import { RoleType } from "@prisma/client";
import { PERMISSION_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export async function POST(request: Request) {
  const access = await requirePermission("roles.manage");
  if (!access.ok) {
    return NextResponse.redirect(new URL("/dashboard/roles?error=Sem permissão.", request.url));
  }

  const form = await request.formData();
  const entity = String(form.get("entity") ?? "");

  try {
    if (entity !== "custom-role") {
      throw new Error("Ação inválida.");
    }

    const name = String(form.get("name") ?? "").trim();
    const selectedPermissionsRaw = form.getAll("permissions").map((item) => String(item));

    if (!name) {
      throw new Error("Nome da função é obrigatório.");
    }

    const selectedPermissions = selectedPermissionsRaw.filter((key) =>
      PERMISSION_KEYS.includes(key as (typeof PERMISSION_KEYS)[number])
    );

    const role = await prisma.role.create({
      data: {
        name,
        type: RoleType.CUSTOM,
        isSystem: false
      }
    });

    if (selectedPermissions.length) {
      const permissions = await prisma.permission.findMany({
        where: { key: { in: selectedPermissions } }
      });

      await prisma.rolePermission.createMany({
        data: permissions.map((permission) => ({
          roleId: role.id,
          permissionId: permission.id
        }))
      });
    }

    return NextResponse.redirect(new URL("/dashboard/roles?success=Função criada.", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar função.";
    return NextResponse.redirect(new URL(`/dashboard/roles?error=${encodeURIComponent(message)}`, request.url));
  }
}
