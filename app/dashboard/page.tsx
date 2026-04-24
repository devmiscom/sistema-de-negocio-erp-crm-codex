import { prisma } from "@/lib/prisma";
import { ModuleCard } from "@/components/ModuleCard";

export default async function DashboardHome() {
  const setting = await prisma.systemSetting.findUnique({ where: { id: 1 } });

  return (
    <section className="container">
      <header className="card" style={{ marginBottom: "1rem" }}>
        <h1 className="header-title">{setting?.systemName ?? "Sistema ERP CRM"}</h1>
        <p className="muted" style={{ marginBottom: 0 }}>
          Plataforma web para Vendas & PDV, CRM e ERP. Módulo Financeiro está reservado para etapa futura.
        </p>
      </header>

      <div className="grid grid-3">
        <ModuleCard title="Vendas & PDV" description="Pedidos, itens, valores e produtividade comercial." href="/dashboard/sales" />
        <ModuleCard title="CRM" description="Clientes, leads e contatos com histórico do relacionamento." href="/dashboard/crm" />
        <ModuleCard title="ERP" description="Estoque, compras e notas fiscais (NF)." href="/dashboard/erp" />
        <ModuleCard title="Relatórios" description="Indicadores e estatísticas por módulo." href="/dashboard/reports" />
        <ModuleCard title="Colaboradores" description="Cadastro de funcionários e responsáveis por setor." href="/dashboard/team" />
        <ModuleCard title="Funções (Roles)" description="Permissões por função com checkboxes por área." href="/dashboard/roles" />
        <ModuleCard title="Uploads" description="Envio e gestão de arquivos por módulo/entidade." href="/dashboard/uploads" />
        <ModuleCard title="Configurações" description="Nome e cores do sistema (Super Admin)." href="/dashboard/settings" />
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Financeiro (Futuro)</h3>
          <p className="muted" style={{ marginBottom: 0 }}>
            Receita, pagamentos e fluxo de caixa ficarão para a próxima fase, conforme solicitado.
          </p>
        </div>
      </div>
    </section>
  );
}
