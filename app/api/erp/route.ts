import { InvoiceStatus, PurchaseStatus, StockMovementType } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

const PURCHASE_STATUS = new Set(["REQUESTED", "APPROVED", "RECEIVED", "CANCELLED"]);
const INVOICE_STATUS = new Set(["ISSUED", "CANCELLED"]);
const STOCK_TYPES = new Set(["IN", "OUT", "ADJUSTMENT"]);

export async function POST(request: Request) {
  const access = await requirePermission("erp.manage");
  if (!access.ok) {
    return NextResponse.redirect(new URL("/dashboard/erp?error=Sem permissão.", request.url));
  }

  const form = await request.formData();
  const entity = String(form.get("entity") ?? "");

  try {
    if (entity === "purchase") {
      const supplier = String(form.get("supplier") ?? "").trim();
      const total = Number(form.get("total") ?? 0);
      const statusRaw = String(form.get("status") ?? "REQUESTED");
      const number = `PC-${Date.now()}`;

      if (!supplier || !Number.isFinite(total) || total < 0 || !PURCHASE_STATUS.has(statusRaw)) {
        throw new Error("Dados de compra inválidos.");
      }

      await prisma.purchaseOrder.create({
        data: {
          number,
          supplier,
          total,
          status: statusRaw as PurchaseStatus
        }
      });

      return NextResponse.redirect(new URL("/dashboard/erp?success=Compra registrada.", request.url));
    }

    if (entity === "invoice") {
      const customerName = String(form.get("customerName") ?? "").trim();
      const total = Number(form.get("total") ?? 0);
      const issueDateRaw = String(form.get("issueDate") ?? "");
      const statusRaw = String(form.get("status") ?? "ISSUED");
      const number = `NF-${Date.now()}`;

      if (!customerName || !Number.isFinite(total) || total < 0 || !INVOICE_STATUS.has(statusRaw)) {
        throw new Error("Dados da NF inválidos.");
      }

      const issueDate = new Date(issueDateRaw);
      if (Number.isNaN(issueDate.getTime())) {
        throw new Error("Data de emissão inválida.");
      }

      await prisma.invoice.create({
        data: {
          number,
          customerName,
          issueDate,
          total,
          status: statusRaw as InvoiceStatus
        }
      });

      return NextResponse.redirect(new URL("/dashboard/erp?success=NF registrada.", request.url));
    }

    if (entity === "stock") {
      const productId = String(form.get("productId") ?? "");
      const typeRaw = String(form.get("type") ?? "");
      const quantity = Number(form.get("quantity") ?? 0);
      const reason = String(form.get("reason") ?? "").trim();
      const reference = String(form.get("reference") ?? "").trim() || null;

      if (!productId || !STOCK_TYPES.has(typeRaw) || !Number.isFinite(quantity) || quantity <= 0 || !reason) {
        throw new Error("Dados de estoque inválidos.");
      }

      await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({ where: { id: productId } });
        if (!product) {
          throw new Error("Produto não encontrado.");
        }

        let nextStock = product.stockQty;
        if (typeRaw === "IN") {
          nextStock += quantity;
        } else if (typeRaw === "OUT") {
          if (product.stockQty < quantity) {
            throw new Error("Estoque insuficiente para saída.");
          }
          nextStock -= quantity;
        } else {
          nextStock += quantity;
        }

        await tx.stockMovement.create({
          data: {
            productId,
            type: typeRaw as StockMovementType,
            quantity,
            reason,
            reference
          }
        });

        await tx.product.update({
          where: { id: productId },
          data: { stockQty: nextStock }
        });
      });

      return NextResponse.redirect(new URL("/dashboard/erp?success=Movimentação aplicada.", request.url));
    }

    throw new Error("Ação do ERP inválida.");
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao salvar ERP.";
    return NextResponse.redirect(new URL(`/dashboard/erp?error=${encodeURIComponent(message)}`, request.url));
  }
}
