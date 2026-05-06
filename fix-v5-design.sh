#!/bin/bash
# ============================================================
# BAO V6 — Design V5-like (~25 min)
# Cartes avec badges étape, détail fiche avec sections colorées
# ============================================================

set -e
echo "🎨 Rapprochement design V5..."

# ============================================================
# 1. LIB SUPABASE — ajouter getEtapeById
# ============================================================

cat >> lib/supabase.ts << 'EOF'

// Additional helper
export async function getEtapeById(etapeId: string): Promise<Etape | null> {
  const { data, error } = await supabase
    .from("etapes_parcours")
    .select("*")
    .eq("id", etapeId)
    .single();
  if (error) return null;
  return data;
}
EOF

echo "  ✅ lib/supabase.ts (ajout getEtapeById)"

# ============================================================
# 2. FICHE CARD — style V5 avec badge étape
# ============================================================

cat > components/FicheCard.tsx << 'CARD_EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Fiche, Cle, Etape } from "@/lib/supabase";
import { formatDuree, getEtapeById } from "@/lib/supabase";

interface FicheCardProps {
  fiche: Fiche;
  cles?: Cle[];
}

export default function FicheCard({ fiche, cles = [] }: FicheCardProps) {
  const duree = formatDuree(fiche);
  const [etape, setEtape] = useState<Etape | null>(null);

  useEffect(() => {
    if (fiche.etape_id) {
      getEtapeById(fiche.etape_id).then(setEtape);
    }
  }, [fiche.etape_id]);

  return (
    <Link href={`/bao/${fiche.slug}`}
      className="group block bg-white rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
      style={{ borderColor: "rgba(43,52,66,0.08)" }}>

      {/* Header with etape badge */}
      <div className="px-5 pt-4 pb-2 flex items-center justify-between">
        {etape ? (
          <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded"
            style={{
              backgroundColor: etape.couleur_hex ? `${etape.couleur_hex}15` : "rgba(0,152,157,0.08)",
              color: etape.couleur_hex || "#00989D",
            }}>
            {etape.code} · {etape.nom}
          </span>
        ) : (
          <span className="text-[11px] font-bold tracking-wide uppercase px-2.5 py-1 rounded"
            style={{ backgroundColor: "rgba(43,52,66,0.05)", color: "rgba(43,52,66,0.4)" }}>
            Non classé
          </span>
        )}
        {fiche.public_pro_pair && (
          <span className="text-[10px] font-semibold uppercase tracking-wider"
            style={{ color: "rgba(43,52,66,0.35)" }}>
            {fiche.public_pro_pair}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="px-5 pb-4">
        <h3 className="font-bold text-[15px] leading-snug mt-1" style={{ color: "#2B3442" }}>
          {fiche.nom}
        </h3>

        {fiche.intention && (
          <p className="text-[13px] mt-2 line-clamp-3 italic leading-relaxed" style={{ color: "rgba(43,52,66,0.55)" }}>
            {fiche.intention}
          </p>
        )}

        {/* Metadata */}
        <div className="flex flex-wrap items-center gap-2 mt-3 text-[11px]" style={{ color: "rgba(43,52,66,0.45)" }}>
          {duree && (
            <span className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
              </svg>
              {duree}
            </span>
          )}
          {fiche.format && <span>{fiche.format}</span>}
          {fiche.materiel && <span>{fiche.materiel}</span>}
        </div>

        {/* Tags clés */}
        {cles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {cles.map((cle) => (
              <span key={cle.id} className="text-[11px] px-2.5 py-0.5 rounded-full font-semibold"
                style={{
                  backgroundColor: cle.couleur_hex || "#00989D",
                  color: "white",
                }}>
                {cle.nom.split(" (")[0]}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
CARD_EOF

echo "  ✅ components/FicheCard.tsx (style V5)"

# ============================================================
# 3. FICHE DETAIL — sections colorées style V5
# ============================================================

mkdir -p "app/bao/[slug]"

cat > "app/bao/[slug]/page.tsx" << 'DETAIL_EOF'
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFicheBySlug, getClesByFiche, getEtapeById, formatDuree, type Fiche, type Cle, type Etape } from "@/lib/supabase";

function renderList(data: any): React.ReactNode {
  if (!data) return null;
  if (typeof data === "string") return <p className="leading-relaxed">{data}</p>;
  if (Array.isArray(data)) {
    return (
      <ul className="space-y-2">
        {data.map((item: any, i: number) => (
          <li key={i} className="flex gap-2.5">
            <span className="shrink-0 mt-0.5" style={{ color: "#00989D" }}>•</span>
            <div>
              {typeof item === "string" ? (
                <span>{item}</span>
              ) : item.titre || item.title || item.item ? (
                <>
                  <span className="font-semibold" style={{ color: "#2B3442" }}>
                    {item.titre || item.title || item.item}
                  </span>
                  {(item.détail || item.detail || item.description) && (
                    <span className="ml-1">{item.détail || item.detail || item.description}</span>
                  )}
                </>
              ) : (
                <span>{Object.values(item).join(" — ")}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }
  return <p>{String(data)}</p>;
}

function renderDeroule(data: any): React.ReactNode {
  if (!data || !Array.isArray(data)) return renderList(data);
  return (
    <div className="space-y-4">
      {data.map((step: any, i: number) => (
        <div key={i} className="rounded-lg border-l-4 bg-white p-4"
          style={{ borderColor: "#00989D" }}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-full text-white text-xs font-bold flex items-center justify-center"
                style={{ backgroundColor: "#2B3442" }}>
                {step.étape || step.etape || i + 1}
              </span>
              <span className="font-bold" style={{ color: "#2B3442" }}>
                {step.titre || step.title || `Étape ${i + 1}`}
              </span>
            </div>
            {(step.durée || step.duree) && (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ backgroundColor: "#2B3442", color: "white" }}>
                {step.durée || step.duree}
              </span>
            )}
          </div>
          {step.actions && Array.isArray(step.actions) && (
            <ul className="space-y-1.5 ml-9">
              {step.actions.map((a: string, j: number) => (
                <li key={j} className="text-sm leading-relaxed" style={{ color: "rgba(43,52,66,0.7)" }}>
                  • <span dangerouslySetInnerHTML={{ __html: a }} />
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

export default function FicheDetailPage({ params }: { params: { slug: string } }) {
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [cles, setCles] = useState<Cle[]>([]);
  const [etape, setEtape] = useState<Etape | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const f = await getFicheBySlug(params.slug);
      if (f) {
        setFiche(f);
        const [c, e] = await Promise.all([
          getClesByFiche(f.id),
          f.etape_id ? getEtapeById(f.etape_id) : Promise.resolve(null),
        ]);
        setCles(c);
        setEtape(e);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center" style={{ color: "rgba(43,52,66,0.4)" }}>Chargement...</div>;

  if (!fiche) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#2B3442" }}>Fiche introuvable</h1>
        <Link href="/bao" className="mt-4 inline-block hover:underline" style={{ color: "#00989D" }}>← Retour</Link>
      </div>
    );
  }

  const duree = formatDuree(fiche);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/bao" className="text-sm hover:underline inline-flex items-center gap-1 mb-6" style={{ color: "#00989D" }}>← Retour aux outils</Link>

      {/* Etape badge */}
      {etape && (
        <span className="inline-block text-xs font-bold tracking-wide uppercase px-3 py-1.5 rounded mb-4"
          style={{ backgroundColor: etape.couleur_hex ? `${etape.couleur_hex}15` : "rgba(0,152,157,0.08)", color: etape.couleur_hex || "#00989D" }}>
          {etape.code} · {etape.nom}
        </span>
      )}

      <h1 className="text-3xl font-bold mb-2" style={{ color: "#2B3442" }}>{fiche.nom}</h1>

      {/* Metadata grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-5 bg-white rounded-xl border mb-6" style={{ borderColor: "rgba(43,52,66,0.08)" }}>
        {duree && <div><div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(43,52,66,0.35)" }}>Durée</div><div className="font-semibold text-sm">{duree}</div></div>}
        {fiche.format && <div><div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(43,52,66,0.35)" }}>Format</div><div className="font-semibold text-sm">{fiche.format}</div></div>}
        {fiche.materiel && <div><div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(43,52,66,0.35)" }}>Matériel</div><div className="font-semibold text-sm">{fiche.materiel}</div></div>}
        {fiche.source && <div><div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(43,52,66,0.35)" }}>Source</div><div className="font-semibold text-sm">{fiche.source}</div></div>}
        {fiche.public_pro_pair && <div><div className="text-[10px] font-bold uppercase tracking-wider mb-0.5" style={{ color: "rgba(43,52,66,0.35)" }}>Public visé</div><div className="font-semibold text-sm">{fiche.public_pro_pair}</div></div>}
      </div>

      {/* Intention — teal bg */}
      {fiche.intention && (
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "rgba(0,152,157,0.08)" }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#00989D" }}>L&apos;intention</div>
          <p className="text-[15px] leading-relaxed italic" style={{ color: "#2B3442" }}>{fiche.intention}</p>
        </div>
      )}

      {/* Pourquoi — gold bg */}
      {fiche.pourquoi && (
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "rgba(252,195,62,0.12)" }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#B8860B" }}>Pourquoi cet outil fonctionne</div>
          <p className="text-[15px] leading-relaxed" style={{ color: "#2B3442" }}>{fiche.pourquoi}</p>
        </div>
      )}

      {/* Matériel liste */}
      {fiche.materiel_liste && Array.isArray(fiche.materiel_liste) && fiche.materiel_liste.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#2B3442" }}>Ce dont vous avez besoin</h2>
          <div className="bg-white rounded-xl border p-5" style={{ borderColor: "rgba(43,52,66,0.08)" }}>
            {renderList(fiche.materiel_liste)}
          </div>
        </div>
      )}

      {/* Objectifs */}
      {fiche.objectifs && Array.isArray(fiche.objectifs) && fiche.objectifs.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#2B3442" }}>Objectifs pédagogiques</h2>
          <div style={{ color: "rgba(43,52,66,0.75)" }}>{renderList(fiche.objectifs)}</div>
        </div>
      )}

      {/* Déroulé */}
      {fiche.deroule && Array.isArray(fiche.deroule) && fiche.deroule.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#2B3442" }}>Le déroulé, étape par étape</h2>
          {renderDeroule(fiche.deroule)}
        </div>
      )}

      {/* Conseils — pink bg */}
      {fiche.conseils && Array.isArray(fiche.conseils) && fiche.conseils.length > 0 && (
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "rgba(107,36,104,0.06)" }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#6B2468" }}>Conseils pour bien animer</div>
          <div style={{ color: "rgba(43,52,66,0.75)" }}>{renderList(fiche.conseils)}</div>
        </div>
      )}

      {/* Variantes — gold bg */}
      {fiche.variantes && Array.isArray(fiche.variantes) && fiche.variantes.length > 0 && (
        <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: "rgba(252,195,62,0.1)" }}>
          <div className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: "#B8860B" }}>Variantes possibles</div>
          <div style={{ color: "rgba(43,52,66,0.75)" }}>{renderList(fiche.variantes)}</div>
        </div>
      )}

      {/* Clés */}
      {cles.length > 0 && (
        <div className="mb-6">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#2B3442" }}>Clés d&apos;engagement activées</h2>
          <div className="flex flex-wrap gap-2">
            {cles.map((cle) => (
              <span key={cle.id} className="text-sm px-3.5 py-1.5 rounded-full font-semibold"
                style={{ backgroundColor: cle.couleur_hex || "#00989D", color: "white" }}>
                {cle.nom.split(" (")[0]}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PDF + actions */}
      {fiche.pdf_url && (
        <div className="mt-8 flex flex-wrap gap-3 justify-center border-t border-dashed pt-8" style={{ borderColor: "rgba(43,52,66,0.15)" }}>
          <a href={fiche.pdf_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-full transition-colors hover:opacity-90 text-sm"
            style={{ backgroundColor: "#00989D", color: "white" }}>
            ↓ Télécharger la fiche PDF
          </a>
        </div>
      )}
    </div>
  );
}
DETAIL_EOF

echo "  ✅ app/bao/[slug]/page.tsx (style V5)"

echo ""
echo "============================================"
echo "✅ Design V5-like appliqué !"
echo "============================================"
echo ""
echo "Lance : rm -rf .next && npm run dev"
echo "Puis : git add -A && git commit -m 'Design V5-like: cards + fiche detail' && git push"
echo ""
