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
