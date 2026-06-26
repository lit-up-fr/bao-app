import { supabase } from "./supabase";

// Types
export interface Profile {
  id: string;
  email: string;
  prenom: string;
  nom: string;
  telephone?: string;
  structure?: string;
  poste?: string;
  code_postal?: string;
  categorie_pro: string;
  categorie_pro_autre?: string;
  region?: string;
  tranche_age?: string;
  public_accompagne?: string;
  newsletter_consent: boolean;
  cgu_accepted_at?: string;
  privacy_accepted_at?: string;
  status: "en_attente" | "active" | "suspended" | "refused";
  is_admin: boolean;
  admin_role?: string | null;
  // 🆕 Nouveau : un admin peut cumuler plusieurs rôles (super_admin override les autres)
  admin_roles?: string[] | null;
  created_at?: string;
  updated_at?: string;
  last_seen_at?: string;
  // Nombre total de connexions (alimenté par le trigger on_auth_user_login).
  login_count?: number;
}

export interface SignUpData {
  email: string;
  password: string;
  prenom: string;
  nom: string;
  telephone?: string;
  structure?: string;
  poste?: string;
  code_postal?: string;
  categorie_pro: string;
  categorie_pro_autre?: string;
  region?: string;
  tranche_age?: string;
  public_accompagne?: string;
  newsletter_consent: boolean;
}

// Inscription
export async function signUp(data: SignUpData) {
  // Les données de profil sont passées en métadonnées (raw_user_meta_data).
  // Le trigger serveur on_auth_user_created (migration
  // auto_create_profile_on_signup) crée le profil à partir de ces métadonnées,
  // ce qui fonctionne même quand la confirmation d'email est activée (auth.signUp
  // ne renvoie alors pas de session et un INSERT direct serait bloqué par le RLS).
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        prenom: data.prenom,
        nom: data.nom,
        telephone: data.telephone || "",
        structure: data.structure || "",
        poste: data.poste || "",
        code_postal: data.code_postal || "",
        categorie_pro: data.categorie_pro,
        categorie_pro_autre: data.categorie_pro_autre || "",
        region: data.region || "",
        tranche_age: data.tranche_age || "",
        public_accompagne: data.public_accompagne || "",
        newsletter_consent: data.newsletter_consent,
      },
    },
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Erreur lors de la création du compte");

  // Si une session est immédiatement disponible (confirmation d'email
  // désactivée), on complète le profil créé par le trigger via un upsert pour
  // refléter l'intégralité des données saisies. En l'absence de session
  // (confirmation activée), le client reste « anon » : on ne tente pas l'écriture
  // (elle serait refusée par le RLS) et on s'appuie sur le trigger serveur.
  if (authData.session) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: authData.user.id,
        email: data.email,
        prenom: data.prenom,
        nom: data.nom,
        telephone: data.telephone || null,
        structure: data.structure || null,
        poste: data.poste || null,
        code_postal: data.code_postal || null,
        categorie_pro: data.categorie_pro,
        categorie_pro_autre: data.categorie_pro_autre || null,
        region: data.region || null,
        tranche_age: data.tranche_age || null,
        public_accompagne: data.public_accompagne || null,
        newsletter_consent: data.newsletter_consent,
        cgu_accepted_at: new Date().toISOString(),
        privacy_accepted_at: new Date().toISOString(),
        status: "en_attente",
        is_admin: false,
      },
      { onConflict: "id" }
    );

    // Le profil a déjà été créé par le trigger : un échec ici (ex. RLS) ne doit
    // pas faire échouer l'inscription, on se contente de le tracer.
    if (profileError) {
      console.error("signUp upsert profile:", profileError.message);
    }
  }

  return authData;
}

// Connexion
export async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (error) throw error;

  // Mettre à jour last_seen_at
  if (data.user) {
    await supabase
      .from("profiles")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", data.user.id);
  }

  return data;
}

// Déconnexion
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Récupérer le profil de l'utilisateur connecté
export async function getCurrentProfile(): Promise<Profile | null> {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  return getProfileByUserId(user.id);
}

// Récupérer un profil par user id (utile juste après signIn)
export async function getProfileByUserId(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("getProfileByUserId error:", error.message, error.code);
    return null;
  }
  return data as Profile;
}

// Récupérer l'utilisateur auth courant
export async function getCurrentUser() {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

// Vérifier si l'utilisateur est admin
export async function isAdmin(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.is_admin === true;
}

// Vérifier si l'utilisateur est approuvé (actif)
export async function isApproved(): Promise<boolean> {
  const profile = await getCurrentProfile();
  return profile?.status === "active";
}

// === Admin : gestion des utilisateurs ===

export async function getAllProfiles(): Promise<Profile[]> {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data as Profile[]) || [];
}

export async function updateProfileStatus(
  userId: string,
  status: Profile["status"]
) {
  const { error } = await supabase
    .from("profiles")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
}

// Champs de profil éditables par un admin (infos « non privilégiées » : ni
// is_admin, ni admin_role(s), ni status). L'email n'est pas modifiable ici car
// il sert d'identifiant de connexion (changement à gérer côté Auth).
export interface ProfileEditableInfo {
  prenom?: string;
  nom?: string;
  telephone?: string | null;
  structure?: string | null;
  poste?: string | null;
  code_postal?: string | null;
  categorie_pro?: string;
  categorie_pro_autre?: string | null;
  region?: string | null;
  tranche_age?: string | null;
  public_accompagne?: string | null;
}

// Met à jour les informations d'un profil. Les droits sont garantis côté serveur
// par le RLS « Update profiles » (un admin simple ne peut éditer qu'un non-admin,
// un super-admin peut éditer tout le monde).
export async function updateProfileInfo(
  userId: string,
  info: ProfileEditableInfo
) {
  const { error } = await supabase
    .from("profiles")
    .update({ ...info, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) throw error;
}

export async function updateProfileRole(
  userId: string,
  isAdmin: boolean,
  adminRole: string | null
) {
  const { error } = await supabase
    .from("profiles")
    .update({
      is_admin: isAdmin,
      admin_role: adminRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

// 🆕 Nouvelle fonction : update plusieurs rôles à la fois (admin_roles[])
// Garde aussi admin_role à jour pour compatibilité (= 1er rôle du tableau).
export async function updateProfileRoles(
  userId: string,
  isAdmin: boolean,
  adminRoles: string[]
) {
  const cleanRoles = (adminRoles || []).filter((r) => r && r.trim().length > 0);
  // Pour rétrocompat, on garde aussi admin_role = 1er rôle (ou null si vide)
  const legacyAdminRole = cleanRoles.length > 0 ? cleanRoles[0] : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      is_admin: isAdmin,
      admin_roles: cleanRoles,
      admin_role: legacyAdminRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", userId);

  if (error) throw error;
}

export async function deleteUserCompletely(userId: string) {
  // Passe par le wrapper admin_delete_user (vérifie is_admin() côté serveur),
  // car delete_user_completely n'est plus exécutable par le rôle authenticated.
  const { error } = await supabase.rpc("admin_delete_user", {
    target_user_id: userId,
  });
  if (error) throw error;
}

// === Journalisation des erreurs d'authentification (alertes admin) ===

export type AuthErrorKind = "signup" | "login";

export interface AuthErrorLog {
  id: string;
  kind: AuthErrorKind;
  email: string | null;
  message: string | null;
  is_system: boolean;
  seen: boolean;
  created_at: string;
}

// Erreurs « normales » (comportement utilisateur attendu) : on les journalise
// mais sans déclencher d'alerte système (is_system = false).
function isExpectedAuthError(message: string): boolean {
  const m = (message || "").toLowerCase();
  return (
    m.includes("invalid login") ||
    m.includes("invalid credentials") ||
    m.includes("already registered") ||
    m.includes("already been registered") ||
    m.includes("user already exists") ||
    m.includes("email not confirmed") ||
    m.includes("rate limit") ||
    m.includes("password should be")
  );
}

// À appeler depuis les pages d'inscription / connexion en cas d'erreur.
// Ne lève jamais : la journalisation ne doit pas casser le flux.
export async function logAuthError(
  kind: AuthErrorKind,
  email: string,
  message: string
) {
  try {
    await supabase.rpc("log_auth_error", {
      p_kind: kind,
      p_email: email || "",
      p_message: message || "",
      p_is_system: !isExpectedAuthError(message),
    });
  } catch (e) {
    console.error("logAuthError:", e);
  }
}

export async function getAuthErrorLogs(limit = 200): Promise<AuthErrorLog[]> {
  const { data, error } = await supabase
    .from("auth_error_logs")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(limit);
  if (error) {
    console.error("getAuthErrorLogs error:", error.message);
    return [];
  }
  return (data as AuthErrorLog[]) || [];
}

// Nombre d'alertes système non lues (pour le badge de la sidebar).
export async function getUnseenSystemAlertCount(): Promise<number> {
  const { count, error } = await supabase
    .from("auth_error_logs")
    .select("*", { count: "exact", head: true })
    .eq("is_system", true)
    .eq("seen", false);
  if (error) return 0;
  return count || 0;
}

export async function markAuthErrorSeen(id: string, seen = true) {
  const { error } = await supabase
    .from("auth_error_logs")
    .update({ seen })
    .eq("id", id);
  if (error) throw error;
}

export async function markAllAuthErrorsSeen() {
  const { error } = await supabase
    .from("auth_error_logs")
    .update({ seen: true })
    .eq("seen", false);
  if (error) throw error;
}

export async function deleteAuthErrorLog(id: string) {
  const { error } = await supabase
    .from("auth_error_logs")
    .delete()
    .eq("id", id);
  if (error) throw error;
}

// === Favoris ===

export async function getFavoris(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from("favoris")
    .select("fiche_id")
    .eq("user_id", userId);

  if (error) return [];
  return data.map((f: { fiche_id: string }) => f.fiche_id);
}

export async function toggleFavori(userId: string, ficheId: string) {
  // Vérifier si le favori existe
  const { data } = await supabase
    .from("favoris")
    .select("fiche_id")
    .eq("user_id", userId)
    .eq("fiche_id", ficheId)
    .maybeSingle();

  if (data) {
    // Supprimer
    await supabase
      .from("favoris")
      .delete()
      .eq("user_id", userId)
      .eq("fiche_id", ficheId);
    return false;
  } else {
    // Ajouter
    await supabase
      .from("favoris")
      .insert({ user_id: userId, fiche_id: ficheId });
    return true;
  }
}

// === Consultations ===

export async function logConsultation(userId: string, ficheId: string) {
  await supabase
    .from("consultations")
    .insert({ user_id: userId, fiche_id: ficheId });
}

// === Retours d'expérience ===

export interface Retour {
  id: string;
  fiche_id: string;
  user_id: string;
  contenu: string;
  note: number | null;
  created_at: string;
  updated_at: string;
  is_visible: boolean;
  // Jointure
  profile?: {
    prenom: string;
    nom: string;
    structure: string | null;
    categorie_pro: string | null;
    poste: string | null;
    avatar_url: string | null;
  };
}

export async function getRetoursByFiche(ficheId: string): Promise<Retour[]> {
  const { data, error } = await supabase
    .from("retours")
    .select("*, profile:profiles(prenom, nom, structure, categorie_pro, poste, avatar_url)")
    .eq("fiche_id", ficheId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getRetoursByFiche error:", error);
    return [];
  }
  return (data as Retour[]) || [];
}

export async function createRetour(
  ficheId: string,
  userId: string,
  contenu: string,
  note: number | null
) {
  const { data, error } = await supabase
    .from("retours")
    .insert({ fiche_id: ficheId, user_id: userId, contenu, note })
    .select("*, profile:profiles(prenom, nom, structure, categorie_pro, poste, avatar_url)")
    .single();

  if (error) throw error;
  return data as Retour;
}

export async function updateRetour(
  retourId: string,
  contenu: string,
  note: number | null
) {
  const { error } = await supabase
    .from("retours")
    .update({ contenu, note, updated_at: new Date().toISOString() })
    .eq("id", retourId);

  if (error) throw error;
}

export async function deleteRetour(retourId: string) {
  const { error } = await supabase
    .from("retours")
    .delete()
    .eq("id", retourId);

  if (error) throw error;
}

export async function toggleRetourVisibility(retourId: string, isVisible: boolean) {
  const { error } = await supabase
    .from("retours")
    .update({ is_visible: isVisible })
    .eq("id", retourId);

  if (error) throw error;
}

// === Propositions ===

export interface Proposition {
  id: string;
  user_id: string;
  titre: string;
  description: string;
  contexte?: string | null;
  objectifs?: string | null;
  public_cible?: string | null;
  format_suggere?: string | null;
  duree_estimee?: string | null;
  lien_ressource?: string | null;
  status: "en_attente" | "acceptee" | "refusee" | "en_discussion";
  admin_commentaire?: string | null;
  created_at: string;
  updated_at: string;
  profile?: {
    prenom: string;
    nom: string;
    structure: string | null;
    categorie_pro: string | null;
    poste: string | null;
    avatar_url: string | null;
  };
}

export async function createProposition(
  userId: string,
  data: {
    titre: string;
    description: string;
    contexte?: string;
    objectifs?: string;
    public_cible?: string;
    format_suggere?: string;
    duree_estimee?: string;
    lien_ressource?: string;
  }
) {
  const { data: result, error } = await supabase
    .from("propositions")
    .insert({ user_id: userId, ...data })
    .select()
    .single();

  if (error) throw error;
  return result as Proposition;
}

export async function getMyPropositions(userId: string): Promise<Proposition[]> {
  const { data, error } = await supabase
    .from("propositions")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) return [];
  return (data as Proposition[]) || [];
}

export async function getAllPropositions(): Promise<Proposition[]> {
  const { data, error } = await supabase
    .from("propositions")
    .select("*, profile:profiles(prenom, nom, structure, categorie_pro, poste, avatar_url)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getAllPropositions error:", error);
    return [];
  }
  return (data as Proposition[]) || [];
}

export async function updatePropositionStatus(
  propositionId: string,
  status: Proposition["status"],
  adminCommentaire?: string
) {
  const update: Record<string, unknown> = {
    status,
    updated_at: new Date().toISOString(),
  };
  if (adminCommentaire !== undefined) {
    update.admin_commentaire = adminCommentaire;
  }

  const { error } = await supabase
    .from("propositions")
    .update(update)
    .eq("id", propositionId);

  if (error) throw error;
}
