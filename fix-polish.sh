#!/bin/bash
# ============================================================
# BAO V6 — Polish design global (~15 min de travail)
# Fix Tailwind config + typo + espaces + cohérence couleurs
# ============================================================

set -e

echo "🎨 Polish design global..."

# ============================================================
# 1. TAILWIND CONFIG — safelist pour forcer la compilation
# ============================================================

cat > tailwind.config.ts << 'EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  safelist: [
    "bg-litup-dark", "bg-litup-teal", "bg-litup-gold", "bg-litup-violet", "bg-litup-light",
    "text-litup-dark", "text-litup-teal", "text-litup-gold", "text-litup-violet",
    "border-litup-teal", "border-litup-dark",
    "hover:text-litup-teal", "hover:border-litup-teal",
    "text-litup-dark/40", "text-litup-dark/50", "text-litup-dark/55", "text-litup-dark/60", "text-litup-dark/70",
    "bg-litup-dark/5", "bg-litup-dark/6", "bg-litup-dark/10",
    "border-litup-dark/10", "border-litup-dark/12",
  ],
  theme: {
    extend: {
      colors: {
        litup: {
          dark: "#2B3442",
          teal: "#00989D",
          gold: "#FCC33E",
          violet: "#6B2468",
          light: "#F6F6F8",
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
EOF

echo "  ✅ tailwind.config.ts (avec safelist)"

# ============================================================
# 2. GLOBALS.CSS — amélioration typo + finitions
# ============================================================

cat > app/globals.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600;1,700&display=swap');

:root {
  --dark: #2B3442;
  --teal: #00989D;
  --gold: #FCC33E;
  --violet: #6B2468;
  --light: #F6F6F8;
}

body {
  font-family: 'Source Sans 3', system-ui, sans-serif;
  color: #2B3442;
  background: #F6F6F8;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  line-height: 1.6;
}

html {
  scroll-behavior: smooth;
}

*:focus-visible {
  outline: 2px solid #00989D;
  outline-offset: 2px;
}

/* Better base typography */
h1, h2, h3, h4 {
  line-height: 1.25;
  letter-spacing: -0.01em;
}

h1 { font-weight: 700; }
h2 { font-weight: 700; }
h3 { font-weight: 700; }

p {
  line-height: 1.7;
}

/* Card gradient */
.card-gradient {
  background: linear-gradient(90deg, #00989D, #FCC33E);
}

/* Smooth transitions globally */
a, button {
  transition: all 0.2s ease;
}

/* Custom selection color */
::selection {
  background: rgba(0, 152, 157, 0.15);
  color: #2B3442;
}
EOF

echo "  ✅ app/globals.css"

# ============================================================
# 3. LAYOUT — police améliorée
# ============================================================

cat > app/layout.tsx << 'EOF'
import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Boîte à Outils — Lit uP",
  description:
    "Des outils qui donnent le pouvoir d'agir — aux jeunes comme aux équipes. Ressources pédagogiques pour l'accompagnement des jeunes 14-25 ans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
EOF

echo "  ✅ app/layout.tsx"

# ============================================================
# 4. PARCOURS LIST — design amélioré
# ============================================================

cat > app/parcours/page.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getParcours, slugify, type Parcours } from "@/lib/supabase";

export default function ParcoursListPage() {
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParcours().then((data) => { setParcours(data); setLoading(false); });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold" style={{ color: "#2B3442" }}>Parcours guidés</h1>
        <p className="mt-3 text-lg" style={{ color: "rgba(43,52,66,0.55)" }}>
          Des séquences d&apos;outils pensées pour accompagner pas à pas,
          de la première rencontre à l&apos;autonomie du groupe.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse" style={{ borderColor: "rgba(43,52,66,0.08)" }}>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : parcours.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(43,52,66,0.35)" }}>
          <p className="text-lg">Aucun parcours disponible pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parcours.map((p, i) => (
            <Link key={p.id} href={`/parcours/${slugify(p.titre)}`}
              className="group block bg-white rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ borderColor: "rgba(43,52,66,0.08)" }}>
              <div className="flex items-stretch">
                <div className="flex items-center justify-center w-20 shrink-0 text-2xl"
                  style={{ backgroundColor: p.couleur_hex || "#00989D", color: "white" }}>
                  <span className="font-bold">{p.emoji || String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="p-5 flex-1 min-w-0">
                  <h2 className="text-lg font-bold transition-colors" style={{ color: "#2B3442" }}>
                    {p.titre}
                  </h2>
                  {p.description && (
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: "rgba(43,52,66,0.55)" }}>
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center pr-5 transition-colors" style={{ color: "rgba(43,52,66,0.2)" }}>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
EOF

echo "  ✅ app/parcours/page.tsx"

# ============================================================
# 5. PARCOURS DETAIL — design amélioré
# ============================================================

mkdir -p "app/parcours/[slug]"

cat > "app/parcours/[slug]/page.tsx" << 'EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getParcours, getFichesByParcours, slugify, formatDuree, type Parcours, type Fiche } from "@/lib/supabase";

export default function ParcoursDetailPage({ params }: { params: { slug: string } }) {
  const [parcours, setParcours] = useState<Parcours | null>(null);
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const all = await getParcours();
      const match = all.find((p) => slugify(p.titre) === params.slug);
      if (match) {
        setParcours(match);
        const f = await getFichesByParcours(match.id);
        setFiches(f);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-20 text-center" style={{ color: "rgba(43,52,66,0.4)" }}>
      Chargement...
    </div>
  );

  if (!parcours) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#2B3442" }}>Parcours introuvable</h1>
        <Link href="/parcours" className="mt-4 inline-block hover:underline" style={{ color: "#00989D" }}>
          ← Retour aux parcours
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <Link href="/parcours" className="text-sm hover:underline inline-flex items-center gap-1 mb-8" style={{ color: "#00989D" }}>
        ← Retour aux parcours
      </Link>

      <div className="mb-10">
        <div className="flex items-center gap-3 mb-2">
          {parcours.emoji && <span className="text-3xl">{parcours.emoji}</span>}
          <h1 className="text-3xl font-bold" style={{ color: "#2B3442" }}>{parcours.titre}</h1>
        </div>
        {parcours.description && (
          <p className="text-lg" style={{ color: "rgba(43,52,66,0.55)" }}>{parcours.description}</p>
        )}
      </div>

      {fiches.length === 0 ? (
        <p className="text-center py-12" style={{ color: "rgba(43,52,66,0.35)" }}>Aucune fiche associée.</p>
      ) : (
        <div>
          {fiches.map((fiche, i) => (
            <div key={fiche.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0 shadow-sm"
                  style={{ backgroundColor: parcours.couleur_hex || "#00989D" }}>
                  {i + 1}
                </div>
                {i < fiches.length - 1 && (
                  <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: "rgba(0,152,157,0.15)" }} />
                )}
              </div>
              <Link href={`/bao/${fiche.slug}`}
                className="group flex-1 bg-white rounded-xl border overflow-hidden transition-all duration-300 p-5 mb-4 hover:shadow-md hover:-translate-y-0.5"
                style={{ borderColor: "rgba(43,52,66,0.08)" }}>
                <h3 className="font-bold text-base" style={{ color: "#2B3442" }}>{fiche.nom}</h3>
                {fiche.intention && (
                  <p className="text-sm mt-1 italic line-clamp-2" style={{ color: "rgba(43,52,66,0.5)" }}>{fiche.intention}</p>
                )}
                <div className="flex items-center gap-3 mt-3 text-xs" style={{ color: "rgba(43,52,66,0.4)" }}>
                  {formatDuree(fiche) && <span>⏱ {formatDuree(fiche)}</span>}
                  {fiche.format && <span>{fiche.format}</span>}
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
EOF

echo "  ✅ app/parcours/[slug]/page.tsx"

echo ""
echo "============================================"
echo "✅ Polish design terminé !"
echo "============================================"
echo ""
echo "Lance :"
echo "  rm -rf .next && npm run dev"
echo ""
echo "Puis : git add -A && git commit -m 'Polish: typo, espaces, couleurs, parcours' && git push"
echo ""
