import { LeadStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const LEAD_STATUS = new Set(["NEW", "QUALIFIED", "NEGOTIATION", "WON", "LOST"]);

export async function POST(request: Request) {
  const access = await requirePermission("crm.manage");
  if (!access.ok) {
    return NextResponse.redirect(new URL("/dashboard/crm?error=Sem permissão.", request.url));
  }

  const form = await request.formData();
  const entity = String(form.get("entity") ?? "");

  try {
    if (entity === "client") {
      const name = String(form.get("name") ?? "").trim();
      if (!name) {
        throw new Error("Nome do cliente é obrigatório.");
      }

      await prisma.client.create({
        data: {
          name,
          company: String(form.get("company") ?? "").trim() || null,
          email: String(form.get("email") ?? "").trim() || null,
          phone: String(form.get("phone") ?? "").trim() || null,
          notes: String(form.get("notes") ?? "").trim() || null
        }
      });

      return NextResponse.redirect(new URL("/dashboard/crm?success=Cliente cadastrado.", request.url));
    }

    if (entity === "lead") {
      const name = String(form.get("name") ?? "").trim();
      const statusRaw = String(form.get("status") ?? "NEW");

      if (!name || !LEAD_STATUS.has(statusRaw)) {
        throw new Error("Dados do lead inválidos.");
      }

      await prisma.lead.create({
        data: {
          name,
          source: String(form.get("source") ?? "").trim() || null,
          status: statusRaw as LeadStatus,
          email: String(form.get("email") ?? "").trim() || null,
          phone: String(form.get("phone") ?? "").trim() || null,
          notes: String(form.get("notes") ?? "").trim() || null
        }
      });

      return NextResponse.redirect(new URL("/dashboard/crm?success=Lead cadastrado.", request.url));
    }

    if (entity === "contact") {
      const name = String(form.get("name") ?? "").trim();
      if (!name) {
        throw new Error("Nome do contato é obrigatório.");
      }

      const clientIdRaw = String(form.get("clientId") ?? "").trim();
      const clientId = clientIdRaw || null;

      await prisma.contact.create({
        data: {
          name,
          email: String(form.get("email") ?? "").trim() || null,
          phone: String(form.get("phone") ?? "").trim() || null,
          clientId
        }
      });

      return NextResponse.redirect(new URL("/dashboard/crm?success=Contato cadastrado.", request.url));
    }

    throw new Error("Ação do CRM inválida.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar CRM.";
    return NextResponse.redirect(new URL(`/dashboard/crm?error=${encodeURIComponent(message)}`, request.url));
  }
}
