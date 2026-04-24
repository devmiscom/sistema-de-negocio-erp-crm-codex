export function AccessDenied({ message }: { message?: string }) {
  return (
    <section className="container">
      <div className="card">
        <h2 style={{ marginTop: 0 }}>Acesso não autorizado</h2>
        <p className="muted" style={{ marginBottom: 0 }}>
          {message ?? "Seu usuário não possui permissão para esta seção."}
        </p>
      </div>
    </section>
  );
}
