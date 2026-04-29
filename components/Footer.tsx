export default function Footer() {
  return (
    <footer className="border-t border-litup-dark/10 bg-white mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-8 text-center text-sm text-litup-dark/50">
        <p>
          Gratuite, ouverte, faite pour être partagée.
        </p>
        <p className="mt-1">
          © {new Date().getFullYear()} Lit uP — Laboratoire pédagogique
        </p>
      </div>
    </footer>
  );
}
