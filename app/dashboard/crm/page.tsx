import { AccessDenied } from "@/components/AccessDenied";
import { FlashMessage } from "@/components/FlashMessage";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

type PageProps = {
  searchParams?: { success?: string; error?: string };
};

export default async function CrmPage({ searchParams }: PageProps) {
  const canView = await requirePermission("crm.view");
  if (!canView.ok) {
    return <AccessDenied />;
  }

  const canManage = await requirePermission("crm.manage");

  const [clients, leads, contacts] = await Promise.all([
    prisma.client.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 20 }),
    prisma.contact.findMany({
      include: { client: true },
      orderBy: { createdAt: "desc" },
      take: 20
    })
  ]);

  return (
    <section className="container grid">
      <h1 className="header-title">CRM</h1>
      <FlashMessage success={searchParams?.success} error={searchParams?.error} />

      {canManage.ok ? (
        <div className="grid grid-3">
          <form className="card grid" method="post" action="/api/crm">
            <input type="hidden" name="entity" value="client" />
            <h3 style={{ marginTop: 0 }}>Novo Cliente</h3>
            <input className="input" name="name" placeholder="Nome do cliente" required />
            <input className="input" name="company" placeholder="Empresa" />
            <input className="input" name="email" placeholder="E-mail" type="email" />
            <input className="input" name="phone" placeholder="Telefone" />
            <textarea className="textarea" name="notes" placeholder="Observações" />
            <button className="btn btn-primary" type="submit">
              Salvar cliente
            </button>
          </form>

          <form className="card grid" method="post" action="/api/crm">
            <input type="hidden" name="entity" value="lead" />
            <h3 style={{ marginTop: 0 }}>Novo Lead</h3>
            <input className="input" name="name" placeholder="Nome do lead" required />
            <input className="input" name="source" placeholder="Origem" />
            <select className="select" name="status" defaultValue="NEW">
              <option value="NEW">NEW</option>
              <option value="QUALIFIED">QUALIFIED</option>
              <option value="NEGOTIATION">NEGOTIATION</option>
              <option value="WON">WON</option>
              <option value="LOST">LOST</option>
            </select>
            <input className="input" name="email" placeholder="E-mail" type="email" />
            <input className="input" name="phone" placeholder="Telefone" />
            <textarea className="textarea" name="notes" placeholder="Observações" />
            <button className="btn btn-primary" type="submit">
              Salvar lead
            </button>
          </form>

          <form className="card grid" method="post" action="/api/crm">
            <input type="hidden" name="entity" value="contact" />
            <h3 style={{ marginTop: 0 }}>Novo Contato</h3>
            <input className="input" name="name" placeholder="Nome do contato" required />
            <input className="input" name="email" placeholder="E-mail" type="email" />
            <input className="input" name="phone" placeholder="Telefone" />
            <select className="select" name="clientId" defaultValue="">
              <option value="">Sem vínculo de cliente</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name}
                </option>
              ))}
            </select>
            <button className="btn btn-primary" type="submit">
              Salvar contato
            </button>
          </form>
        </div>
      ) : null}

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Clientes</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Empresa</th>
                <th>E-mail</th>
                <th>Telefone</th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.id}>
                  <td>{client.name}</td>
                  <td>{client.company || "-"}</td>
                  <td>{client.email || "-"}</td>
                  <td>{client.phone || "-"}</td>
                </tr>
              ))}
              {!clients.length ? (
                <tr>
                  <td colSpan={4}>Sem clientes cadastrados.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Leads</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Origem</th>
                <th>Status</th>
                <th>E-mail</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr key={lead.id}>
                  <td>{lead.name}</td>
                  <td>{lead.source || "-"}</td>
                  <td>
                    <span className="chip">{lead.status}</span>
                  </td>
                  <td>{lead.email || "-"}</td>
                </tr>
              ))}
              {!leads.length ? (
                <tr>
                  <td colSpan={4}>Sem leads cadastrados.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Contatos</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Telefone</th>
                <th>Cliente</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id}>
                  <td>{contact.name}</td>
                  <td>{contact.email || "-"}</td>
                  <td>{contact.phone || "-"}</td>
                  <td>{contact.client?.name || "-"}</td>
                </tr>
              ))}
              {!contacts.length ? (
                <tr>
                  <td colSpan={4}>Sem contatos cadastrados.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
