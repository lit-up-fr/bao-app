import Link from "next/link";

export default function Header() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-litup-dark/10">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <span className="text-2xl font-bold text-litup-teal group-hover:text-litup-dark transition-colors">
            Lit uP
          </span>
          <span className="text-sm text-litup-dark/60 hidden sm:inline">
            la boîte à outils
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm font-semibold">
          <Link
            href="/bao"
            className="text-litup-dark/70 hover:text-litup-teal transition-colors"
          >
            Outils
          </Link>
          <Link
            href="/parcours"
            className="text-litup-dark/70 hover:text-litup-teal transition-colors"
          >
            Parcours
          </Link>
        </nav>
      </div>
    </header>
  );
}
