#!/bin/bash
# ============================================================
# BAO V6 — Fix Phase 2.4 : adaptation au vrai schéma Supabase
# À exécuter à la racine du projet bao-app
# ============================================================

set -e

echo "🔧 Correction du frontend pour le vrai schéma Supabase..."

# ============================================================
# 1. FIX lib/supabase.ts
# ============================================================

cat > lib/supabase.ts << 'SUPA_EOF'
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ---------- Types (vrais schémas Supabase) ----------

export interface Fiche {
  id: string;
  slug: string;
  nom: string;
  etape_id: string | null;
  duree_min: number | null;
  duree_max: number | null;
  duree_libre: string | null;
  format: string | null;
  participants: string | null;
  materiel: string | null;
  pour_qui: string | null;
  public_pro_pair: string | null;
  type_outil: string | null;
  intention: string | null;
  pourquoi: string | null;
  objectifs: string | null;
  materiel_liste: string | null;
  deroule: string | null;
  conseils: string | null;
  variantes: string | null;
  source: string | null;
  source_a_valider: boolean | null;
  validation_pedagogique_status: string | null;
  publie: boolean | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Cle {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  description_longue: string | null;
  couleur_hex: string | null;
  ordre: number;
}

export interface Etape {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  description_longue: string | null;
  couleur_hex: string | null;
  ordre: number;
}

export interface Parcours {
  id: string;
  titre: string;
  description: string | null;
  emoji: string | null;
  couleur_hex: string | null;
  ordre: number;
}

// ---------- Data fetchers ----------

export async function getFiches(): Promise<Fiche[]> {
  const { data, error } = await supabase
    .from("fiches")
    .select("*")
    .eq("publie", true)
    .order("nom");
  if (error) {
    console.error("Erreur getFiches:", error.message);
    return [];
  }
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
  if (error) {
    console.error("Erreur getCles:", error.message);
    return [];
  }
  return data || [];
}

export async function getEtapes(): Promise<Etape[]> {
  const { data, error } = await supabase
    .from("etapes_parcours")
    .select("*")
    .order("ordre");
  if (error) {
    console.error("Erreur getEtapes:", error.message);
    return [];
  }
  return data || [];
}

export async function getClesByFiche(ficheId: string): Promise<Cle[]> {
  const { data, error } = await supabase
    .from("fiches_cles")
    .select("cle_id, cles(*)")
    .eq("fiche_id", ficheId);
  if (error) {
    console.error("Erreur getClesByFiche:", error.message);
    return [];
  }
  return (data || []).map((d: any) => d.cles).filter(Boolean);
}

export async function getParcours(): Promise<Parcours[]> {
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .order("ordre");
  if (error) {
    console.error("Erreur getParcours:", error.message);
    return [];
  }
  return data || [];
}

export async function getParcoursBySlug(slug: string): Promise<Parcours | null> {
  // parcours_guides n'a pas de slug, on cherche par titre transformé
  // ou on peut chercher par id. Pour l'instant on cherche par titre encodé.
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .order("ordre");
  if (error) return null;
  const match = (data || []).find(
    (p: any) => slugify(p.titre) === slug
  );
  return match || null;
}

export async function getParcoursById(id: string): Promise<Parcours | null> {
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .eq("id", id)
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
  if (error) {
    console.error("Erreur getFichesByParcours:", error.message);
    return [];
  }
  return (data || []).map((d: any) => d.fiches).filter(Boolean);
}

// ---------- Helpers ----------

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDuree(fiche: Fiche): string | null {
  if (fiche.duree_libre) return fiche.duree_libre;
  if (fiche.duree_min && fiche.duree_max) return `${fiche.duree_min}–${fiche.duree_max} min`;
  if (fiche.duree_min) return `${fiche.duree_min} min`;
  return null;
}
SUPA_EOF

echo "  ✅ lib/supabase.ts (corrigé)"

# ============================================================
# 2. FIX components/FicheCard.tsx
# ============================================================

cat > components/FicheCard.tsx << 'FICHECARD_EOF'
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
          {fiche.nom}
        </h3>
        
        {fiche.intention && (
          <p className="text-sm text-litup-dark/70 mt-2 line-clamp-3 italic">
            {fiche.intention}
          </p>
        )}

        {fiche.pourquoi && (
          <p className="text-sm text-litup-dark/60 mt-2 line-clamp-2">
            {fiche.pourquoi}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-3 mt-4 text-xs text-litup-dark/50">
          {duree && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              {duree}
            </span>
          )}
          {fiche.participants && (
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              {fiche.participants}
            </span>
          )}
          {fiche.format && (
            <span className="px-2 py-0.5 rounded bg-litup-dark/5 text-litup-dark/50">
              {fiche.format}
            </span>
          )}
        </div>

        {/* Tags clés */}
        {cles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cles.map((cle) => (
              <span
                key={cle.id}
                className="text-xs px-2 py-0.5 rounded-full font-medium"
                style={{
                  backgroundColor: cle.couleur_hex ? `${cle.couleur_hex}18` : undefined,
                  color: cle.couleur_hex || undefined,
                }}
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

echo "  ✅ components/FicheCard.tsx (corrigé)"

# ============================================================
# 3. FIX app/bao/page.tsx
# ============================================================

cat > app/bao/page.tsx << 'BAO_EOF'
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
        const [fichesData, clesData] = await Promise.all([
          getFiches(),
          getCles(),
        ]);

        // Load clés for each fiche
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

  // Filter logic
  const filtered = fiches.filter((f) => {
    const matchSearch =
      !searchQuery ||
      f.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.intention || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.pourquoi || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchCle =
      !activeCle ||
      f.fichesCles.some((c) => c.id === activeCle);

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
            <FicheCard key={fiche.id} fiche={fiche} cles={fiche.fichesCles} />
          ))}
        </div>
      )}
    </div>
  );
}
BAO_EOF

echo "  ✅ app/bao/page.tsx (corrigé)"

# ============================================================
# 4. FIX app/bao/[slug]/page.tsx
# ============================================================

mkdir -p "app/bao/[slug]"

cat > "app/bao/[slug]/page.tsx" << 'FICHE_EOF'
import Link from "next/link";
import { getFiches, getFicheBySlug, getClesByFiche, formatDuree } from "@/lib/supabase";

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
  const duree = formatDuree(fiche);

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
        <h1 className="text-3xl font-bold text-litup-dark">{fiche.nom}</h1>
        {fiche.intention && (
          <p className="text-lg text-litup-dark/60 mt-2 italic">{fiche.intention}</p>
        )}
      </div>

      {/* Metadata bar */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl border border-litup-dark/10 mb-8">
        {duree && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Durée :</span>{" "}
            <span className="font-semibold">{duree}</span>
          </div>
        )}
        {fiche.participants && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Participants :</span>{" "}
            <span className="font-semibold">{fiche.participants}</span>
          </div>
        )}
        {fiche.format && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Format :</span>{" "}
            <span className="font-semibold">{fiche.format}</span>
          </div>
        )}
        {fiche.source && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Source :</span>{" "}
            <span className="font-semibold">{fiche.source}</span>
          </div>
        )}
      </div>

      {/* Pourquoi */}
      {fiche.pourquoi && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Pourquoi cet outil ?</h2>
          <p className="text-litup-dark/80 leading-relaxed whitespace-pre-line">{fiche.pourquoi}</p>
        </div>
      )}

      {/* Objectifs */}
      {fiche.objectifs && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Objectifs</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.objectifs}</p>
        </div>
      )}

      {/* Matériel */}
      {fiche.materiel && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Matériel</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.materiel}</p>
        </div>
      )}

      {/* Déroulé */}
      {fiche.deroule && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Déroulé</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.deroule}</p>
        </div>
      )}

      {/* Conseils */}
      {fiche.conseils && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Conseils</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.conseils}</p>
        </div>
      )}

      {/* Variantes */}
      {fiche.variantes && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Variantes</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.variantes}</p>
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
                className="text-sm px-3 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: cle.couleur_hex ? `${cle.couleur_hex}18` : undefined,
                  color: cle.couleur_hex || undefined,
                }}
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

echo "  ✅ app/bao/[slug]/page.tsx (corrigé)"

# ============================================================
# 5. FIX app/parcours/page.tsx
# ============================================================

cat > app/parcours/page.tsx << 'PARCOURS_LIST_EOF'
import Link from "next/link";
import { getParcours, slugify } from "@/lib/supabase";

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

      {parcours.length === 0 ? (
        <p className="text-litup-dark/40 text-center py-12">
          Aucun parcours disponible pour le moment.
        </p>
      ) : (
        <div className="space-y-4">
          {parcours.map((p, i) => (
            <Link
              key={p.id}
              href={`/parcours/${slugify(p.titre)}`}
              className="group block bg-white rounded-xl border border-litup-dark/10
                         hover:border-litup-teal/30 hover:shadow-lg hover:shadow-litup-teal/5
                         transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-stretch">
                {/* Emoji + number */}
                <div
                  className="flex items-center justify-center w-16 sm:w-20 
                              text-white text-2xl font-bold shrink-0"
                  style={{ backgroundColor: p.couleur_hex || "#00989D" }}
                >
                  {p.emoji || String(i + 1).padStart(2, "0")}
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
      )}
    </div>
  );
}
PARCOURS_LIST_EOF

echo "  ✅ app/parcours/page.tsx (corrigé)"

# ============================================================
# 6. FIX app/parcours/[slug]/page.tsx
# ============================================================

mkdir -p "app/parcours/[slug]"

cat > "app/parcours/[slug]/page.tsx" << 'PARCOURS_DETAIL_EOF'
import Link from "next/link";
import { getParcours, getParcoursBySlug, getFichesByParcours, slugify, formatDuree } from "@/lib/supabase";

export async function generateStaticParams() {
  const parcours = await getParcours();
  return parcours.map((p) => ({ slug: slugify(p.titre) }));
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
        <h1 className="text-3xl font-bold text-litup-dark">
          {parcours.emoji && <span className="mr-2">{parcours.emoji}</span>}
          {parcours.titre}
        </h1>
        {parcours.description && (
          <p className="text-litup-dark/60 mt-2">{parcours.description}</p>
        )}
      </div>

      {/* Fiches timeline */}
      {fiches.length === 0 ? (
        <p className="text-litup-dark/40 text-center py-12">
          Aucune fiche associée à ce parcours.
        </p>
      ) : (
        <div className="space-y-0">
          {fiches.map((fiche, i) => (
            <div key={fiche.id} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full text-white 
                              flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: parcours.couleur_hex || "#00989D" }}
                >
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
                  {fiche.nom}
                </h3>
                {fiche.intention && (
                  <p className="text-sm text-litup-dark/60 mt-1 line-clamp-2 italic">
                    {fiche.intention}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-litup-dark/40">
                  {formatDuree(fiche) && <span>{formatDuree(fiche)}</span>}
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
PARCOURS_DETAIL_EOF

echo "  ✅ app/parcours/[slug]/page.tsx (corrigé)"

# ============================================================
# 7. FIX app/page.tsx — Hero couleurs
# ============================================================

cat > app/page.tsx << 'LANDING_EOF'
import Link from "next/link";

export default function Home() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-litup-dark">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-20 right-20 w-72 h-72 rounded-full bg-litup-gold blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full bg-litup-teal blur-3xl" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 py-24 sm:py-32 text-center">
          <p className="text-litup-gold font-semibold text-sm tracking-widest uppercase mb-6">
            Laboratoire pédagogique Lit uP
          </p>
          <h1 className="text-3xl sm:text-5xl font-bold text-white leading-tight">
            Des outils qui donnent le pouvoir d&apos;agir
            <br />
            <span className="text-litup-gold">aux jeunes comme aux équipes.</span>
          </h1>
          <p className="mt-6 text-lg text-white/80 max-w-2xl mx-auto">
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
              desc: "Enseignant·e, conseiller·ère, éducateur·ice, formateur·ice. Accédez aux outils pensés pour l'accompagnement structuré.",
              href: "/bao",
              accent: "#00989D",
            },
            {
              num: "02",
              title: "Pair·e aidant·e",
              desc: "Vous accompagnez vos pairs par l'expérience. Retrouvez les outils simples, éprouvés, pour faciliter la parole et l'action.",
              href: "/bao",
              accent: "#FCC33E",
            },
            {
              num: "03",
              title: "Explorer librement",
              desc: "Parcourez l'ensemble de la boîte sans filtre préalable. Naviguez par étape, par objectif ou par clé d'engagement.",
              href: "/bao",
              accent: "#6B2468",
            },
          ].map((card) => (
            <Link
              key={card.num}
              href={card.href}
              className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl 
                         border border-litup-dark/5 hover:border-litup-teal/30
                         transition-all duration-300 hover:-translate-y-1"
            >
              <span className="text-xs font-bold tracking-wider" style={{ color: card.accent }}>
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
            à l&apos;autonomie du groupe.
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

echo "  ✅ app/page.tsx (hero corrigé)"

echo ""
echo "============================================"
echo "✅ Tous les fichiers corrigés !"
echo "============================================"
echo ""
echo "Lance : npm run dev"
echo ""
