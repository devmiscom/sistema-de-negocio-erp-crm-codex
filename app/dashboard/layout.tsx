import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const setting = await prisma.systemSetting.findUnique({ where: { id: 1 } });

  return (
    <div className="dash-layout">
      <aside className="sidebar">
        <h2 style={{ marginTop: 0, marginBottom: "0.2rem" }}>{setting?.systemName ?? "Sistema ERP CRM"}</h2>
        <p style={{ marginTop: 0, opacity: 0.8, fontSize: "0.9rem" }}>
          {user.name} ({user.role.name})
        </p>

        <nav style={{ marginTop: "1rem" }}>
          <Link href="/dashboard">Início</Link>
          <Link href="/dashboard/sales">Vendas & PDV</Link>
          <Link href="/dashboard/crm">CRM</Link>
          <Link href="/dashboard/erp">ERP</Link>
          <Link href="/dashboard/reports">Relatórios</Link>
          <Link href="/dashboard/uploads">Arquivos</Link>
          <Link href="/dashboard/team">Colaboradores</Link>
          <Link href="/dashboard/roles">Funções (Roles)</Link>
          <Link href="/dashboard/settings">Configurações</Link>
        </nav>

        <form action="/api/auth/logout" method="post" style={{ marginTop: "1rem" }}>
          <button className="btn btn-secondary" type="submit">
            Sair
          </button>
        </form>
      </aside>

      <main className="main-content">{children}</main>
    </div>
  );
}
