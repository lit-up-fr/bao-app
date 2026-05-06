"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getFicheBySlug, getClesByFiche, formatDuree, type Fiche, type Cle } from "@/lib/supabase";

function renderJsonField(data: any): React.ReactNode {
  if (!data) return null;
  if (typeof data === "string") return <p className="whitespace-pre-line">{data}</p>;
  if (Array.isArray(data)) {
    return (
      <ul className="space-y-2">
        {data.map((item: any, i: number) => (
          <li key={i} className="flex gap-2">
            <span className="font-bold shrink-0" style={{ color: "#00989D" }}>•</span>
            <div>
              {typeof item === "string" ? (
                <span>{item}</span>
              ) : item.titre || item.title || item.item ? (
                <>
                  <span className="font-semibold">{item.titre || item.title || item.item}</span>
                  {(item.détail || item.detail || item.description) && (
                    <span style={{ color: "rgba(43,52,66,0.65)" }}> — {item.détail || item.detail || item.description}</span>
                  )}
                  {item.durée && <span className="text-sm ml-2" style={{ color: "rgba(43,52,66,0.4)" }}>({item.durée})</span>}
                  {item.actions && Array.isArray(item.actions) && (
                    <ul className="mt-1 ml-4 space-y-1">
                      {item.actions.map((a: string, j: number) => (
                        <li key={j} className="text-sm" style={{ color: "rgba(43,52,66,0.6)" }}>
                          <span dangerouslySetInnerHTML={{ __html: a.replace(/<\/?strong>/g, (m: string) => m).replace(/<\/?em>/g, (m: string) => m) }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <span>{JSON.stringify(item)}</span>
              )}
            </div>
          </li>
        ))}
      </ul>
    );
  }
  return <p>{JSON.stringify(data)}</p>;
}

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

  if (loading) return <div className="max-w-3xl mx-auto px-4 py-20 text-center" style={{ color: "rgba(43,52,66,0.4)" }}>Chargement...</div>;

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

  const sections = [
    { label: "Pourquoi cet outil ?", data: fiche.pourquoi },
    { label: "Objectifs", data: fiche.objectifs },
    { label: "Matériel nécessaire", data: fiche.materiel_liste },
    { label: "Déroulé", data: fiche.deroule },
    { label: "Conseils", data: fiche.conseils },
    { label: "Variantes", data: fiche.variantes },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link href="/bao" className="text-sm hover:underline inline-flex items-center gap-1 mb-6" style={{ color: "#00989D" }}>
        ← Retour aux outils
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#2B3442" }}>{fiche.nom}</h1>
        {fiche.intention && <p className="text-lg mt-2 italic" style={{ color: "rgba(43,52,66,0.55)" }}>{fiche.intention}</p>}
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl border mb-8 text-sm" style={{ borderColor: "rgba(43,52,66,0.1)" }}>
        {duree && <div><span style={{ color: "rgba(43,52,66,0.4)" }}>Durée : </span><span className="font-semibold">{duree}</span></div>}
        {fiche.participants && <div><span style={{ color: "rgba(43,52,66,0.4)" }}>Participants : </span><span className="font-semibold">{fiche.participants}</span></div>}
        {fiche.format && <div><span style={{ color: "rgba(43,52,66,0.4)" }}>Format : </span><span className="font-semibold">{fiche.format}</span></div>}
        {fiche.source && <div><span style={{ color: "rgba(43,52,66,0.4)" }}>Source : </span><span className="font-semibold">{fiche.source}</span></div>}
      </div>

      {/* Content sections */}
      {sections.map(({ label, data }) => {
        if (!data || (Array.isArray(data) && data.length === 0)) return null;
        return (
          <div key={label} className="mb-8">
            <h2 className="text-lg font-bold mb-3" style={{ color: "#2B3442" }}>{label}</h2>
            <div style={{ color: "rgba(43,52,66,0.75)" }}>
              {renderJsonField(data)}
            </div>
          </div>
        );
      })}

      {/* Clés */}
      {cles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold mb-3" style={{ color: "#2B3442" }}>Clés d&apos;engagement</h2>
          <div className="flex flex-wrap gap-2">
            {cles.map((cle) => (
              <span key={cle.id} className="text-sm px-3 py-1 rounded-full font-medium"
                style={{ backgroundColor: cle.couleur_hex ? `${cle.couleur_hex}18` : "rgba(0,152,157,0.1)", color: cle.couleur_hex || "#00989D" }}>
                {cle.nom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PDF */}
      {fiche.pdf_url && (
        <div className="mt-10 p-6 rounded-xl text-center" style={{ backgroundColor: "#2B3442" }}>
          <p className="text-sm mb-3" style={{ color: "rgba(255,255,255,0.65)" }}>Téléchargez la fiche complète au format PDF</p>
          <a href={fiche.pdf_url} target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 font-bold rounded-lg transition-colors hover:opacity-90"
            style={{ backgroundColor: "#FCC33E", color: "#2B3442" }}>
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
