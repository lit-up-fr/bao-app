#!/bin/bash
# ============================================================
# BAO Lit uP V6 — Frontend complet (Phase 2.4)
# Script de setup : crée tous les fichiers Next.js
# À exécuter à la racine du projet bao-app
# ============================================================

set -e

echo "🚀 BAO V6 — Installation du frontend..."

# ============================================================
# 1. TAILWIND CONFIG — Charte Lit uP
# ============================================================

cat > tailwind.config.ts << 'TAILWIND_EOF'
import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
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
TAILWIND_EOF

echo "  ✅ tailwind.config.ts"

# ============================================================
# 2. GLOBAL CSS
# ============================================================

cat > app/globals.css << 'CSS_EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;1,400;1,600;1,700&display=swap');

:root {
  --litup-dark: #2B3442;
  --litup-teal: #00989D;
  --litup-gold: #FCC33E;
  --litup-violet: #6B2468;
  --litup-light: #F6F6F8;
}

body {
  font-family: 'Source Sans 3', system-ui, sans-serif;
  color: var(--litup-dark);
  background: var(--litup-light);
}

/* Smooth scroll */
html {
  scroll-behavior: smooth;
}

/* Focus styles for accessibility */
*:focus-visible {
  outline: 2px solid var(--litup-teal);
  outline-offset: 2px;
}
CSS_EOF

echo "  ✅ app/globals.css"

# ============================================================
# 3. LIB — Supabase client
# ============================================================

mkdir -p lib

cat > lib/supabase.ts << 'SUPA_EOF'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ---------- Types ----------

export interface Fiche {
  id: string;
  slug: string;
  titre: string;
  sous_titre: string | null;
  description: string;
  objectif: string | null;
  duree_minutes: number | null;
  nb_participants_min: number | null;
  nb_participants_max: number | null;
  materiel: string | null;
  source: string | null;
  pdf_url: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Cle {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  icone: string | null;
  ordre: number;
}

export interface Etape {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  ordre: number;
}

export interface Parcours {
  id: string;
  slug: string;
  titre: string;
  description: string | null;
  public_cible: string | null;
  duree_estimee: string | null;
  ordre: number;
}

// ---------- Data fetchers ----------

export async function getFiches(): Promise<Fiche[]> {
  const { data, error } = await supabase
    .from("fiches")
    .select("*")
    .order("titre");
  if (error) throw error;
  return data || [];
}

export async function getFicheBySlug(slug: string): Promise<Fiche | null> {
  const { data, error } = await supabase
    .from("fiches")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getCles(): Promise<Cle[]> {
  const { data, error } = await supabase
    .from("cles")
    .select("*")
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function getEtapes(): Promise<Etape[]> {
  const { data, error } = await supabase
    .from("etapes_parcours")
    .select("*")
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function getClesByFiche(ficheId: string): Promise<Cle[]> {
  const { data, error } = await supabase
    .from("fiches_cles")
    .select("cle_id, cles(*)")
    .eq("fiche_id", ficheId);
  if (error) throw error;
  return (data || []).map((d: any) => d.cles).filter(Boolean);
}

export async function getFichesByCle(cleId: string): Promise<Fiche[]> {
  const { data, error } = await supabase
    .from("fiches_cles")
    .select("fiche_id, fiches(*)")
    .eq("cle_id", cleId);
  if (error) throw error;
  return (data || []).map((d: any) => d.fiches).filter(Boolean);
}

export async function getParcours(): Promise<Parcours[]> {
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function getParcoursBySlug(slug: string): Promise<Parcours | null> {
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getFichesByParcours(parcoursId: string): Promise<Fiche[]> {
  const { data, error } = await supabase
    .from("parcours_fiches")
    .select("fiche_id, ordre, fiches(*)")
    .eq("parcours_id", parcoursId)
    .order("ordre");
  if (error) throw error;
  return (data || []).map((d: any) => d.fiches).filter(Boolean);
}
SUPA_EOF

echo "  ✅ lib/supabase.ts"

# ============================================================
# 4. COMPONENTS
# ============================================================

mkdir -p components

# --- Header ---
cat > components/Header.tsx << 'HEADER_EOF'
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
HEADER_EOF

echo "  ✅ components/Header.tsx"

# --- Footer ---
cat > components/Footer.tsx << 'FOOTER_EOF'
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
FOOTER_EOF

echo "  ✅ components/Footer.tsx"

# --- FicheCard ---
cat > components/FicheCard.tsx << 'FICHECARD_EOF'
import Link from "next/link";
import type { Fiche } from "@/lib/supabase";

interface FicheCardProps {
  fiche: Fiche;
  cles?: { nom: string; slug: string }[];
}

export default function FicheCard({ fiche, cles = [] }: FicheCardProps) {
  return (
    <Link
      href={`/bao/${fiche.slug}`}
      className="group block bg-white rounded-xl border border-litup-dark/10 
                 hover:border-litup-teal/40 hover:shadow-lg hover:shadow-litup-teal/5
                 transition-all duration-300 overflow-hidden"
    >
      {/* Top accent bar */}
      <div className="h-1 bg-gradient-to-r from-litup-teal to-litup-gold 
                      group-hover:h-1.5 transition-all duration-300" />
      
      <div className="p-5">
        <h3 className="font-bold text-litup-dark group-hover:text-litup-teal 
                       transition-colors text-lg leading-tight">
          {fiche.titre}
        </h3>
        
        {fiche.sous_titre && (
          <p className="text-sm text-litup-dark/50 mt-1">{fiche.sous_titre}</p>
        )}
        
        <p className="text-sm text-litup-dark/70 mt-3 line-clamp-3">
          {fiche.description}
        </p>

        {/* Metadata */}
        <div className="flex items-center gap-3 mt-4 text-xs text-litup-dark/50">
          {fiche.duree_minutes && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {fiche.duree_minutes} min
            </span>
          )}
          {fiche.nb_participants_min && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              {fiche.nb_participants_min}
              {fiche.nb_participants_max && `–${fiche.nb_participants_max}`} pers.
            </span>
          )}
        </div>

        {/* Tags clés */}
        {cles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cles.map((cle) => (
              <span
                key={cle.slug}
                className="text-xs px-2 py-0.5 rounded-full bg-litup-teal/10 text-litup-teal font-medium"
              >
                {cle.nom}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
FICHECARD_EOF

echo "  ✅ components/FicheCard.tsx"

# --- FilterBar ---
cat > components/FilterBar.tsx << 'FILTERBAR_EOF'
"use client";

import { useState } from "react";
import type { Cle } from "@/lib/supabase";

interface FilterBarProps {
  cles: Cle[];
  activeCle: string | null;
  onCleChange: (cleId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FilterBar({
  cles,
  activeCle,
  onCleChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-litup-dark/40"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher un outil..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-litup-dark/15 
                     bg-white text-sm placeholder:text-litup-dark/40
                     focus:border-litup-teal focus:ring-1 focus:ring-litup-teal/30
                     transition-colors"
        />
      </div>

      {/* Clé filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCleChange(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all
            ${!activeCle
              ? "bg-litup-teal text-white shadow-sm"
              : "bg-litup-dark/5 text-litup-dark/60 hover:bg-litup-dark/10"
            }`}
        >
          Tous
        </button>
        {cles.map((cle) => (
          <button
            key={cle.id}
            onClick={() => onCleChange(cle.id === activeCle ? null : cle.id)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all
              ${cle.id === activeCle
                ? "bg-litup-teal text-white shadow-sm"
                : "bg-litup-dark/5 text-litup-dark/60 hover:bg-litup-dark/10"
              }`}
          >
            {cle.nom}
          </button>
        ))}
      </div>
    </div>
  );
}
FILTERBAR_EOF

echo "  ✅ components/FilterBar.tsx"

# ============================================================
# 5. LAYOUT
# ============================================================

cat > app/layout.tsx << 'LAYOUT_EOF'
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
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
LAYOUT_EOF

echo "  ✅ app/layout.tsx"

# ============================================================
# 6. LANDING PAGE
# ============================================================

cat > app/page.tsx << 'LANDING_EOF'
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-litup-dark via-litup-dark to-litup-teal/80" />
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-litup-gold blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-litup-teal blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
          <p className="text-litup-gold font-semibold text-sm tracking-widest uppercase mb-6">
            Laboratoire pédagogique Lit uP
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            Des outils qui donnent le pouvoir d'agir
            <br />
            <span className="text-litup-gold">aux jeunes comme aux équipes.</span>
          </h1>
          <p className="mt-6 text-lg text-white/70 max-w-2xl mx-auto">
            Des méthodes concrètes, testées sur le terrain, pour animer, libérer la parole,
            construire un collectif et accompagner les jeunes dans leurs projets.
          </p>
          <p className="mt-2 text-sm text-white/50">
            Gratuite, ouverte, faite pour être partagée.
          </p>
        </div>
      </section>

      {/* 3 portes d'entrée */}
      <section className="max-w-5xl mx-auto px-4 -mt-8 relative z-10">
        <div className="grid md:grid-cols-3 gap-4">
          {[
            {
              num: "01",
              title: "Professionnel·le",
              desc: "Enseignant·e, conseiller·ère, éducateur·ice, formateur·ice. Accédez aux outils et ateliers pensés pour l'accompagnement structuré.",
              href: "/bao",
              color: "litup-teal",
            },
            {
              num: "02",
              title: "Pair·e aidant·e",
              desc: "Vous accompagnez vos pairs par l'expérience. Retrouvez les outils simples, éprouvés, pour faciliter la parole et l'action.",
              href: "/bao",
              color: "litup-gold",
            },
            {
              num: "03",
              title: "Explorer librement",
              desc: "Parcourez l'ensemble de la boîte sans filtre préalable. Naviguez par étape, par objectif ou par clé d'engagement.",
              href: "/bao",
              color: "litup-violet",
            },
          ].map((card) => (
            <Link
              key={card.num}
              href={card.href}
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl 
                         border border-litup-dark/5 hover:border-litup-teal/30
                         transition-all duration-300 hover:-translate-y-1"
            >
              <span className={`text-xs font-bold text-${card.color} tracking-wider`}>
                {card.num}
              </span>
              <h3 className="mt-2 text-lg font-bold text-litup-dark group-hover:text-litup-teal transition-colors">
                {card.title}
              </h3>
              <p className="mt-2 text-sm text-litup-dark/60 leading-relaxed">
                {card.desc}
              </p>
              <span className="inline-block mt-4 text-sm font-semibold text-litup-teal 
                               group-hover:translate-x-1 transition-transform">
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
              <div className="text-3xl sm:text-4xl font-bold text-litup-teal">
                {stat.value}
              </div>
              <div className="text-sm text-litup-dark/50 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA parcours */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="bg-litup-dark rounded-2xl p-8 sm:p-12 text-center">
          <h2 className="text-2xl font-bold text-white">
            Vous ne savez pas par où commencer ?
          </h2>
          <p className="mt-3 text-white/60 max-w-lg mx-auto">
            Nos parcours guidés vous accompagnent pas à pas, de la première rencontre
            à l'autonomie du groupe.
          </p>
          <Link
            href="/parcours"
            className="inline-block mt-6 px-6 py-3 bg-litup-gold text-litup-dark 
                       font-bold rounded-lg hover:bg-litup-gold/90 transition-colors"
          >
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
# 7. BAO CATALOGUE PAGE
# ============================================================

mkdir -p "app/bao"

cat > app/bao/page.tsx << 'BAO_EOF'
"use client";

import { useEffect, useState } from "react";
import { getFiches, getCles, getClesByFiche, type Fiche, type Cle } from "@/lib/supabase";
import FicheCard from "@/components/FicheCard";
import FilterBar from "@/components/FilterBar";

interface FicheWithCles extends Fiche {
  cles: { nom: string; slug: string }[];
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
        const [fichesData, clesData] = await Promise.all([
          getFiches(),
          getCles(),
        ]);

        // Load clés for each fiche
        const fichesWithCles = await Promise.all(
          fichesData.map(async (f) => {
            const ficheCles = await getClesByFiche(f.id);
            return {
              ...f,
              cles: ficheCles.map((c) => ({ nom: c.nom, slug: c.slug })),
            };
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

  // Filter logic
  const filtered = fiches.filter((f) => {
    const matchSearch =
      !searchQuery ||
      f.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchCle =
      !activeCle ||
      f.cles.some((c) => {
        const matchingCle = cles.find((cl) => cl.id === activeCle);
        return matchingCle && c.slug === matchingCle.slug;
      });

    return matchSearch && matchCle;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-litup-dark">
          La boîte à outils
        </h1>
        <p className="mt-2 text-litup-dark/60">
          {fiches.length} outils pour animer, libérer la parole et accompagner les jeunes.
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        cles={cles}
        activeCle={activeCle}
        onCleChange={setActiveCle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Results count */}
      <p className="text-sm text-litup-dark/50 mt-6 mb-4">
        {filtered.length} outil{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-litup-dark/10 p-5 animate-pulse"
            >
              <div className="h-1 bg-litup-dark/10 rounded mb-4" />
              <div className="h-5 bg-litup-dark/10 rounded w-3/4 mb-2" />
              <div className="h-4 bg-litup-dark/5 rounded w-1/2 mb-4" />
              <div className="h-3 bg-litup-dark/5 rounded w-full mb-1" />
              <div className="h-3 bg-litup-dark/5 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-litup-dark/40">
          <p className="text-lg">Aucun outil trouvé.</p>
          <p className="text-sm mt-1">Essayez un autre mot-clé ou changez de filtre.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((fiche) => (
            <FicheCard key={fiche.id} fiche={fiche} cles={fiche.cles} />
          ))}
        </div>
      )}
    </div>
  );
}
BAO_EOF

echo "  ✅ app/bao/page.tsx (catalogue)"

# ============================================================
# 8. FICHE DETAIL PAGE
# ============================================================

mkdir -p "app/bao/[slug]"

cat > "app/bao/[slug]/page.tsx" << 'FICHE_EOF'
import Link from "next/link";
import { getFiches, getFicheBySlug, getClesByFiche } from "@/lib/supabase";

export async function generateStaticParams() {
  const fiches = await getFiches();
  return fiches.map((f) => ({ slug: f.slug }));
}

export default async function FicheDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const fiche = await getFicheBySlug(params.slug);

  if (!fiche) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-litup-dark">Fiche introuvable</h1>
        <Link href="/bao" className="text-litup-teal mt-4 inline-block hover:underline">
          ← Retour à la boîte à outils
        </Link>
      </div>
    );
  }

  const cles = await getClesByFiche(fiche.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <Link
        href="/bao"
        className="text-sm text-litup-teal hover:underline inline-flex items-center gap-1 mb-6"
      >
        ← Retour aux outils
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-litup-dark">{fiche.titre}</h1>
        {fiche.sous_titre && (
          <p className="text-lg text-litup-dark/50 mt-1">{fiche.sous_titre}</p>
        )}
      </div>

      {/* Metadata bar */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl border border-litup-dark/10 mb-8">
        {fiche.duree_minutes && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Durée :</span>{" "}
            <span className="font-semibold">{fiche.duree_minutes} min</span>
          </div>
        )}
        {fiche.nb_participants_min && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Participants :</span>{" "}
            <span className="font-semibold">
              {fiche.nb_participants_min}
              {fiche.nb_participants_max && `–${fiche.nb_participants_max}`}
            </span>
          </div>
        )}
        {fiche.source && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Source :</span>{" "}
            <span className="font-semibold">{fiche.source}</span>
          </div>
        )}
      </div>

      {/* Description */}
      <div className="prose prose-sm max-w-none mb-8">
        <h2 className="text-lg font-bold text-litup-dark">Description</h2>
        <p className="text-litup-dark/80 leading-relaxed whitespace-pre-line">
          {fiche.description}
        </p>
      </div>

      {/* Objectif */}
      {fiche.objectif && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Objectif</h2>
          <p className="text-litup-dark/80">{fiche.objectif}</p>
        </div>
      )}

      {/* Matériel */}
      {fiche.materiel && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Matériel</h2>
          <p className="text-litup-dark/80">{fiche.materiel}</p>
        </div>
      )}

      {/* Clés d'engagement */}
      {cles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-3">
            Clés d'engagement
          </h2>
          <div className="flex flex-wrap gap-2">
            {cles.map((cle) => (
              <span
                key={cle.id}
                className="text-sm px-3 py-1 rounded-full bg-litup-teal/10 text-litup-teal font-medium"
              >
                {cle.nom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PDF download */}
      {fiche.pdf_url && (
        <div className="mt-10 p-6 bg-litup-dark rounded-xl text-center">
          <p className="text-white/70 text-sm mb-3">
            Téléchargez la fiche complète au format PDF
          </p>
          <a
            href={fiche.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-litup-gold 
                       text-litup-dark font-bold rounded-lg 
                       hover:bg-litup-gold/90 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Télécharger le PDF
          </a>
        </div>
      )}
    </div>
  );
}
FICHE_EOF

echo "  ✅ app/bao/[slug]/page.tsx (fiche détail)"

# ============================================================
# 9. PARCOURS LIST PAGE
# ============================================================

mkdir -p app/parcours

cat > app/parcours/page.tsx << 'PARCOURS_LIST_EOF'
import Link from "next/link";
import { getParcours } from "@/lib/supabase";

export default async function ParcoursListPage() {
  const parcours = await getParcours();

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-litup-dark">Parcours guidés</h1>
        <p className="mt-2 text-litup-dark/60">
          Des séquences d'outils pensées pour accompagner pas à pas,
          de la première rencontre à l'autonomie du groupe.
        </p>
      </div>

      <div className="space-y-4">
        {parcours.map((p, i) => (
          <Link
            key={p.id}
            href={`/parcours/${p.slug}`}
            className="group block bg-white rounded-xl border border-litup-dark/10
                       hover:border-litup-teal/30 hover:shadow-lg hover:shadow-litup-teal/5
                       transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-stretch">
              {/* Number */}
              <div className="flex items-center justify-center w-16 sm:w-20 
                            bg-litup-teal text-white text-2xl font-bold shrink-0">
                {String(i + 1).padStart(2, "0")}
              </div>
              
              <div className="p-5 flex-1">
                <h2 className="text-lg font-bold text-litup-dark 
                             group-hover:text-litup-teal transition-colors">
                  {p.titre}
                </h2>
                {p.description && (
                  <p className="text-sm text-litup-dark/60 mt-1 line-clamp-2">
                    {p.description}
                  </p>
                )}
                <div className="flex items-center gap-4 mt-3 text-xs text-litup-dark/40">
                  {p.public_cible && <span>Public : {p.public_cible}</span>}
                  {p.duree_estimee && <span>Durée : {p.duree_estimee}</span>}
                </div>
              </div>

              {/* Arrow */}
              <div className="flex items-center pr-5 text-litup-dark/20 
                            group-hover:text-litup-teal transition-colors">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
PARCOURS_LIST_EOF

echo "  ✅ app/parcours/page.tsx (liste parcours)"

# ============================================================
# 10. PARCOURS DETAIL PAGE
# ============================================================

mkdir -p "app/parcours/[slug]"

cat > "app/parcours/[slug]/page.tsx" << 'PARCOURS_DETAIL_EOF'
import Link from "next/link";
import { getParcours, getParcoursBySlug, getFichesByParcours } from "@/lib/supabase";

export async function generateStaticParams() {
  const parcours = await getParcours();
  return parcours.map((p) => ({ slug: p.slug }));
}

export default async function ParcoursDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const parcours = await getParcoursBySlug(params.slug);

  if (!parcours) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-litup-dark">Parcours introuvable</h1>
        <Link href="/parcours" className="text-litup-teal mt-4 inline-block hover:underline">
          ← Retour aux parcours
        </Link>
      </div>
    );
  }

  const fiches = await getFichesByParcours(parcours.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <Link
        href="/parcours"
        className="text-sm text-litup-teal hover:underline inline-flex items-center gap-1 mb-6"
      >
        ← Retour aux parcours
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-litup-dark">{parcours.titre}</h1>
        {parcours.description && (
          <p className="text-litup-dark/60 mt-2">{parcours.description}</p>
        )}
        <div className="flex gap-4 mt-3 text-sm text-litup-dark/40">
          {parcours.public_cible && <span>Public : {parcours.public_cible}</span>}
          {parcours.duree_estimee && <span>Durée estimée : {parcours.duree_estimee}</span>}
        </div>
      </div>

      {/* Fiches timeline */}
      <div className="space-y-0">
        {fiches.map((fiche, i) => (
          <div key={fiche.id} className="flex gap-4">
            {/* Timeline connector */}
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-litup-teal text-white 
                            flex items-center justify-center text-sm font-bold shrink-0">
                {i + 1}
              </div>
              {i < fiches.length - 1 && (
                <div className="w-0.5 flex-1 bg-litup-teal/20 my-1" />
              )}
            </div>

            {/* Card */}
            <Link
              href={`/bao/${fiche.slug}`}
              className="group flex-1 bg-white rounded-xl border border-litup-dark/10
                         hover:border-litup-teal/30 hover:shadow-md
                         transition-all duration-300 p-4 mb-4"
            >
              <h3 className="font-bold text-litup-dark group-hover:text-litup-teal transition-colors">
                {fiche.titre}
              </h3>
              <p className="text-sm text-litup-dark/60 mt-1 line-clamp-2">
                {fiche.description}
              </p>
              <div className="flex items-center gap-3 mt-2 text-xs text-litup-dark/40">
                {fiche.duree_minutes && <span>{fiche.duree_minutes} min</span>}
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
PARCOURS_DETAIL_EOF

echo "  ✅ app/parcours/[slug]/page.tsx (parcours détail)"

# ============================================================
# 11. NEXT CONFIG — Force dynamic pour Supabase
# ============================================================

cat > next.config.mjs << 'NEXTCONFIG_EOF'
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "odadaqpihvcnuprkdchr.supabase.co",
      },
    ],
  },
};

export default nextConfig;
NEXTCONFIG_EOF

echo "  ✅ next.config.mjs"

echo ""
echo "============================================"
echo "✅ Frontend BAO V6 installé !"
echo "============================================"
echo ""
echo "Prochaines étapes :"
echo "  1. cd ~/bao-app  (ou le dossier de ton projet)"
echo "  2. bash setup-frontend.sh"
echo "  3. npm run dev  (pour tester en local)"
echo "  4. git add -A && git commit -m 'Phase 2.4 — Frontend complet' && git push"
echo "  5. Vercel déploiera automatiquement"
echo ""
