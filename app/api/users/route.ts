import { NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth";
import { PERMISSION_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export async function POST(request: Request) {
  const access = await requirePermission("team.manage");
  if (!access.ok) {
    return NextResponse.redirect(new URL("/dashboard/team?error=Sem permissão.", request.url));
  }

  const form = await request.formData();
  const entity = String(form.get("entity") ?? "create");

  try {
    if (entity === "toggle") {
      const userId = String(form.get("userId") ?? "");
      if (!userId) {
        throw new Error("Usuário inválido.");
      }

      const target = await prisma.user.findUnique({ where: { id: userId } });
      if (!target) {
        throw new Error("Usuário não encontrado.");
      }

      if (target.id === access.user.id) {
        throw new Error("Você não pode inativar seu próprio usuário.");
      }

      await prisma.user.update({
        where: { id: userId },
        data: { isActive: !target.isActive }
      });

      return NextResponse.redirect(new URL("/dashboard/team?success=Status atualizado.", request.url));
    }

    if (entity === "override") {
      const userId = String(form.get("userId") ?? "");
      const permissionKey = String(form.get("permissionKey") ?? "");
      const allowed = form.get("allowed") === "on";

      if (!PERMISSION_KEYS.includes(permissionKey as (typeof PERMISSION_KEYS)[number])) {
        throw new Error("Permissão inválida.");
      }

      const permission = await prisma.permission.findUnique({ where: { key: permissionKey } });
      if (!permission) {
        throw new Error("Permissão não encontrada.");
      }

      await prisma.userPermission.upsert({
        where: {
          userId_permissionId: {
            userId,
            permissionId: permission.id
          }
        },
        update: { allowed },
        create: {
          userId,
          permissionId: permission.id,
          allowed
        }
      });

      return NextResponse.redirect(new URL("/dashboard/team?success=Override salvo.", request.url));
    }

    const name = String(form.get("name") ?? "").trim();
    const email = String(form.get("email") ?? "").trim().toLowerCase();
    const password = String(form.get("password") ?? "");
    const roleId = String(form.get("roleId") ?? "");

    if (!name || !email || password.length < 8 || !roleId) {
      throw new Error("Dados incompletos. Senha deve ter ao menos 8 caracteres.");
    }

    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new Error("Função inválida.");
    }

    const passwordHash = await hashPassword(password);
    await prisma.user.create({
      data: { name, email, passwordHash, roleId }
    });

    return NextResponse.redirect(new URL("/dashboard/team?success=Colaborador cadastrado.", request.url));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar colaborador.";
    return NextResponse.redirect(new URL(`/dashboard/team?error=${encodeURIComponent(message)}`, request.url));
  }
}
