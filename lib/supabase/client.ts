import { createBrowserClient } from '@supabase/ssr';

/**
 * Client Supabase à utiliser côté navigateur.
 * Utilise la clé publique (publishable) — sans risque d'exposition.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
