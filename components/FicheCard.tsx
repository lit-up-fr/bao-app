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
