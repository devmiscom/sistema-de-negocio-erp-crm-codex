import { AccessDenied } from "@/components/AccessDenied";
import { FlashMessage } from "@/components/FlashMessage";
import { PERMISSION_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

type PageProps = {
  searchParams?: { success?: string; error?: string };
};

export default async function RolesPage({ searchParams }: PageProps) {
  const allowed = await requirePermission("roles.manage");
  if (!allowed.ok) {
    return <AccessDenied />;
  }

  const [permissions, roles] = await Promise.all([
    prisma.permission.findMany({
      where: { key: { in: PERMISSION_KEYS } },
      orderBy: [{ module: "asc" }, { label: "asc" }]
    }),
    prisma.role.findMany({
      include: {
        rolePermissions: { include: { permission: true } }
      },
      orderBy: { createdAt: "desc" }
    })
  ]);

  return (
    <section className="container grid">
      <h1 className="header-title">Funções (User Roles)</h1>
      <FlashMessage success={searchParams?.success} error={searchParams?.error} />

      <form className="card grid" method="post" action="/api/roles">
        <h3 style={{ marginTop: 0 }}>Criar Função Personalizada</h3>
        <input className="input" name="name" placeholder="Ex: Comercial Sênior" required />
        <input type="hidden" name="entity" value="custom-role" />

        <div className="grid grid-3">
          {permissions.map((permission) => (
            <label key={permission.id} style={{ display: "flex", gap: "0.5rem", alignItems: "start" }}>
              <input type="checkbox" name="permissions" value={permission.key} />
              <span>
                <strong>{permission.module}</strong>
                <br />
                <span className="muted">{permission.label}</span>
              </span>
            </label>
          ))}
        </div>

        <button className="btn btn-primary" type="submit">
          Criar função
        </button>
      </form>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Funções Cadastradas</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Tipo</th>
                <th>Permissões</th>
              </tr>
            </thead>
            <tbody>
              {roles.map((role) => (
                <tr key={role.id}>
                  <td>{role.name}</td>
                  <td>{role.type}</td>
                  <td>
                    {role.rolePermissions.length
                      ? role.rolePermissions.map((rp) => rp.permission.key).join(", ")
                      : "Sem permissões"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
