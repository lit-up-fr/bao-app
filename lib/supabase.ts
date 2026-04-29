import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ---------- Types ----------

export interface Fiche {
  id: string;
  slug: string;
  titre: string;
  sous_titre: string | null;
  description: string;
  objectif: string | null;
  duree_minutes: number | null;
  nb_participants_min: number | null;
  nb_participants_max: number | null;
  materiel: string | null;
  source: string | null;
  pdf_url: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Cle {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  icone: string | null;
  ordre: number;
}

export interface Etape {
  id: string;
  slug: string;
  nom: string;
  description: string | null;
  ordre: number;
}

export interface Parcours {
  id: string;
  slug: string;
  titre: string;
  description: string | null;
  public_cible: string | null;
  duree_estimee: string | null;
  ordre: number;
}

// ---------- Data fetchers ----------

export async function getFiches(): Promise<Fiche[]> {
  const { data, error } = await supabase
    .from("fiches")
    .select("*")
    .order("titre");
  if (error) throw error;
  return data || [];
}

export async function getFicheBySlug(slug: string): Promise<Fiche | null> {
  const { data, error } = await supabase
    .from("fiches")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getCles(): Promise<Cle[]> {
  const { data, error } = await supabase
    .from("cles")
    .select("*")
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function getEtapes(): Promise<Etape[]> {
  const { data, error } = await supabase
    .from("etapes_parcours")
    .select("*")
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function getClesByFiche(ficheId: string): Promise<Cle[]> {
  const { data, error } = await supabase
    .from("fiches_cles")
    .select("cle_id, cles(*)")
    .eq("fiche_id", ficheId);
  if (error) throw error;
  return (data || []).map((d: any) => d.cles).filter(Boolean);
}

export async function getFichesByCle(cleId: string): Promise<Fiche[]> {
  const { data, error } = await supabase
    .from("fiches_cles")
    .select("fiche_id, fiches(*)")
    .eq("cle_id", cleId);
  if (error) throw error;
  return (data || []).map((d: any) => d.fiches).filter(Boolean);
}

export async function getParcours(): Promise<Parcours[]> {
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .order("ordre");
  if (error) throw error;
  return data || [];
}

export async function getParcoursBySlug(slug: string): Promise<Parcours | null> {
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .eq("slug", slug)
    .single();
  if (error) return null;
  return data;
}

export async function getFichesByParcours(parcoursId: string): Promise<Fiche[]> {
  const { data, error } = await supabase
    .from("parcours_fiches")
    .select("fiche_id, ordre, fiches(*)")
    .eq("parcours_id", parcoursId)
    .order("ordre");
  if (error) throw error;
  return (data || []).map((d: any) => d.fiches).filter(Boolean);
}
