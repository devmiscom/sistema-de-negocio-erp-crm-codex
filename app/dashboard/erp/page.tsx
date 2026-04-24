import { AccessDenied } from "@/components/AccessDenied";
import { FlashMessage } from "@/components/FlashMessage";
import { brl } from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

type PageProps = {
  searchParams?: { success?: string; error?: string };
};

export default async function ErpPage({ searchParams }: PageProps) {
  const canView = await requirePermission("erp.view");
  if (!canView.ok) {
    return <AccessDenied />;
  }

  const canManage = await requirePermission("erp.manage");

  const [products, purchases, invoices] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.purchaseOrder.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.invoice.findMany({ orderBy: { createdAt: "desc" }, take: 20 })
  ]);
  const lowStock = products.filter((product) => product.stockQty <= product.minStockQty).length;

  return (
    <section className="container grid">
      <h1 className="header-title">ERP</h1>
      <FlashMessage success={searchParams?.success} error={searchParams?.error} />

      <div className="grid grid-3">
        <article className="card">
          <p className="muted">Produtos</p>
          <h2>{products.length}</h2>
        </article>
        <article className="card">
          <p className="muted">Compras</p>
          <h2>{purchases.length}</h2>
        </article>
        <article className="card">
          <p className="muted">Estoque baixo</p>
          <h2>{lowStock}</h2>
        </article>
      </div>

      {canManage.ok ? (
        <div className="grid grid-2">
          <form className="card grid" method="post" action="/api/erp">
            <input type="hidden" name="entity" value="purchase" />
            <h3 style={{ marginTop: 0 }}>Nova Compra</h3>
            <input className="input" name="supplier" placeholder="Fornecedor" required />
            <input className="input" name="total" type="number" step="0.01" placeholder="Valor total" required />
            <select className="select" name="status" defaultValue="REQUESTED">
              <option value="REQUESTED">REQUESTED</option>
              <option value="APPROVED">APPROVED</option>
              <option value="RECEIVED">RECEIVED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button className="btn btn-primary" type="submit">
              Registrar compra
            </button>
          </form>

          <form className="card grid" method="post" action="/api/erp">
            <input type="hidden" name="entity" value="invoice" />
            <h3 style={{ marginTop: 0 }}>Nova NF</h3>
            <input className="input" name="customerName" placeholder="Cliente" required />
            <input className="input" name="total" type="number" step="0.01" placeholder="Valor total" required />
            <input className="input" name="issueDate" type="date" required />
            <select className="select" name="status" defaultValue="ISSUED">
              <option value="ISSUED">ISSUED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
            <button className="btn btn-primary" type="submit">
              Registrar NF
            </button>
          </form>

          <form className="card grid" method="post" action="/api/erp">
            <input type="hidden" name="entity" value="stock" />
            <h3 style={{ marginTop: 0 }}>Movimentar Estoque</h3>
            <select className="select" name="productId" required>
              <option value="">Selecione o produto</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.sku} - {product.name}
                </option>
              ))}
            </select>
            <select className="select" name="type" defaultValue="IN">
              <option value="IN">Entrada</option>
              <option value="OUT">Saída</option>
              <option value="ADJUSTMENT">Ajuste</option>
            </select>
            <input className="input" name="quantity" type="number" min={1} placeholder="Quantidade" required />
            <input className="input" name="reason" placeholder="Motivo" required />
            <input className="input" name="reference" placeholder="Referência (pedido/NF)" />
            <button className="btn btn-primary" type="submit">
              Aplicar movimentação
            </button>
          </form>
        </div>
      ) : null}

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Compras</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Fornecedor</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {purchases.map((purchase) => (
                <tr key={purchase.id}>
                  <td>{purchase.number}</td>
                  <td>{purchase.supplier}</td>
                  <td>
                    <span className="chip">{purchase.status}</span>
                  </td>
                  <td>{brl(purchase.total.toString())}</td>
                </tr>
              ))}
              {!purchases.length ? (
                <tr>
                  <td colSpan={4}>Sem compras registradas.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Notas Fiscais (NF)</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Número</th>
                <th>Cliente</th>
                <th>Data</th>
                <th>Status</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.number}</td>
                  <td>{invoice.customerName}</td>
                  <td>{new Date(invoice.issueDate).toLocaleDateString("pt-BR")}</td>
                  <td>
                    <span className="chip">{invoice.status}</span>
                  </td>
                  <td>{brl(invoice.total.toString())}</td>
                </tr>
              ))}
              {!invoices.length ? (
                <tr>
                  <td colSpan={5}>Sem notas fiscais registradas.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
