import { AccessDenied } from "@/components/AccessDenied";
import { FlashMessage } from "@/components/FlashMessage";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/rbac";

type PageProps = {
  searchParams?: { success?: string; error?: string };
};

export default async function SettingsPage({ searchParams }: PageProps) {
  const canSystemSettings = await requirePermission("settings.manage");
  const canUploadSettings = await requirePermission("upload.manage");

  if (!canSystemSettings.ok && !canUploadSettings.ok) {
    return <AccessDenied />;
  }

  const [setting, upload] = await Promise.all([
    prisma.systemSetting.findUnique({ where: { id: 1 } }),
    prisma.uploadSetting.findUnique({ where: { id: 1 } })
  ]);

  return (
    <section className="container grid">
      <h1 className="header-title">Configurações</h1>
      <FlashMessage success={searchParams?.success} error={searchParams?.error} />

      {canSystemSettings.ok ? (
        <form className="card grid" action="/api/settings" method="post">
          <h3 style={{ marginTop: 0 }}>Personalização do Sistema (Super Admin)</h3>
          <input className="input" name="systemName" defaultValue={setting?.systemName ?? ""} required />
          <label>
            Cor primária
            <input className="input" name="primaryColor" defaultValue={setting?.primaryColor ?? "#0057B8"} required />
          </label>
          <label>
            Cor secundária
            <input className="input" name="secondaryColor" defaultValue={setting?.secondaryColor ?? "#0A2540"} required />
          </label>
          <button className="btn btn-primary" type="submit">
            Salvar identidade visual
          </button>
        </form>
      ) : (
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Identidade visual</h3>
          <p className="muted">Apenas SUPER_ADMIN pode alterar nome e cores do sistema.</p>
        </article>
      )}

      {canUploadSettings.ok ? (
        <form className="card grid" action="/api/settings/upload" method="post">
          <h3 style={{ marginTop: 0 }}>Uploads (Super Admin e Admin)</h3>
          <label>
            Extensões permitidas (separadas por vírgula)
            <input
              className="input"
              name="allowedExtensions"
              defaultValue={upload?.allowedExtensions ?? "doc,docx,pptx,pdf,jpg,png,webp,avif,mp4"}
              required
            />
          </label>
          <label>
            Tamanho máximo por arquivo (MB)
            <input className="input" name="maxFileSizeMb" type="number" min={1} defaultValue={upload?.maxFileSizeMb ?? 20} required />
          </label>
          <button className="btn btn-primary" type="submit">
            Salvar regra de upload
          </button>
        </form>
      ) : null}
    </section>
  );
}
