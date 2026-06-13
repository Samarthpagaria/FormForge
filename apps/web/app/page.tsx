export default function Home() {
  return (
    <main style={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      flex: 1,
      padding: "2rem",
      textAlign: "center"
    }}>
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", marginBottom: "1rem" }}>
        FormForge
      </h1>
      <p style={{ color: "#6b7280" }}>
        Welcome to your clean Next.js application workspace.
      </p>
    </main>
  );
}

