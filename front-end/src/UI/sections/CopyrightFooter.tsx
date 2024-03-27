export function CopyrightFooter() {
  return (
    <footer
      style={{
        backgroundColor: "#111",
        position: "fixed",
        width: "100%",
        height: "5vh",
        left: "0",
        bottom: "0",
      }}
    >
      <p
        style={{
          color: "#DDE4E1",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "cursive",
          fontWeight: "100",
          opacity: "0.67",
          margin: "0",
        }}
      >
        © Fabricio Porras Morera & Carlos Solis Mora
      </p>
    </footer>
  );
}
