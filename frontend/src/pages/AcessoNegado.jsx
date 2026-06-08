export default function AcessoNegado() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f0f4ff",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          borderRadius: "16px",
          padding: "3rem",
          textAlign: "center",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          maxWidth: "400px",
        }}
      >
        <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🔒</div>
        <h1 style={{ color: "#1e3a8a", marginBottom: "1rem" }}>
          Acesso Negado
        </h1>
        <p style={{ color: "#64748b", marginBottom: "2rem" }}>
          Você não tem permissão para acessar esta página.
        </p>
        <a
          href="/"
          style={{
            backgroundColor: "#1e3a8a",
            color: "#fff",
            padding: "0.65rem 1.5rem",
            borderRadius: "8px",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Voltar ao início
        </a>
      </div>
    </div>
  );
}
