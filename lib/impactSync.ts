// Synchronisation des données d'impact de la BAO vers Airtable (via Make).
//
// La BAO n'appelle jamais Make/Airtable directement depuis le navigateur :
// elle envoie l'événement à sa propre route serveur /api/impact-event, qui le
// relaie vers le webhook Make (URL gardée côté serveur, pas de souci de CORS).
// « Fire & forget » : un échec de synchro ne doit jamais gêner l'utilisateur.

export type ImpactEvent =
  | {
      event: "inscription";
      email: string;
      prenom?: string;
      nom?: string;
      structure?: string | null;
      poste?: string | null;
      region?: string | null;
      code_postal?: string | null;
      categorie_pro?: string;
      jeunes_par_an_min?: number | null;
      jeunes_par_an_max?: number | null;
    }
  | {
      event: "usage_outil";
      email: string;
      fiche_nom: string;
      fiche_slug?: string;
      nb_jeunes?: number | null;
      date_usage?: string | null;
    };

export async function pushImpactEvent(payload: ImpactEvent): Promise<void> {
  try {
    await fetch("/api/impact-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true, // l'envoi survit à une navigation/fermeture d'onglet
    });
  } catch (e) {
    // Synchro best-effort : on n'interrompt jamais le parcours utilisateur.
    console.error("pushImpactEvent:", e);
  }
}
