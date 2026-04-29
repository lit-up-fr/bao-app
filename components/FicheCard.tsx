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
