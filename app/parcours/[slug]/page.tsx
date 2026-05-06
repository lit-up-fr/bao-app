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

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center">Chargement...</div>;

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
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/parcours" className="text-sm hover:underline inline-flex items-center gap-1 mb-6" style={{ color: "#00989D" }}>
        ← Retour aux parcours
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#2B3442" }}>
          {parcours.emoji && <span className="mr-2">{parcours.emoji}</span>}
          {parcours.titre}
        </h1>
        {parcours.description && (
          <p className="mt-2" style={{ color: "#2B344299" }}>{parcours.description}</p>
        )}
      </div>

      {fiches.length === 0 ? (
        <p className="text-center py-12" style={{ color: "#2B344266" }}>Aucune fiche associée.</p>
      ) : (
        <div className="space-y-0">
          {fiches.map((fiche, i) => (
            <div key={fiche.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full text-white flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: parcours.couleur_hex || "#00989D" }}
                >
                  {i + 1}
                </div>
                {i < fiches.length - 1 && (
                  <div className="w-0.5 flex-1 my-1" style={{ backgroundColor: "#00989D33" }} />
                )}
              </div>
              <Link
                href={`/bao/${fiche.slug}`}
                className="group flex-1 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-all duration-300 p-4 mb-4"
              >
                <h3 className="font-bold" style={{ color: "#2B3442" }}>{fiche.nom}</h3>
                {fiche.intention && (
                  <p className="text-sm mt-1 italic" style={{ color: "#2B344299" }}>{fiche.intention}</p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs" style={{ color: "#2B344266" }}>
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
