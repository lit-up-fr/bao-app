"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFicheBySlug, getClesByFiche, formatDuree, type Fiche, type Cle } from "@/lib/supabase";

export default function FicheDetailPage({ params }: { params: { slug: string } }) {
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [cles, setCles] = useState<Cle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const f = await getFicheBySlug(params.slug);
      if (f) {
        setFiche(f);
        const c = await getClesByFiche(f.id);
        setCles(c);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center">Chargement...</div>;

  if (!fiche) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold" style={{ color: "#2B3442" }}>Fiche introuvable</h1>
        <Link href="/bao" className="mt-4 inline-block hover:underline" style={{ color: "#00989D" }}>
          ← Retour à la boîte à outils
        </Link>
      </div>
    );
  }

  const duree = formatDuree(fiche);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/bao" className="text-sm hover:underline inline-flex items-center gap-1 mb-6" style={{ color: "#00989D" }}>
        ← Retour aux outils
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#2B3442" }}>{fiche.nom}</h1>
        {fiche.intention && <p className="text-lg mt-2 italic" style={{ color: "#2B344299" }}>{fiche.intention}</p>}
      </div>

      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl border border-gray-200 mb-8 text-sm">
        {duree && <div><span style={{ color: "#2B344266" }}>Durée : </span><span className="font-semibold">{duree}</span></div>}
        {fiche.participants && <div><span style={{ color: "#2B344266" }}>Participants : </span><span className="font-semibold">{fiche.participants}</span></div>}
        {fiche.format && <div><span style={{ color: "#2B344266" }}>Format : </span><span className="font-semibold">{fiche.format}</span></div>}
        {fiche.source && <div><span style={{ color: "#2B344266" }}>Source : </span><span className="font-semibold">{fiche.source}</span></div>}
      </div>

      {fiche.pourquoi && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#2B3442" }}>Pourquoi cet outil ?</h2>
          <p className="leading-relaxed whitespace-pre-line" style={{ color: "#2B3442CC" }}>{fiche.pourquoi}</p>
        </div>
      )}

      {fiche.objectifs && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#2B3442" }}>Objectifs</h2>
          <p className="whitespace-pre-line" style={{ color: "#2B3442CC" }}>{typeof fiche.objectifs === 'string' ? fiche.objectifs : JSON.stringify(fiche.objectifs)}</p>
        </div>
      )}

      {fiche.deroule && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#2B3442" }}>Déroulé</h2>
          <p className="whitespace-pre-line" style={{ color: "#2B3442CC" }}>{typeof fiche.deroule === 'string' ? fiche.deroule : JSON.stringify(fiche.deroule)}</p>
        </div>
      )}

      {fiche.conseils && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#2B3442" }}>Conseils</h2>
          <p className="whitespace-pre-line" style={{ color: "#2B3442CC" }}>{typeof fiche.conseils === 'string' ? fiche.conseils : JSON.stringify(fiche.conseils)}</p>
        </div>
      )}

      {fiche.variantes && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-2" style={{ color: "#2B3442" }}>Variantes</h2>
          <p className="whitespace-pre-line" style={{ color: "#2B3442CC" }}>{typeof fiche.variantes === 'string' ? fiche.variantes : JSON.stringify(fiche.variantes)}</p>
        </div>
      )}

      {cles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#2B3442" }}>Clés d&apos;engagement</h2>
          <div className="flex flex-wrap gap-2">
            {cles.map((cle) => (
              <span key={cle.id} className="text-sm px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: cle.couleur_hex ? `${cle.couleur_hex}18` : "#00989D18", color: cle.couleur_hex || "#00989D" }}>
                {cle.nom}
              </span>
            ))}
          </div>
        </div>
      )}

      {fiche.pdf_url && (
        <div className="mt-10 p-6 rounded-xl text-center" style={{ backgroundColor: "#2B3442" }}>
          <p className="text-sm mb-3" style={{ color: "#ffffffB3" }}>Téléchargez la fiche complète au format PDF</p>
          <a href={fiche.pdf_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors"
            style={{ backgroundColor: "#FCC33E", color: "#2B3442" }}>
            Télécharger le PDF
          </a>
        </div>
      )}
    </div>
  );
}
