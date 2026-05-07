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
  created_at?: string;
  updated_at?: string;
  last_seen_at?: string;
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
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error("Erreur lors de la création du compte");

  // Créer le profil
  const { error: profileError } = await supabase.from("profiles").insert({
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
  });

  if (profileError) throw profileError;

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
