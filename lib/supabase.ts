import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ---------- Types (vrais schémas Supabase) ----------

export interface Fiche {
  id: string;
  slug: string;
  nom: string;
  etape_id: string | null;
  duree_min: number | null;
  duree_max: number | null;
  duree_libre: string | null;
  format: string | null;
  participants: string | null;
  materiel: string | null;
  pour_qui: string | null;
  public_pro_pair: string | null;
  type_outil: string | null;
  intention: string | null;
  pourquoi: string | null;
  objectifs: string | null;
  materiel_liste: string | null;
  deroule: string | null;
  conseils: string | null;
  variantes: string | null;
  source: string | null;
  source_a_valider: boolean | null;
  validation_pedagogique_status: string | null;
  publie: boolean | null;
  pdf_url: string | null;
  created_at: string;
  updated_at: string | null;
}

export interface Cle {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  description_longue: string | null;
  couleur_hex: string | null;
  ordre: number;
}

export interface Etape {
  id: string;
  code: string;
  nom: string;
  description: string | null;
  description_longue: string | null;
  couleur_hex: string | null;
  ordre: number;
}

export interface Parcours {
  id: string;
  titre: string;
  description: string | null;
  emoji: string | null;
  couleur_hex: string | null;
  ordre: number;
}

// ---------- Data fetchers ----------

export async function getFiches(): Promise<Fiche[]> {
  const { data, error } = await supabase
    .from("fiches")
    .select("*")
    .eq("publie", true)
    .order("nom");
  if (error) {
    console.error("Erreur getFiches:", error.message);
    return [];
  }
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
  if (error) {
    console.error("Erreur getCles:", error.message);
    return [];
  }
  return data || [];
}

export async function getEtapes(): Promise<Etape[]> {
  const { data, error } = await supabase
    .from("etapes_parcours")
    .select("*")
    .order("ordre");
  if (error) {
    console.error("Erreur getEtapes:", error.message);
    return [];
  }
  return data || [];
}

export async function getClesByFiche(ficheId: string): Promise<Cle[]> {
  const { data, error } = await supabase
    .from("fiches_cles")
    .select("cle_id, cles(*)")
    .eq("fiche_id", ficheId);
  if (error) {
    console.error("Erreur getClesByFiche:", error.message);
    return [];
  }
  return (data || []).map((d: any) => d.cles).filter(Boolean);
}

export async function getParcours(): Promise<Parcours[]> {
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .order("ordre");
  if (error) {
    console.error("Erreur getParcours:", error.message);
    return [];
  }
  return data || [];
}

export async function getParcoursBySlug(slug: string): Promise<Parcours | null> {
  // parcours_guides n'a pas de slug, on cherche par titre transformé
  // ou on peut chercher par id. Pour l'instant on cherche par titre encodé.
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .order("ordre");
  if (error) return null;
  const match = (data || []).find(
    (p: any) => slugify(p.titre) === slug
  );
  return match || null;
}

export async function getParcoursById(id: string): Promise<Parcours | null> {
  const { data, error } = await supabase
    .from("parcours_guides")
    .select("*")
    .eq("id", id)
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
  if (error) {
    console.error("Erreur getFichesByParcours:", error.message);
    return [];
  }
  return (data || []).map((d: any) => d.fiches).filter(Boolean);
}

// ---------- Helpers ----------

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function formatDuree(fiche: Fiche): string | null {
  if (fiche.duree_libre) return fiche.duree_libre;
  if (fiche.duree_min && fiche.duree_max) return `${fiche.duree_min}–${fiche.duree_max} min`;
  if (fiche.duree_min) return `${fiche.duree_min} min`;
  return null;
}
