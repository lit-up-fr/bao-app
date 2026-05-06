import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 backdrop-blur-sm border-b"
      style={{ backgroundColor: "rgba(255,255,255,0.92)", borderColor: "rgba(43,52,66,0.1)" }}>
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold transition-colors"
            style={{ color: "var(--teal)" }}>
            Lit uP
          </span>
          <span className="text-sm hidden sm:inline"
            style={{ color: "rgba(43,52,66,0.5)" }}>
            la boîte à outils
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link href="/bao" className="transition-colors hover:opacity-80"
            style={{ color: "var(--dark)" }}>
            Outils
          </Link>
          <Link href="/parcours" className="transition-colors hover:opacity-80"
            style={{ color: "var(--dark)" }}>
            Parcours
          </Link>
        </nav>
      </div>
    </header>
  );
}
