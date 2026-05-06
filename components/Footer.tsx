export default function Footer() {
  return (
    <footer className="border-t mt-auto" style={{ borderColor: "rgba(43,52,66,0.1)", backgroundColor: "white" }}>
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm" style={{ color: "rgba(43,52,66,0.4)" }}>
        <p>Gratuite, ouverte, faite pour être partagée.</p>
        <p className="mt-1">© {new Date().getFullYear()} Lit uP — Laboratoire pédagogique</p>
      </div>
    </footer>
  );
}
