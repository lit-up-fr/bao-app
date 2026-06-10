import { createClient as createSupabaseClient, type SupabaseClient } from "@supabase/supabase-js";
import { createClient as createCookieClient } from "@/lib/supabase/server";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export interface ServerAuthContext {
  user: { id: string; email: string | null } | null;
  isAdmin: boolean;
  isActive: boolean;
}

const ANONYMOUS: ServerAuthContext = { user: null, isAdmin: false, isActive: false };

/**
 * Authentifie une requête de route API côté serveur.
 *
 * Ne JAMAIS faire confiance au corps de la requête pour l'identité : l'identité
 * est dérivée de la session validée par Supabase.
 *
 * Deux transports de session sont supportés :
 *   1. En-tête `Authorization: Bearer <access_token>` — cas principal de l'app
 *      (les sessions sont stockées côté navigateur en localStorage via
 *      @supabase/supabase-js, cf. lib/supabase.ts → utiliser `authHeaders()`).
 *   2. Cookies de session (@supabase/ssr) — fallback.
 *
 * Renvoie l'utilisateur authentifié ainsi que son statut admin / actif, lus
 * dans `profiles` sous le contexte RLS de l'utilisateur (lecture de sa propre
 * ligne autorisée par la policy "Read profiles").
 */
export async function getServerAuthContext(req?: Request): Promise<ServerAuthContext> {
  let client: SupabaseClient | null = null;
  let userId: string | null = null;
  let userEmail: string | null = null;

  // ─── 1. Bearer token (sessions localStorage) ───
  const authHeader =
    req?.headers.get("authorization") || req?.headers.get("Authorization") || null;
  const token =
    authHeader && authHeader.toLowerCase().startsWith("bearer ")
      ? authHeader.slice(7).trim()
      : null;

  if (token) {
    const bearerClient = createSupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${token}` } },
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { data } = await bearerClient.auth.getUser(token);
    if (data.user) {
      client = bearerClient;
      userId = data.user.id;
      userEmail = data.user.email ?? null;
    }
  }

  // ─── 2. Fallback : session par cookies (@supabase/ssr) ───
  if (!userId) {
    try {
      const cookieClient = await createCookieClient();
      const { data } = await cookieClient.auth.getUser();
      if (data.user) {
        client = cookieClient as unknown as SupabaseClient;
        userId = data.user.id;
        userEmail = data.user.email ?? null;
      }
    } catch {
      // Pas de contexte cookies disponible (ex. en-tête seul) : on ignore.
    }
  }

  if (!client || !userId) return ANONYMOUS;

  // ─── 3. Statut admin / actif depuis le profil ───
  const { data: profile } = await client
    .from("profiles")
    .select("is_admin, status")
    .eq("id", userId)
    .maybeSingle();

  return {
    user: { id: userId, email: userEmail },
    isAdmin: (profile as { is_admin?: boolean } | null)?.is_admin === true,
    isActive: (profile as { status?: string } | null)?.status === "active",
  };
}
