import Link from "next/link";
import { getParcours } from "@/lib/supabase";

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

      <div className="space-y-4">
        {parcours.map((p, i) => (
          <Link
            key={p.id}
            href={`/parcours/${p.slug}`}
            className="group block bg-white rounded-xl border border-litup-dark/10
                       hover:border-litup-teal/30 hover:shadow-lg hover:shadow-litup-teal/5
                       transition-all duration-300 overflow-hidden"
          >
            <div className="flex items-stretch">
              {/* Number */}
              <div className="flex items-center justify-center w-16 sm:w-20 
                            bg-litup-teal text-white text-2xl font-bold shrink-0">
                {String(i + 1).padStart(2, "0")}
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
                <div className="flex items-center gap-4 mt-3 text-xs text-litup-dark/40">
                  {p.public_cible && <span>Public : {p.public_cible}</span>}
                  {p.duree_estimee && <span>Durée : {p.duree_estimee}</span>}
                </div>
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
    </div>
  );
}
