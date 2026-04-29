import Link from "next/link";
import { getParcours, getParcoursBySlug, getFichesByParcours, slugify, formatDuree } from "@/lib/supabase";

export async function generateStaticParams() {
  const parcours = await getParcours();
  return parcours.map((p) => ({ slug: slugify(p.titre) }));
}

export default async function ParcoursDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const parcours = await getParcoursBySlug(params.slug);

  if (!parcours) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-litup-dark">Parcours introuvable</h1>
        <Link href="/parcours" className="text-litup-teal mt-4 inline-block hover:underline">
          ← Retour aux parcours
        </Link>
      </div>
    );
  }

  const fiches = await getFichesByParcours(parcours.id);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <Link
        href="/parcours"
        className="text-sm text-litup-teal hover:underline inline-flex items-center gap-1 mb-6"
      >
        ← Retour aux parcours
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-litup-dark">
          {parcours.emoji && <span className="mr-2">{parcours.emoji}</span>}
          {parcours.titre}
        </h1>
        {parcours.description && (
          <p className="text-litup-dark/60 mt-2">{parcours.description}</p>
        )}
      </div>

      {/* Fiches timeline */}
      {fiches.length === 0 ? (
        <p className="text-litup-dark/40 text-center py-12">
          Aucune fiche associée à ce parcours.
        </p>
      ) : (
        <div className="space-y-0">
          {fiches.map((fiche, i) => (
            <div key={fiche.id} className="flex gap-4">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className="w-8 h-8 rounded-full text-white 
                              flex items-center justify-center text-sm font-bold shrink-0"
                  style={{ backgroundColor: parcours.couleur_hex || "#00989D" }}
                >
                  {i + 1}
                </div>
                {i < fiches.length - 1 && (
                  <div className="w-0.5 flex-1 bg-litup-teal/20 my-1" />
                )}
              </div>

              {/* Card */}
              <Link
                href={`/bao/${fiche.slug}`}
                className="group flex-1 bg-white rounded-xl border border-litup-dark/10
                           hover:border-litup-teal/30 hover:shadow-md
                           transition-all duration-300 p-4 mb-4"
              >
                <h3 className="font-bold text-litup-dark group-hover:text-litup-teal transition-colors">
                  {fiche.nom}
                </h3>
                {fiche.intention && (
                  <p className="text-sm text-litup-dark/60 mt-1 line-clamp-2 italic">
                    {fiche.intention}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-2 text-xs text-litup-dark/40">
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
