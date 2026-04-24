type PageProps = {
  searchParams?: {
    error?: string;
  };
};

export default function LoginPage({ searchParams }: PageProps) {
  const error = searchParams?.error;

  return (
    <main className="auth-wrap">
      <section className="card auth-card">
        <h1 className="header-title">Acesso ao Sistema</h1>
        <p className="muted">Entre com seu e-mail e senha.</p>

        {error ? <p className="message message-error">{error}</p> : null}

        <form action="/api/auth/login" method="post" className="grid" style={{ marginTop: "1rem" }}>
          <label>
            E-mail
            <input className="input" name="email" type="email" required />
          </label>
          <label>
            Senha
            <input className="input" name="password" type="password" required />
          </label>
          <button className="btn btn-primary" type="submit">
            Entrar
          </button>
        </form>

        <p className="muted" style={{ marginTop: "1rem", fontSize: "0.9rem" }}>
          Primeiro acesso: use o usuário criado no seed (`SUPER_ADMIN_EMAIL`).
        </p>
      </section>
    </main>
  );
}
