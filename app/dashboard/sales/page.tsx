import { AccessDenied } from "@/components/AccessDenied";
import { FlashMessage } from "@/components/FlashMessage";
import { brl } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

type PageProps = {
  searchParams?: { success?: string; error?: string };
};

export default async function SalesPage({ searchParams }: PageProps) {
  const canView = await requirePermission("sales.view");
  if (!canView.ok) {
    return <AccessDenied />;
  }

  const [products, orders, summary] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.salesOrder.findMany({
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 20
    }),
    prisma.salesOrder.aggregate({
      _count: true,
      _sum: { total: true },
      _avg: { total: true }
    })
  ]);

  const canManage = await requirePermission("sales.manage");

  return (
    <section className="container grid">
      <h1 className="header-title">Vendas & PDV</h1>
      <FlashMessage success={searchParams?.success} error={searchParams?.error} />

      <div className="grid grid-3">
        <article className="card">
          <p className="muted">Pedidos</p>
          <h2>{summary._count}</h2>
        </article>
        <article className="card">
          <p className="muted">Faturamento</p>
          <h2>{brl(summary._sum.total?.toString() ?? "0")}</h2>
        </article>
        <article className="card">
          <p className="muted">Ticket médio</p>
          <h2>{brl(summary._avg.total?.toString() ?? "0")}</h2>
        </article>
      </div>

      {canManage.ok ? (
        <div className="grid grid-2">
          <form className="card grid" action="/api/sales" method="post">
            <input type="hidden" name="entity" value="product" />
            <h3 style={{ marginTop: 0 }}>Novo Produto</h3>
            <label>
              SKU
              <input name="sku" className="input" required />
            </label>
            <label>
              Nome
              <input name="name" className="input" required />
            </label>
            <label>
              Preço
              <input name="price" className="input" type="number" step="0.01" required />
            </label>
            <label>
              Estoque
              <input name="stockQty" className="input" type="number" min={0} defaultValue={0} required />
            </label>
            <label>
              Estoque mínimo
              <input name="minStockQty" className="input" type="number" min={0} defaultValue={0} required />
            </label>
            <button className="btn btn-primary" type="submit">
              Salvar produto
            </button>
          </form>

          <form className="card grid" action="/api/sales" method="post">
            <input type="hidden" name="entity" value="order" />
            <h3 style={{ marginTop: 0 }}>Novo Pedido (PDV)</h3>
            <label>
              Cliente
              <input name="customerName" className="input" required />
            </label>
            <label>
              Descrição do item
              <input name="description" className="input" required />
            </label>
            <label>
              Quantidade
              <input name="quantity" className="input" type="number" min={1} defaultValue={1} required />
            </label>
            <label>
              Valor unitário
              <input name="unitPrice" className="input" type="number" step="0.01" min={0} required />
            </label>
            <button className="btn btn-primary" type="submit">
              Criar pedido
            </button>
          </form>
        </div>
      ) : null}

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Produtos</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>SKU</th>
                <th>Nome</th>
                <th>Preço</th>
                <th>Estoque</th>
                <th>Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id}>
                  <td>{p.sku}</td>
                  <td>{p.name}</td>
                  <td>{brl(p.price.toString())}</td>
                  <td>{p.stockQty}</td>
                  <td>{p.minStockQty}</td>
                </tr>
              ))}
              {!products.length ? (
                <tr>
                  <td colSpan={5}>Sem produtos cadastrados.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Últimos Pedidos</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Cliente</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.orderNumber}</td>
                  <td>{order.customerName}</td>
                  <td>
                    <span className="chip">{order.status}</span>
                  </td>
                  <td>{brl(order.total.toString())}</td>
                </tr>
              ))}
              {!orders.length ? (
                <tr>
                  <td colSpan={4}>Sem pedidos registrados.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
