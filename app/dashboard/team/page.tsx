import { AccessDenied } from "@/components/AccessDenied";
import { FlashMessage } from "@/components/FlashMessage";
import { PERMISSION_KEYS } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

type PageProps = {
  searchParams?: { success?: string; error?: string };
};

export default async function TeamPage({ searchParams }: PageProps) {
  const allowed = await requirePermission("team.manage");
  if (!allowed.ok) {
    return <AccessDenied />;
  }

  const [users, roles, permissions] = await Promise.all([
    prisma.user.findMany({
      include: { role: true },
      orderBy: { createdAt: "desc" }
    }),
    prisma.role.findMany({ orderBy: { name: "asc" } }),
    prisma.permission.findMany({
      where: { key: { in: PERMISSION_KEYS } },
      orderBy: { module: "asc" }
    })
  ]);

  return (
    <section className="container grid">
      <h1 className="header-title">Colaboradores</h1>
      <FlashMessage success={searchParams?.success} error={searchParams?.error} />

      <div className="grid grid-2">
        <form className="card grid" method="post" action="/api/users">
          <h3 style={{ marginTop: 0 }}>Novo Funcionário</h3>
          <input className="input" name="name" placeholder="Nome completo" required />
          <input className="input" name="email" placeholder="E-mail" type="email" required />
          <input className="input" name="password" placeholder="Senha inicial" type="password" minLength={8} required />
          <select className="select" name="roleId" required defaultValue="">
            <option value="">Selecione a função</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name}
              </option>
            ))}
          </select>
          <button className="btn btn-primary" type="submit">
            Cadastrar colaborador
          </button>
        </form>

        <form className="card grid" method="post" action="/api/users">
          <input type="hidden" name="entity" value="override" />
          <h3 style={{ marginTop: 0 }}>Permissão Individual (Override)</h3>
          <select className="select" name="userId" defaultValue="" required>
            <option value="">Selecione o colaborador</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name} ({user.email})
              </option>
            ))}
          </select>
          <select className="select" name="permissionKey" defaultValue="" required>
            <option value="">Selecione a permissão</option>
            {permissions.map((permission) => (
              <option key={permission.id} value={permission.key}>
                {permission.module} - {permission.label}
              </option>
            ))}
          </select>
          <label style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <input type="checkbox" name="allowed" defaultChecked />
            Permitir (desmarque para negar)
          </label>
          <button className="btn btn-primary" type="submit">
            Salvar override
          </button>
        </form>
      </div>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Lista de Colaboradores</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>E-mail</th>
                <th>Função</th>
                <th>Status</th>
                <th>Ação</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.role.name}</td>
                  <td>{user.isActive ? "Ativo" : "Inativo"}</td>
                  <td>
                    <form action="/api/users" method="post">
                      <input type="hidden" name="entity" value="toggle" />
                      <input type="hidden" name="userId" value={user.id} />
                      <button className="btn btn-secondary" type="submit">
                        {user.isActive ? "Inativar" : "Ativar"}
                      </button>
                    </form>
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
