import { NextResponse } from "next/server";
import { OrderStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export async function POST(request: Request) {
  const access = await requirePermission("sales.manage");
  if (!access.ok) {
    return NextResponse.redirect(new URL("/dashboard/sales?error=Sem permissão.", request.url));
  }

  const form = await request.formData();
  const entity = String(form.get("entity") ?? "");

  try {
    if (entity === "product") {
      const sku = String(form.get("sku") ?? "").trim().toUpperCase();
      const name = String(form.get("name") ?? "").trim();
      const price = Number(form.get("price") ?? 0);
      const stockQty = Number(form.get("stockQty") ?? 0);
      const minStockQty = Number(form.get("minStockQty") ?? 0);

      if (!sku || !name || !Number.isFinite(price) || price < 0) {
        throw new Error("Dados do produto inválidos.");
      }

      await prisma.product.create({
        data: {
          sku,
          name,
          price,
          stockQty: Math.max(0, stockQty),
          minStockQty: Math.max(0, minStockQty)
        }
      });

      return NextResponse.redirect(new URL("/dashboard/sales?success=Produto cadastrado.", request.url));
    }

    if (entity === "order") {
      const customerName = String(form.get("customerName") ?? "").trim();
      const description = String(form.get("description") ?? "").trim();
      const quantity = Number(form.get("quantity") ?? 0);
      const unitPrice = Number(form.get("unitPrice") ?? 0);

      if (!customerName || !description || !Number.isFinite(quantity) || quantity <= 0 || !Number.isFinite(unitPrice)) {
        throw new Error("Dados do pedido inválidos.");
      }

      const total = quantity * unitPrice;
      const orderNumber = `PED-${Date.now()}`;

      await prisma.salesOrder.create({
        data: {
          orderNumber,
          customerName,
          status: OrderStatus.OPEN,
          total,
          createdById: access.user.id,
          items: {
            create: {
              description,
              quantity,
              unitPrice,
              total
            }
          }
        }
      });

      return NextResponse.redirect(new URL("/dashboard/sales?success=Pedido criado.", request.url));
    }

    throw new Error("Ação de vendas inválida.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar venda.";
    return NextResponse.redirect(new URL(`/dashboard/sales?error=${encodeURIComponent(message)}`, request.url));
  }
}
