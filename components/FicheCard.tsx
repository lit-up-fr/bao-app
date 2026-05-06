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
