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
