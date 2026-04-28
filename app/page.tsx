import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export default async function Home() {
  // Test de connexion à Supabase
  let supabaseStatus = 'unknown';
  let errorMessage: string | null = null;
  let tablesFound: string[] = [];

  try {
    const supabase = await createClient();

    // Tente de récupérer les tables (juste pour voir si la connexion marche)
    const { error } = await supabase.from('profiles').select('id').limit(0);

    if (error) {
      // Si on a une erreur RLS, c'est BON SIGNE : la connexion marche !
      // (Les tables existent mais on n'est pas authentifié)
      if (error.code === 'PGRST301' || error.message.includes('RLS') || error.message.includes('policy')) {
        supabaseStatus = 'connected_rls_active';
      } else if (error.message.includes('does not exist')) {
        supabaseStatus = 'connected_no_tables';
        errorMessage = 'Connexion OK mais table profiles introuvable.';
      } else {
        supabaseStatus = 'error';
        errorMessage = error.message;
      }
    } else {
      supabaseStatus = 'connected';
      tablesFound = ['profiles'];
    }
  } catch (e) {
    supabaseStatus = 'error';
    errorMessage = e instanceof Error ? e.message : 'Erreur inconnue';
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        {/* Bandeau Lit uP */}
        <div className="bg-canard text-white rounded-t-2xl p-6 flex items-baseline gap-3">
          <span className="text-2xl font-bold">Lit uP</span>
          <span className="text-white text-lg font-bold">la boîte à outils</span>
          <span className="ml-auto text-sm font-bold opacity-90">
            🚧 Construction en cours
          </span>
        </div>

        {/* Contenu */}
        <div className="bg-white rounded-b-2xl shadow-lg p-8">
          <h1 className="text-3xl font-bold text-anthracite mb-2">
            BAO V6 — Phase 1 ✓
          </h1>
          <p className="text-anthracite-soft mb-6">
            Mise en place de l'infrastructure Vercel + Supabase.
          </p>

          <div className="bg-jaune-light/50 border-l-4 border-jaune-dark rounded-r-lg p-4 mb-6">
            <p className="text-sm">
              <strong>Cette page est temporaire.</strong> Elle sert à vérifier
              que Vercel et Supabase communiquent bien. Quand tout sera vert
              ci-dessous, on passera à la phase 2 (migration du contenu) puis
              à la phase 3 (authentification).
            </p>
          </div>

          {/* Tests de connexion */}
          <div className="space-y-3">
            <h2 className="text-xl font-bold text-canard-dark mb-3">
              État de la connexion
            </h2>

            <StatusItem
              label="Frontend Next.js"
              status="ok"
              detail="Cette page s'affiche, donc Vercel a bien déployé l'app."
            />

            <StatusItem
              label="Variables d'environnement"
              status={
                process.env.NEXT_PUBLIC_SUPABASE_URL ? 'ok' : 'error'
              }
              detail={
                process.env.NEXT_PUBLIC_SUPABASE_URL
                  ? `URL configurée : ${process.env.NEXT_PUBLIC_SUPABASE_URL}`
                  : 'NEXT_PUBLIC_SUPABASE_URL manquante'
              }
            />

            <StatusItem
              label="Connexion Supabase"
              status={
                supabaseStatus === 'connected' ||
                supabaseStatus === 'connected_rls_active'
                  ? 'ok'
                  : supabaseStatus === 'connected_no_tables'
                  ? 'warning'
                  : 'error'
              }
              detail={
                supabaseStatus === 'connected_rls_active'
                  ? 'Connexion établie. Les politiques RLS protègent les données (comportement normal).'
                  : supabaseStatus === 'connected'
                  ? `Tables accessibles : ${tablesFound.join(', ')}`
                  : errorMessage || 'État inconnu'
              }
            />
          </div>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-200 text-sm text-anthracite-soft">
            <p>
              <strong>Prochaine étape :</strong> migration du contenu actuel de la
              BAO (30 fiches, 30 PDF, parcours guidés) vers cette nouvelle
              architecture.
            </p>
          </div>
        </div>

        {/* Signature */}
        <p className="text-center mt-6 font-caveat text-xl text-canard-dark">
          Gratuite, ouverte, faite pour être partagée.
        </p>
      </div>
    </main>
  );
}

function StatusItem({
  label,
  status,
  detail,
}: {
  label: string;
  status: 'ok' | 'warning' | 'error';
  detail: string;
}) {
  const icons = {
    ok: '✅',
    warning: '⚠️',
    error: '❌',
  };
  const colors = {
    ok: 'border-green-300 bg-green-50',
    warning: 'border-jaune-dark bg-jaune-light/50',
    error: 'border-red-300 bg-red-50',
  };

  return (
    <div className={`border rounded-lg p-3 ${colors[status]}`}>
      <div className="flex items-start gap-3">
        <span className="text-xl flex-shrink-0">{icons[status]}</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-anthracite">{label}</div>
          <div className="text-sm text-anthracite-soft mt-1 break-all">
            {detail}
          </div>
        </div>
      </div>
    </div>
  );
}
