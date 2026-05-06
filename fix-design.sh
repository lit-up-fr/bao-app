#!/bin/bash
# ============================================================
# BAO V6 — Design Fix : couleurs + polish visuel
# Corrige les couleurs Tailwind custom qui ne compilent pas
# en utilisant des CSS variables et styles inline
# ≈ 30-40 min de travail condensé en un script
# ============================================================

set -e

echo "🎨 Correction design BAO V6..."

# ============================================================
# 1. GLOBALS.CSS — Variables + classes utilitaires
# ============================================================

cat > app/globals.css << 'CSS_EOF'
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
  --white: #ffffff;
}

body {
  font-family: 'Source Sans 3', system-ui, sans-serif;
  color: var(--dark);
  background: var(--light);
  -webkit-font-smoothing: antialiased;
}

html {
  scroll-behavior: smooth;
}

*:focus-visible {
  outline: 2px solid var(--teal);
  outline-offset: 2px;
}

/* Utility classes that work in production */
.bg-dark { background-color: var(--dark); }
.bg-teal { background-color: var(--teal); }
.bg-gold { background-color: var(--gold); }
.bg-violet { background-color: var(--violet); }
.bg-light { background-color: var(--light); }

.text-dark { color: var(--dark); }
.text-teal { color: var(--teal); }
.text-gold { color: var(--gold); }
.text-violet { color: var(--violet); }

.border-teal { border-color: var(--teal); }

.hover-teal:hover { color: var(--teal); }
.hover-border-teal:hover { border-color: var(--teal); }

/* Gradient bar for cards */
.card-gradient {
  background: linear-gradient(90deg, var(--teal), var(--gold));
}

/* Tag styles */
.tag {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
}
CSS_EOF

echo "  ✅ app/globals.css"

# ============================================================
# 2. HEADER — avec les bonnes classes
# ============================================================

cat > components/Header.tsx << 'EOF'
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
EOF

echo "  ✅ components/Header.tsx"

# ============================================================
# 3. FOOTER
# ============================================================

cat > components/Footer.tsx << 'EOF'
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
EOF

echo "  ✅ components/Footer.tsx"

# ============================================================
# 4. LANDING PAGE — design amélioré
# ============================================================

cat > app/page.tsx << 'LANDING_EOF'
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden" style={{ backgroundColor: "#2B3442" }}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-15" style={{ backgroundColor: "#FCC33E", filter: "blur(80px)" }} />
          <div className="absolute -bottom-32 -left-20 w-[500px] h-[500px] rounded-full opacity-20" style={{ backgroundColor: "#00989D", filter: "blur(100px)" }} />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
          <p className="text-sm font-semibold tracking-widest uppercase mb-6" style={{ color: "#FCC33E" }}>
            Laboratoire pédagogique Lit uP
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight" style={{ color: "white" }}>
            Des outils qui donnent le pouvoir d&apos;agir
          </h1>
          <h1 className="text-3xl sm:text-5xl font-bold leading-tight mt-2" style={{ color: "#FCC33E" }}>
            aux jeunes comme aux équipes.
          </h1>
          <p className="mt-6 text-lg max-w-2xl mx-auto" style={{ color: "rgba(255,255,255,0.75)" }}>
            Des méthodes concrètes, testées sur le terrain, pour animer, libérer la parole,
            construire un collectif et accompagner les jeunes dans leurs projets.
          </p>
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>
            Gratuite, ouverte, faite pour être partagée.
          </p>
        </div>
      </section>

      {/* 3 portes */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { num: "01", title: "Professionnel·le", desc: "Enseignant·e, conseiller·ère, éducateur·ice, formateur·ice. Accédez aux outils pensés pour l'accompagnement structuré.", accent: "#00989D" },
            { num: "02", title: "Pair·e aidant·e", desc: "Vous accompagnez vos pairs par l'expérience. Retrouvez les outils simples, éprouvés, pour faciliter la parole et l'action.", accent: "#FCC33E" },
            { num: "03", title: "Explorer librement", desc: "Parcourez l'ensemble de la boîte sans filtre préalable. Naviguez par étape, par objectif ou par clé d'engagement.", accent: "#6B2468" },
          ].map((card) => (
            <Link key={card.num} href="/bao"
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl border transition-all duration-300 hover:-translate-y-1"
              style={{ borderColor: "rgba(43,52,66,0.06)" }}>
              <span className="text-xs font-bold tracking-wider" style={{ color: card.accent }}>{card.num}</span>
              <h3 className="mt-2 text-lg font-bold transition-colors" style={{ color: "#2B3442" }}>{card.title}</h3>
              <p className="mt-2 text-sm leading-relaxed" style={{ color: "rgba(43,52,66,0.55)" }}>{card.desc}</p>
              <span className="inline-block mt-4 text-sm font-semibold group-hover:translate-x-1 transition-transform" style={{ color: "#00989D" }}>
                Entrer →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-4xl mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "30", label: "outils référencés" },
            { value: "9", label: "clés d'engagement" },
            { value: "10", label: "étapes de parcours" },
            { value: "6", label: "parcours guidés" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl sm:text-4xl font-bold" style={{ color: "#00989D" }}>{stat.value}</div>
              <div className="text-sm mt-1" style={{ color: "rgba(43,52,66,0.45)" }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="rounded-2xl p-8 sm:p-12 text-center" style={{ backgroundColor: "#2B3442" }}>
          <h2 className="text-2xl font-bold" style={{ color: "white" }}>
            Vous ne savez pas par où commencer ?
          </h2>
          <p className="mt-3 max-w-lg mx-auto" style={{ color: "rgba(255,255,255,0.55)" }}>
            Nos parcours guidés vous accompagnent pas à pas, de la première rencontre
            à l&apos;autonomie du groupe.
          </p>
          <Link href="/parcours"
            className="inline-block mt-6 px-6 py-3 font-bold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: "#FCC33E", color: "#2B3442" }}>
            Découvrir les parcours
          </Link>
        </div>
      </section>
    </>
  );
}
LANDING_EOF

echo "  ✅ app/page.tsx (landing)"

# ============================================================
# 5. FICHE CARD — couleurs corrigées
# ============================================================

cat > components/FicheCard.tsx << 'EOF'
import Link from "next/link";
import type { Fiche, Cle } from "@/lib/supabase";
import { formatDuree } from "@/lib/supabase";

interface FicheCardProps {
  fiche: Fiche;
  cles?: Cle[];
}

export default function FicheCard({ fiche, cles = [] }: FicheCardProps) {
  const duree = formatDuree(fiche);

  return (
    <Link href={`/bao/${fiche.slug}`}
      className="group block bg-white rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: "rgba(43,52,66,0.1)" }}>

      {/* Gradient bar */}
      <div className="h-1 group-hover:h-1.5 transition-all duration-300"
        style={{ background: "linear-gradient(90deg, #00989D, #FCC33E)" }} />

      <div className="p-5">
        <h3 className="font-bold text-lg leading-tight transition-colors group-hover:opacity-80"
          style={{ color: "#2B3442" }}>
          {fiche.nom}
        </h3>

        {fiche.intention && (
          <p className="text-sm mt-2 line-clamp-3 italic" style={{ color: "rgba(43,52,66,0.6)" }}>
            {fiche.intention}
          </p>
        )}

        {fiche.pourquoi && (
          <p className="text-sm mt-2 line-clamp-2" style={{ color: "rgba(43,52,66,0.5)" }}>
            {fiche.pourquoi}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 mt-4 text-xs" style={{ color: "rgba(43,52,66,0.45)" }}>
          {duree && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {duree}
            </span>
          )}
          {fiche.participants && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              </svg>
              {fiche.participants}
            </span>
          )}
          {fiche.format && (
            <span className="px-2 py-0.5 rounded" style={{ backgroundColor: "rgba(43,52,66,0.06)" }}>
              {fiche.format}
            </span>
          )}
        </div>

        {/* Tags */}
        {cles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cles.map((cle) => (
              <span key={cle.id} className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: cle.couleur_hex ? `${cle.couleur_hex}18` : "rgba(0,152,157,0.1)",
                  color: cle.couleur_hex || "#00989D",
                }}>
                {cle.nom}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
EOF

echo "  ✅ components/FicheCard.tsx"

# ============================================================
# 6. FILTER BAR — couleurs corrigées
# ============================================================

cat > components/FilterBar.tsx << 'EOF'
"use client";

import type { Cle } from "@/lib/supabase";

interface FilterBarProps {
  cles: Cle[];
  activeCle: string | null;
  onCleChange: (cleId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FilterBar({ cles, activeCle, onCleChange, searchQuery, onSearchChange }: FilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(43,52,66,0.35)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input type="text" placeholder="Rechercher un outil..."
          value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm transition-colors focus:outline-none focus:ring-2"
          style={{ borderColor: "rgba(43,52,66,0.12)", color: "#2B3442" }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => onCleChange(null)}
          className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
          style={{
            backgroundColor: !activeCle ? "#00989D" : "rgba(43,52,66,0.06)",
            color: !activeCle ? "white" : "rgba(43,52,66,0.55)",
          }}>
          Tous
        </button>
        {cles.map((cle) => (
          <button key={cle.id} onClick={() => onCleChange(cle.id === activeCle ? null : cle.id)}
            className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
            style={{
              backgroundColor: cle.id === activeCle ? (cle.couleur_hex || "#00989D") : "rgba(43,52,66,0.06)",
              color: cle.id === activeCle ? "white" : "rgba(43,52,66,0.55)",
            }}>
            {cle.nom}
          </button>
        ))}
      </div>
    </div>
  );
}
EOF

echo "  ✅ components/FilterBar.tsx"

# ============================================================
# 7. BAO PAGE — couleurs corrigées
# ============================================================

cat > app/bao/page.tsx << 'EOF'
"use client";

import { useEffect, useState } from "react";
import { getFiches, getCles, getClesByFiche, type Fiche, type Cle } from "@/lib/supabase";
import FicheCard from "@/components/FicheCard";
import FilterBar from "@/components/FilterBar";

interface FicheWithCles extends Fiche {
  fichesCles: Cle[];
}

export default function BaoPage() {
  const [fiches, setFiches] = useState<FicheWithCles[]>([]);
  const [cles, setCles] = useState<Cle[]>([]);
  const [activeCle, setActiveCle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fichesData, clesData] = await Promise.all([getFiches(), getCles()]);
        const fichesWithCles = await Promise.all(
          fichesData.map(async (f) => {
            const ficheCles = await getClesByFiche(f.id);
            return { ...f, fichesCles: ficheCles };
          })
        );
        setFiches(fichesWithCles);
        setCles(clesData);
      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = fiches.filter((f) => {
    const matchSearch = !searchQuery ||
      f.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.intention || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.pourquoi || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCle = !activeCle || f.fichesCles.some((c) => c.id === activeCle);
    return matchSearch && matchCle;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#2B3442" }}>La boîte à outils</h1>
        <p className="mt-2" style={{ color: "rgba(43,52,66,0.55)" }}>
          {fiches.length} outils pour animer, libérer la parole et accompagner les jeunes.
        </p>
      </div>

      <FilterBar cles={cles} activeCle={activeCle} onCleChange={setActiveCle}
        searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <p className="text-sm mt-6 mb-4" style={{ color: "rgba(43,52,66,0.45)" }}>
        {filtered.length} outil{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse" style={{ borderColor: "rgba(43,52,66,0.1)" }}>
              <div className="h-1 bg-gray-200 rounded mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(43,52,66,0.35)" }}>
          <p className="text-lg">Aucun outil trouvé.</p>
          <p className="text-sm mt-1">Essayez un autre mot-clé ou changez de filtre.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((fiche) => (
            <FicheCard key={fiche.id} fiche={fiche} cles={fiche.fichesCles} />
          ))}
        </div>
      )}
    </div>
  );
}
EOF

echo "  ✅ app/bao/page.tsx"

echo ""
echo "============================================"
echo "✅ Design corrigé !"
echo "============================================"
echo ""
echo "Lance :"
echo "  rm -rf .next"
echo "  npm run dev"
echo ""
echo "Puis : git add -A && git commit -m 'Fix design: inline styles + polish' && git push"
echo ""
