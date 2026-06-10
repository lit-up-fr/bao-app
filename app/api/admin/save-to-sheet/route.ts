// app/api/admin/save-to-sheet/route.ts
// Route API qui envoie les paragraphes traités (validés/annotés/problématiques)
// vers le webhook Google Apps Script. Le webhook insère chaque paragraphe
// comme une ligne dans le Google Sheet "Analyses validées".

import { NextRequest } from "next/server";
import { getServerAuthContext } from "@/lib/auth-server";

const APPS_SCRIPT_URL = process.env.GOOGLE_APPS_SCRIPT_URL;
const APPS_SCRIPT_TOKEN = process.env.GOOGLE_APPS_SCRIPT_TOKEN;

interface SaveToSheetPayload {
  analyseId: string;
  analyseMeta: {
    created_at: string;
    nom_atelier: string | null;
    type_organisation: string | null;
    contexte: string | null;
    nb_jeunes: number | null;
    user_email: string | null;
    zones: any;
    full_context: any;
  };
  paragraphs: Array<{
    section: string;
    content: string;
    status: "validated" | "annotated" | "problematic";
    note: string;            // Note de l'admin pour améliorer l'IA
    reformulation: string;   // Reformulation suggérée (optionnel)
  }>;
  reviewerEmail: string;
  finalStatus: "validated" | "rejected";
}

export async function POST(req: NextRequest) {
  try {
    // ─── Réservé aux administrateurs authentifiés ───
    const auth = await getServerAuthContext(req);
    if (!auth.user) {
      return Response.json({ error: "Authentification requise" }, { status: 401 });
    }
    if (!auth.isAdmin) {
      return Response.json({ error: "Action réservée aux administrateurs" }, { status: 403 });
    }

    if (!APPS_SCRIPT_URL || !APPS_SCRIPT_TOKEN) {
      return Response.json(
        { error: "Apps Script non configuré. Vérifie GOOGLE_APPS_SCRIPT_URL et GOOGLE_APPS_SCRIPT_TOKEN dans .env.local" },
        { status: 500 }
      );
    }

    const body = (await req.json()) as SaveToSheetPayload;
    const { analyseId, analyseMeta, paragraphs, finalStatus } = body;
    // Le relecteur est l'admin authentifié, jamais une valeur fournie par le client.
    const reviewerEmail = auth.user.email || body.reviewerEmail || "";

    if (finalStatus === "rejected") {
      return Response.json({ ok: true, inserted: 0, skipped: "rejected (no sheet write)" });
    }

    if (!paragraphs || paragraphs.length === 0) {
      return Response.json({ error: "Aucun paragraphe à envoyer" }, { status: 400 });
    }

    // Colonnes à respecter dans le Sheet "Analyses validées" :
    // A: Date validation
    // B: Diagnostic ID
    // C: Nom atelier
    // D: Type organisation
    // E: Type accompagnement
    // F: Nb jeunes
    // G: Email utilisateur
    // H: Section paragraphe
    // I: Contenu original IA
    // J: Statut paragraphe (validated/annotated/problematic)
    // K: Validé par
    // L: Clés à travailler
    // M: 🆕 Note pour l'IA (consigne admin)
    // N: 🆕 Reformulation suggérée (optionnel)

    const dateValidation = new Date().toISOString();
    const cleATravailler = (analyseMeta.zones?.travailler || []).join(", ");

    const rows = paragraphs.map((p) => [
      dateValidation,                                                            // A
      analyseId,                                                                  // B
      analyseMeta.nom_atelier || "",                                              // C
      analyseMeta.type_organisation || "",                                        // D
      analyseMeta.contexte || "",                                                 // E
      analyseMeta.nb_jeunes ?? "",                                                // F
      analyseMeta.user_email || "",                                               // G
      p.section,                                                                  // H
      p.content,                                                                  // I
      p.status,                                                                   // J : validated / annotated / problematic
      reviewerEmail,                                                              // K
      cleATravailler,                                                             // L
      p.note || "",                                                               // M : Note admin pour l'IA
      p.reformulation || "",                                                      // N : Reformulation suggérée
    ]);

    const webhookRes = await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        token: APPS_SCRIPT_TOKEN,
        rows,
      }),
      redirect: "follow", // Apps Script redirige vers googleusercontent.com
    });

    const responseText = await webhookRes.text();
    let responseJson: any = null;
    try {
      responseJson = JSON.parse(responseText);
    } catch {
      return Response.json(
        { error: "Réponse Apps Script invalide", raw: responseText.slice(0, 500) },
        { status: 502 }
      );
    }

    if (responseJson.error) {
      return Response.json(
        { error: `Apps Script: ${responseJson.error}` },
        { status: 502 }
      );
    }

    return Response.json({
      ok: true,
      inserted: responseJson.inserted || paragraphs.length,
      sheetResponse: responseJson,
    });
  } catch (error: any) {
    console.error("❌ Erreur /api/admin/save-to-sheet:", error);
    return Response.json(
      { error: error.message || "Erreur serveur" },
      { status: 500 }
    );
  }
}
