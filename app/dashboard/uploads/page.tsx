import { AccessDenied } from "@/components/AccessDenied";
import { FlashMessage } from "@/components/FlashMessage";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

type PageProps = {
  searchParams?: { success?: string; error?: string };
};

export default async function UploadsPage({ searchParams }: PageProps) {
  const allowed = await requirePermission("upload.manage");
  if (!allowed.ok) {
    return <AccessDenied />;
  }

  const [uploadSettings, attachments] = await Promise.all([
    prisma.uploadSetting.findUnique({ where: { id: 1 } }),
    prisma.attachment.findMany({
      include: { uploader: true },
      orderBy: { uploadedAt: "desc" },
      take: 25
    })
  ]);

  return (
    <section className="container grid">
      <h1 className="header-title">Arquivos e Uploads</h1>
      <FlashMessage success={searchParams?.success} error={searchParams?.error} />

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Regras atuais</h3>
        <p>
          <strong>Extensões:</strong> {uploadSettings?.allowedExtensions ?? "-"}
        </p>
        <p style={{ marginBottom: 0 }}>
          <strong>Tamanho máximo:</strong> {uploadSettings?.maxFileSizeMb ?? 0} MB
        </p>
      </article>

      <form className="card grid" action="/api/upload" method="post" encType="multipart/form-data">
        <h3 style={{ marginTop: 0 }}>Enviar arquivo</h3>
        <select className="select" name="module" defaultValue="sales">
          <option value="sales">Vendas</option>
          <option value="crm">CRM</option>
          <option value="erp">ERP</option>
          <option value="general">Geral</option>
        </select>
        <input className="input" name="entityType" placeholder="Ex: pedido, cliente, nota_fiscal" required />
        <input className="input" name="entityId" placeholder="ID da entidade no sistema" required />
        <input className="input" name="file" type="file" required />
        <button className="btn btn-primary" type="submit">
          Upload
        </button>
      </form>

      <article className="card">
        <h3 style={{ marginTop: 0 }}>Últimos arquivos</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Módulo</th>
                <th>Entidade</th>
                <th>Arquivo</th>
                <th>Tamanho</th>
                <th>Enviado por</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((attachment) => (
                <tr key={attachment.id}>
                  <td>{attachment.module}</td>
                  <td>
                    {attachment.entityType} ({attachment.entityId})
                  </td>
                  <td>
                    <a href={attachment.url} target="_blank" rel="noreferrer">
                      {attachment.fileName}
                    </a>
                  </td>
                  <td>{(attachment.sizeBytes / (1024 * 1024)).toFixed(2)} MB</td>
                  <td>{attachment.uploader.name}</td>
                  <td>{new Date(attachment.uploadedAt).toLocaleString("pt-BR")}</td>
                </tr>
              ))}
              {!attachments.length ? (
                <tr>
                  <td colSpan={6}>Nenhum arquivo enviado ainda.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </article>
    </section>
  );
}
