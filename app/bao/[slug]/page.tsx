import Link from "next/link";
import { getFiches, getFicheBySlug, getClesByFiche, formatDuree } from "@/lib/supabase";

export async function generateStaticParams() {
  const fiches = await getFiches();
  return fiches.map((f) => ({ slug: f.slug }));
}

export default async function FicheDetailPage({
  params,
}: {
  params: { slug: string };
}) {
  const fiche = await getFicheBySlug(params.slug);

  if (!fiche) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-litup-dark">Fiche introuvable</h1>
        <Link href="/bao" className="text-litup-teal mt-4 inline-block hover:underline">
          ← Retour à la boîte à outils
        </Link>
      </div>
    );
  }

  const cles = await getClesByFiche(fiche.id);
  const duree = formatDuree(fiche);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <Link
        href="/bao"
        className="text-sm text-litup-teal hover:underline inline-flex items-center gap-1 mb-6"
      >
        ← Retour aux outils
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-litup-dark">{fiche.nom}</h1>
        {fiche.intention && (
          <p className="text-lg text-litup-dark/60 mt-2 italic">{fiche.intention}</p>
        )}
      </div>

      {/* Metadata bar */}
      <div className="flex flex-wrap gap-4 p-4 bg-white rounded-xl border border-litup-dark/10 mb-8">
        {duree && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Durée :</span>{" "}
            <span className="font-semibold">{duree}</span>
          </div>
        )}
        {fiche.participants && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Participants :</span>{" "}
            <span className="font-semibold">{fiche.participants}</span>
          </div>
        )}
        {fiche.format && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Format :</span>{" "}
            <span className="font-semibold">{fiche.format}</span>
          </div>
        )}
        {fiche.source && (
          <div className="text-sm">
            <span className="text-litup-dark/40">Source :</span>{" "}
            <span className="font-semibold">{fiche.source}</span>
          </div>
        )}
      </div>

      {/* Pourquoi */}
      {fiche.pourquoi && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Pourquoi cet outil ?</h2>
          <p className="text-litup-dark/80 leading-relaxed whitespace-pre-line">{fiche.pourquoi}</p>
        </div>
      )}

      {/* Objectifs */}
      {fiche.objectifs && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Objectifs</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.objectifs}</p>
        </div>
      )}

      {/* Matériel */}
      {fiche.materiel && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Matériel</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.materiel}</p>
        </div>
      )}

      {/* Déroulé */}
      {fiche.deroule && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Déroulé</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.deroule}</p>
        </div>
      )}

      {/* Conseils */}
      {fiche.conseils && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Conseils</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.conseils}</p>
        </div>
      )}

      {/* Variantes */}
      {fiche.variantes && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-2">Variantes</h2>
          <p className="text-litup-dark/80 whitespace-pre-line">{fiche.variantes}</p>
        </div>
      )}

      {/* Clés d'engagement */}
      {cles.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-bold text-litup-dark mb-3">
            Clés d'engagement
          </h2>
          <div className="flex flex-wrap gap-2">
            {cles.map((cle) => (
              <span
                key={cle.id}
                className="text-sm px-3 py-1 rounded-full font-medium"
                style={{
                  backgroundColor: cle.couleur_hex ? `${cle.couleur_hex}18` : undefined,
                  color: cle.couleur_hex || undefined,
                }}
              >
                {cle.nom}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* PDF download */}
      {fiche.pdf_url && (
        <div className="mt-10 p-6 bg-litup-dark rounded-xl text-center">
          <p className="text-white/70 text-sm mb-3">
            Téléchargez la fiche complète au format PDF
          </p>
          <a
            href={fiche.pdf_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-6 py-3 bg-litup-gold 
                       text-litup-dark font-bold rounded-lg 
                       hover:bg-litup-gold/90 transition-colors"
          >
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
