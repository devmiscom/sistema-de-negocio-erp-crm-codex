import { AccessDenied } from "@/components/AccessDenied";
import { brl } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

export default async function ReportsPage() {
  const allowed = await requirePermission("reports.view");
  if (!allowed.ok) {
    return <AccessDenied />;
  }

  const [salesAgg, leadsAgg, clientsCount, inventoryStats, purchasesAgg, invoicesAgg] = await Promise.all([
    prisma.salesOrder.aggregate({
      _count: true,
      _sum: { total: true },
      _avg: { total: true }
    }),
    prisma.lead.groupBy({
      by: ["status"],
      _count: { _all: true }
    }),
    prisma.client.count(),
    prisma.product.findMany({
      select: { sku: true, name: true, stockQty: true, minStockQty: true }
    }),
    prisma.purchaseOrder.aggregate({
      _count: true,
      _sum: { total: true }
    }),
    prisma.invoice.aggregate({
      _count: true,
      _sum: { total: true }
    })
  ]);

  const lowStockProducts = inventoryStats.filter((p) => p.stockQty <= p.minStockQty);

  return (
    <section className="container grid">
      <h1 className="header-title">Relatórios e Estatísticas</h1>

      <div className="grid grid-3">
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Vendas & PDV</h3>
          <p>Pedidos: {salesAgg._count}</p>
          <p>Faturamento: {brl(salesAgg._sum.total?.toString() ?? "0")}</p>
          <p>Ticket médio: {brl(salesAgg._avg.total?.toString() ?? "0")}</p>
        </article>

        <article className="card">
          <h3 style={{ marginTop: 0 }}>CRM</h3>
          <p>Clientes: {clientsCount}</p>
          {leadsAgg.map((lead) => (
            <p key={lead.status}>
              Leads {lead.status}: {lead._count._all}
            </p>
          ))}
          {!leadsAgg.length ? <p>Sem leads para estatísticas.</p> : null}
        </article>

        <article className="card">
          <h3 style={{ marginTop: 0 }}>ERP</h3>
          <p>Compras: {purchasesAgg._count}</p>
          <p>Total em compras: {brl(purchasesAgg._sum.total?.toString() ?? "0")}</p>
          <p>NF emitidas: {invoicesAgg._count}</p>
          <p>Total em NF: {brl(invoicesAgg._sum.total?.toString() ?? "0")}</p>
        </article>
      </div>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Estoque Crítico</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Produto</th>
                <th>Estoque atual</th>
                <th>Estoque mínimo</th>
              </tr>
            </thead>
            <tbody>
              {lowStockProducts.map((product) => (
                <tr key={product.sku}>
                  <td>{product.sku}</td>
                  <td>{product.name}</td>
                  <td>{product.stockQty}</td>
                  <td>{product.minStockQty}</td>
                </tr>
              ))}
              {!lowStockProducts.length ? (
                <tr>
                  <td colSpan={4}>Nenhum produto com estoque crítico no momento.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
