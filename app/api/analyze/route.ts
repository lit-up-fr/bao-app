// app/api/analyze/route.ts
// Route API : Analyse Claude + enrichissement automatique avec le corpus Google Drive
//
// 2 MODES D'UTILISATION :
// 1. Mode "proxy générique" : pas de diagnosticContext → comportement existant
//    (utilisé par /bao/analyse pour analyser une photo du baromètre et compter les jetons)
// 2. Mode "diagnostic" : diagnosticContext fourni → lit TOUT le corpus Drive,
//    l'injecte dans le system prompt, et log l'analyse en Supabase pour méta-analyses
//    (utilisé par /bao/analyse étape 3 ET /bao/diagnostic-pro)

import Anthropic from "@anthropic-ai/sdk";
import { google } from "googleapis";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60; // Vercel : timeout 60s (la lecture du corpus peut prendre du temps)

/* ═══════════════════════════════════════════
   CONFIG
   ═══════════════════════════════════════════ */

const CORPUS_FOLDER_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CORPUS_FOLDER_ID ||
  "1saIGxui8ba33Ajowu_3bTPgtfmm-ktYu";
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SECRET_KEY = process.env.SUPABASE_SECRET_KEY;

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const supabaseAdmin =
  SUPABASE_URL && SUPABASE_SECRET_KEY
    ? createClient(SUPABASE_URL, SUPABASE_SECRET_KEY)
    : null;

/* ═══════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════ */

interface DiagnosticContext {
  source: "analyse_barometre" | "diagnostic_pro";
  // Pour /bao/analyse (baromètre jetons) : scores 0-100 par clé
  scores?: Record<string, number>;
  // Pour /bao/diagnostic-pro : zones par clé
  zones?: {
    appui?: string[];
    explorer?: string[];
    travailler?: string[];
  };
  // Métadonnées contextuelles (toutes optionnelles)
  type_organisation?: string;
  contexte?: string;
  nom_atelier?: string;
  nb_jeunes?: number;
  precisions?: Record<string, string>;
  commentaire_libre?: string;
}

interface AnalysisRequest {
  messages: Array<{ role: "user" | "assistant"; content: any }>;
  system?: string;
  model?: string;
  max_tokens?: number;
  diagnosticContext?: DiagnosticContext;
}

/* ═══════════════════════════════════════════
   LECTURE DU CORPUS GOOGLE DRIVE
   ═══════════════════════════════════════════ */

/**
 * Lit TOUS les Google Docs présents dans le dossier "Corpus IA Engagement"
 * et tous ses sous-dossiers. Retourne le texte concaténé.
 */
async function getCompleteCorpusFromDrive(): Promise<string> {
  if (!GOOGLE_API_KEY) {
    console.warn("⚠️ GOOGLE_API_KEY manquante - corpus indisponible");
    return "";
  }

  try {
    const drive = google.drive({ version: "v3", auth: GOOGLE_API_KEY });
    const docs = google.docs({ version: "v1", auth: GOOGLE_API_KEY });

    // 1. Lister les sous-dossiers
    const foldersResp = await drive.files.list({
      q: `'${CORPUS_FOLDER_ID}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
      fields: "files(id, name)",
      pageSize: 50,
    });
    const folders = foldersResp.data.files || [];

    // 2. Pour chaque dossier (racine + sous-dossiers), lister les Google Docs
    const folderIds = [CORPUS_FOLDER_ID, ...folders.map((f) => f.id!)];
    const allDocs: Array<{ id: string; name: string; folder: string }> = [];

    for (let i = 0; i < folderIds.length; i++) {
      const folderId = folderIds[i];
      const folderName = i === 0 ? "Racine" : folders[i - 1].name || "?";

      const docsResp = await drive.files.list({
        q: `'${folderId}' in parents and mimeType='application/vnd.google-apps.document' and trashed=false`,
        fields: "files(id, name)",
        pageSize: 100,
      });
      for (const file of docsResp.data.files || []) {
        if (file.id && file.name) {
          allDocs.push({
            id: file.id,
            name: file.name,
            folder: folderName,
          });
        }
      }
    }

    console.log(`📚 Corpus Drive : ${allDocs.length} documents trouvés`);

    // 3. Lire chaque doc
    const corpusParts: string[] = [];
    for (const doc of allDocs) {
      try {
        const content = await docs.documents.get({ documentId: doc.id });
        let text = "";
        const body = content.data.body?.content || [];
        for (const elem of body) {
          if (elem.paragraph?.elements) {
            for (const e of elem.paragraph.elements) {
              if (e.textRun?.content) text += e.textRun.content;
            }
          }
        }
        if (text.trim()) {
          corpusParts.push(
            `\n## [${doc.folder}] ${doc.name}\n\n${text.trim()}\n`
          );
        }
      } catch (e) {
        console.error(`Erreur lecture doc "${doc.name}":`, e);
      }
    }

    return corpusParts.join("\n---\n");
  } catch (error) {
    console.error("❌ Erreur accès Drive corpus:", error);
    return "";
  }
}

/* ═══════════════════════════════════════════
   CORPUS DE SECOURS (si Drive indisponible)
   ═══════════════════════════════════════════ */

function getFallbackCorpus(): string {
  return `
## LES 9 CLÉS DE L'ENGAGEMENT LIT UP (corpus de secours)

Cadre théorique : Théorie de l'autodétermination (Deci & Ryan).

AUTONOMIE :
- 🗺️ SENS : comprendre pourquoi on fait ce qu'on fait
- 🗽 LIBERTÉ : avoir le choix, pouvoir décider
- 🎢 PLAISIR : prendre plaisir à apprendre, à être ensemble

COMPÉTENCE :
- 🥾 ACTION : apprendre en faisant, en expérimentant
- 🏗️ PROGRESSION : voir qu'on avance, qu'on apprend
- 👐 UTILITÉ : se sentir utile, contribuer au collectif

APPARTENANCE :
- 💝 SÉCURITÉ : se sentir en sécurité pour oser
- 🙌 CONSIDÉRATION : être reconnu dans son unicité
- 👯 CONFIANCE : faire partie d'un collectif

POSTURE LIT UP : valoriser d'abord les forces. Poser des questions, ne pas imposer. Adapter au contexte (type d'organisation, public).
`;
}

/* ═══════════════════════════════════════════
   CATALOGUE DES OUTILS BAO (Supabase)
   ═══════════════════════════════════════════ */

/**
 * Détermine si une fiche est compatible avec le type d'accompagnement du pro.
 * Le pro fait de l'individuel → on garde les outils "individuel" et "mixte" (les outils explicitement "collectif" sont exclus).
 * Le pro fait du collectif → on garde "collectif" et "mixte".
 * Le pro fait les deux → on garde tout.
 * Si le format de la fiche est inconnu/null → on garde par défaut (pour ne pas exclure les fiches non taggées).
 */
function isFicheCompatible(ficheFormat: string | null | undefined, typeAccompagnement: string | undefined): boolean {
  if (!typeAccompagnement || typeAccompagnement === "les_deux") return true;
  if (!ficheFormat) return true; // fiche sans format renseigné → on garde

  const f = ficheFormat.toLowerCase().trim();

  // Cas explicites "mixte" : compatible avec tout
  if (f.includes("mixte") || f.includes("les deux") || f.includes("les_deux")) return true;

  if (typeAccompagnement === "individuel") {
    // On exclut les fiches PUREMENT collectives
    if (f === "collectif" || f === "groupe" || f.includes("collectif uniquement")) return false;
    return true; // tout le reste : individuel, mixte, ou non spécifié
  }

  if (typeAccompagnement === "collectif") {
    // On exclut les fiches PUREMENT individuelles
    if (f === "individuel" || f === "individuel uniquement") return false;
    return true;
  }

  return true; // fallback safe
}

/**
 * Lit la liste des fiches/outils de la BAO depuis Supabase.
 * Filtre selon le type d'accompagnement du pro (individuel/collectif/les_deux).
 * Retourne une liste formatée pour Claude.
 */
async function getBAOToolsList(typeAccompagnement?: string): Promise<string> {
  if (!supabaseAdmin) {
    console.warn("⚠️ [BAO] Supabase admin indisponible - clé SUPABASE_SECRET_KEY peut-être manquante");
    return "";
  }
  try {
    // Tente plusieurs noms de table au cas où
    const tableNames = ["fiches", "outils", "tools"];
    let fiches: any[] | null = null;
    let usedTable = "";
    const errors: string[] = [];

    for (const tableName of tableNames) {
      const { data, error } = await supabaseAdmin
        .from(tableName)
        .select("id, nom, intention, pourquoi, materiel, format, duree_min, participants")
        .eq("publie", true)
        .limit(300);
      if (error) {
        errors.push(`[${tableName}] ${error.message}`);
        continue;
      }
      if (data && data.length > 0) {
        fiches = data;
        usedTable = tableName;
        console.log(`✅ [BAO] ${data.length} outils chargés depuis la table "${tableName}"`);
        break;
      } else {
        errors.push(`[${tableName}] table vide ou inexistante`);
      }
    }

    if (!fiches || fiches.length === 0) {
      console.warn("⚠️ [BAO] Aucun outil trouvé. Détails par table :");
      errors.forEach((e) => console.warn("   →", e));
      return "";
    }

    // Charger aussi le mapping fiches ↔ clés pour pouvoir flécher par clé
    const cleByFicheId: Record<string, string[]> = {};
    try {
      // Essayer plusieurs noms de table de jointure
      const joinTables = ["fiches_cles", "fiche_cles", "fichesCles"];
      for (const joinTable of joinTables) {
        const { data: joinData, error: joinErr } = await supabaseAdmin
          .from(joinTable)
          .select("fiche_id, cles ( nom )")
          .limit(2000);
        if (!joinErr && joinData && joinData.length > 0) {
          for (const row of joinData as any[]) {
            const cleNom = row.cles?.nom;
            if (cleNom && row.fiche_id) {
              if (!cleByFicheId[row.fiche_id]) cleByFicheId[row.fiche_id] = [];
              cleByFicheId[row.fiche_id].push(cleNom);
            }
          }
          console.log(`🔗 [BAO] Mapping clés chargé depuis "${joinTable}" (${joinData.length} liens)`);
          break;
        }
      }
    } catch (e) {
      console.warn("⚠️ [BAO] Mapping clés indisponible (non bloquant)");
    }

    // Filtrer selon le type d'accompagnement (individuel/collectif/mixte)
    const beforeFilter = fiches.length;
    const fichesCompatibles = fiches.filter((f) => isFicheCompatible(f.format, typeAccompagnement));
    const afterFilter = fichesCompatibles.length;
    if (typeAccompagnement && beforeFilter !== afterFilter) {
      console.log(`🎯 [BAO] Filtre type_accompagnement="${typeAccompagnement}" : ${afterFilter}/${beforeFilter} outils retenus`);
    }

    // Formater pour Claude (lisible, avec clés associées si dispo)
    const formatted = fichesCompatibles
      .map((f) => {
        const intention = (f.intention || f.pourquoi || "").trim();
        const cles = cleByFicheId[f.id]?.join(", ") || "";
        const meta = [
          f.format ? `Format: ${f.format}` : "",
          f.duree_min ? `~${f.duree_min}min` : "",
          cles ? `Clés: ${cles}` : "",
        ].filter(Boolean).join(" · ");
        // Format compact : un outil par bloc, lisible par l'IA
        return `### ${f.nom}\n${intention ? `_${intention}_\n` : ""}${meta ? `${meta}\n` : ""}`;
      })
      .join("\n");

    console.log(`📋 [BAO] Liste injectée dans le prompt IA (${formatted.length} caractères, ${fichesCompatibles.length} outils)`);
    return formatted;
  } catch (error: any) {
    console.error("❌ [BAO] Erreur lecture outils:", error?.message || error);
    return "";
  }
}

/* ═══════════════════════════════════════════
   ENREGISTREMENT EN SUPABASE (méta-analyses)
   ═══════════════════════════════════════════ */

async function logDiagnosticAnalysis(
  context: DiagnosticContext,
  analysisText: string
) {
  if (!supabaseAdmin) {
    console.warn("⚠️ Supabase admin indisponible - skip log");
    return;
  }
  try {
    const c = context as any; // pour accéder aux champs étendus
    const { error } = await supabaseAdmin
      .from("diagnostic_analyses")
      .insert({
        source: context.source,
        scores: context.scores || null,
        zones: context.zones || null,
        type_organisation: context.type_organisation || null,
        contexte: context.contexte || null,
        nom_atelier: context.nom_atelier || null,
        nb_jeunes: context.nb_jeunes || null,
        precisions: context.precisions || null,
        commentaire_libre: context.commentaire_libre || null,
        analysis_text: analysisText,
        // Méta-données étendues pour le filtrage admin
        user_id: c.user_id || null,
        user_email: c.user_email || null,
        reviewed_status: "pending", // En attente de relecture admin
        // 🆕 Tout le contexte brut (incluant objectif, volontariat, thématiques, tranches d'âge, etc.)
        // Permet à la page admin d'afficher TOUS les éléments du contexte pour valider/corriger.
        full_context: context as any,
      });
    if (error) {
      console.error("Erreur insert diagnostic_analyses:", error);
    } else {
      console.log("✅ Diagnostic enregistré en Supabase");
    }
  } catch (e) {
    console.error("Erreur log Supabase:", e);
  }
}

/* ═══════════════════════════════════════════
   CACHE D'ANALYSES (évite de regénérer la même)
   ═══════════════════════════════════════════ */

/**
 * Calcule un hash stable du contexte du diagnostic.
 * Sert de clé de cache : si 2 diagnostics ont le même contexte (mêmes réponses + même contexte),
 * on renvoie l'analyse cached au lieu d'appeler Claude.
 */
async function hashContext(diagnosticContext: any, userPromptText: string): Promise<string> {
  // On hash uniquement le contenu pertinent : les réponses aux 18 questions + le contexte structurant
  const stable = {
    source: diagnosticContext.source,
    zones: diagnosticContext.zones,
    type_organisation: diagnosticContext.type_organisation,
    contexte: diagnosticContext.contexte,
    nb_jeunes: diagnosticContext.nb_jeunes,
    objectif: diagnosticContext.objectif,
    volontariat: diagnosticContext.volontariat,
    heterogeneite: diagnosticContext.heterogeneite,
    thematique_atelier: diagnosticContext.thematique_atelier,
    thematique_passe: diagnosticContext.thematique_passe,
    thematique_avenir: diagnosticContext.thematique_avenir,
    precisions: diagnosticContext.precisions,
    commentaire_libre: diagnosticContext.commentaire_libre,
    // On hash aussi le prompt complet car certaines variations peuvent y être
    prompt: userPromptText,
  };
  const json = JSON.stringify(stable);
  // Hash SHA-256 via Web Crypto API (disponible en Node 18+)
  const encoder = new TextEncoder();
  const data = encoder.encode(json);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function getCachedAnalysis(contextHash: string): Promise<string | null> {
  if (!supabaseAdmin) return null;
  try {
    const { data, error } = await supabaseAdmin
      .from("analyses_cache")
      .select("analysis_text, hits_count")
      .eq("context_hash", contextHash)
      .maybeSingle();
    if (error || !data) return null;
    // Incrémenter le compteur (fire & forget)
    supabaseAdmin
      .from("analyses_cache")
      .update({ hits_count: (data.hits_count || 0) + 1, last_hit_at: new Date().toISOString() })
      .eq("context_hash", contextHash)
      .then(() => {});
    console.log(`🎯 [CACHE] Hit ! Analyse cached réutilisée (économie ~0,10€)`);
    return data.analysis_text;
  } catch (e) {
    return null;
  }
}

async function setCachedAnalysis(contextHash: string, analysisText: string): Promise<void> {
  if (!supabaseAdmin) return;
  try {
    await supabaseAdmin
      .from("analyses_cache")
      .upsert({
        context_hash: contextHash,
        analysis_text: analysisText,
        hits_count: 0,
        last_hit_at: new Date().toISOString(),
      }, { onConflict: "context_hash" });
  } catch (e) {
    console.warn("⚠️ [CACHE] Erreur upsert:", e);
  }
}

/* ═══════════════════════════════════════════
   QUOTA MENSUEL PAR UTILISATEUR
   ═══════════════════════════════════════════ */

const MONTHLY_QUOTA = 50; // 50 analyses par utilisateur par mois

/**
 * Vérifie que l'utilisateur n'a pas dépassé son quota mensuel.
 * Retourne { allowed: true } si OK, ou { allowed: false, used, limit } si dépassé.
 */
async function checkUserQuota(userId: string | undefined): Promise<{ allowed: boolean; used: number; limit: number }> {
  if (!userId || !supabaseAdmin) return { allowed: true, used: 0, limit: MONTHLY_QUOTA };
  try {
    // Compter les analyses générées par cet utilisateur ce mois-ci
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);

    const { count, error } = await supabaseAdmin
      .from("diagnostic_analyses")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", monthStart.toISOString());

    if (error) {
      console.warn("⚠️ [QUOTA] Erreur comptage:", error.message);
      return { allowed: true, used: 0, limit: MONTHLY_QUOTA }; // En cas d'erreur on autorise (failsafe)
    }
    const used = count || 0;
    return { allowed: used < MONTHLY_QUOTA, used, limit: MONTHLY_QUOTA };
  } catch (e) {
    return { allowed: true, used: 0, limit: MONTHLY_QUOTA };
  }
}

/* ═══════════════════════════════════════════
   ROUTE HANDLER
   ═══════════════════════════════════════════ */

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AnalysisRequest;
    const {
      messages,
      system,
      model = "claude-sonnet-4-5",
      max_tokens = 4000,
      diagnosticContext,
    } = body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "messages requis (array non vide)" },
        { status: 400 }
      );
    }

    // ─── Construire le system prompt ───
    let finalSystem = system || "";
    let contextHash: string | null = null; // Pour pouvoir cacher la réponse après l'appel Claude

    // Si c'est un diagnostic → enrichir avec le corpus Drive + outils BAO
    if (diagnosticContext) {
      const typeAccompagnement = diagnosticContext.contexte; // "individuel" | "collectif" | "les_deux"

      // ─── Vérifier le quota mensuel de l'utilisateur ───
      const userId = (diagnosticContext as any).user_id || undefined;
      const quotaCheck = await checkUserQuota(userId);
      if (!quotaCheck.allowed) {
        return Response.json({
          error: `Quota mensuel atteint (${quotaCheck.used}/${quotaCheck.limit} analyses ce mois-ci). Le quota se réinitialise le 1er du mois prochain.`,
          quota: quotaCheck,
        }, { status: 429 });
      }

      // ─── Vérifier le cache ───
      const userPromptText = messages.map((m) => m.content).join("\n");
      contextHash = await hashContext(diagnosticContext, userPromptText);
      const cached = await getCachedAnalysis(contextHash);
      if (cached) {
        // Hit de cache → renvoyer directement sans appeler Claude
        // Mais on log quand même la requête en Supabase pour suivi
        if (diagnosticContext) {
          logDiagnosticAnalysis(diagnosticContext, cached).catch(() => {});
        }
        return Response.json({
          content: [{ type: "text", text: cached }],
          text: cached,
          cached: true,
          quota: { used: quotaCheck.used + 1, limit: quotaCheck.limit },
        });
      }

      // Charger corpus + outils BAO en parallèle (gain de temps)
      const [corpus, baoTools] = await Promise.all([
        getCompleteCorpusFromDrive(),
        getBAOToolsList(typeAccompagnement),
      ]);
      const corpusText = corpus.trim() || getFallbackCorpus();

      finalSystem = `Tu es un expert en engagement des jeunes (Lit uP). Tu accompagnes les professionnels dans le diagnostic et le développement de l'engagement, en t'appuyant sur la théorie de l'autodétermination (Deci & Ryan) et les 9 clés de l'engagement Lit uP.

═══════════════════════════════════════════
POSTURE GÉNÉRALE
═══════════════════════════════════════════

- Commence TOUJOURS par valoriser les forces (clés en zone d'appui ou avec scores élevés)
- Ton professionnel, chaleureux, concis
- Adapte au contexte (type d'organisation, public, volontariat)
- Reformule dans tes mots, ne copie pas le corpus

═══════════════════════════════════════════
POSTURE NON TOP-DOWN (RÈGLE FONDAMENTALE)
═══════════════════════════════════════════

⚠️ NE JAMAIS être moralisateur ou top-down. Tu accompagnes un professionnel expérimenté, pas un débutant à qui il faut faire la leçon. Tu n'es pas non plus un coach motivationnel qui distribue des compliments.

❌ ÉVITE ABSOLUMENT ces formulations top-down ou évaluatives :
- "Bravo, tu as 5 clés en zone d'appui, c'est solide !" (= jugement positif descendant)
- "Tu pars avec de bonnes bases, mais avant d'aller plus loin, pose-leur la question !"
- "il faut que tu..." / "tu dois..." / "n'oublie pas de..." / "attention à..."
- "C'est bien !" / "Excellent travail !" / "Bravo !"
- Tout ce qui sonne comme un rappel à l'ordre, un compliment paternaliste ou une évaluation du pro

✅ PRIVILÉGIE ces formulations horizontales (entre pairs) :
- "Cinq clés ressortent en zone d'appui. C'est un socle solide qui te permet de..."
- "Une piste qui peut être intéressante à explorer..."
- "Tu pourrais peut-être tester..."
- "Une approche qui fonctionne souvent dans des contextes similaires..."
- "Ce que les jeunes en pensent serait précieux à recueillir..."
- "Selon ton ressenti, est-ce que..."

Tu es un collègue qui propose et qui constate, pas un formateur qui évalue. Le pro reste maître de ses choix.

═══════════════════════════════════════════
REGISTRE LEXICAL (RÈGLE FONDAMENTALE)
═══════════════════════════════════════════

⚠️ Tu t'adresses à des professionnels de l'accompagnement. Le ton doit rester PROFESSIONNEL, sans glissement vers le registre familier ou jeune-de-banlieue.

❌ MOTS ET EXPRESSIONS À BANNIR TOTALEMENT :
- "fun" → utilise "plaisant", "ludique", "engageant", "vivant"
- "kiff", "kiffer" → utilise "apprécier", "prendre plaisir à"
- "léger" / "légères" (au sens "fun") → utilise "détendu", "moins formel", "convivial"
- "cool" → utilise "agréable", "détendu"
- "tes séances ne semblent pas encore fun" → "tes séances semblent encore très orientées sur la tâche, avec peu de moments plus conviviaux"
- "sympa" → utilise "agréable", "chaleureux"
- "trip", "vibe", "ambiance" (au sens jeune) → utilise "climat", "atmosphère", "tonalité"
- "boost", "booster" → utilise "renforcer", "soutenir", "activer"

✅ REGISTRE ATTENDU :
- Vocabulaire de la pédagogie, de l'animation, de l'accompagnement
- Possibilité d'être chaleureux et accessible, MAIS toujours dans un registre professionnel
- Si tu hésites entre un mot familier et un mot professionnel, choisis le mot professionnel

Exemple complet :
❌ "Tes séances ne semblent pas encore fun ou légères. Pour booster le kiff des jeunes..."
✅ "Tes séances semblent encore très orientées sur la tâche, avec peu de moments conviviaux. Pour renforcer le plaisir d'être ensemble..."

═══════════════════════════════════════════
ÉQUILIBRE QUESTIONS / PISTES CONCRÈTES
═══════════════════════════════════════════

⚠️ RÈGLE IMPORTANTE : tu n'es PAS qu'un coach qui pose des questions ouvertes.
Tu dois proposer des PISTES D'ACTION CONCRÈTES, tout en gardant ton ouverture.

❌ ÉVITE : des paragraphes qui ne contiennent QUE des questions ouvertes sans aucune piste d'action.
❌ ÉVITE : des questions du type "Qu'est-ce qui pourrait égayer vos rencontres ?" sans proposer une seule idée concrète.

═══════════════════════════════════════════
STRUCTURE OBLIGATOIRE DE LA RÉPONSE
═══════════════════════════════════════════

Ta réponse doit suivre EXACTEMENT cette structure (4 sections, dans cet ordre) :

### 1️⃣ Forces et points d'appui (1 paragraphe court)
Félicite le pro pour les clés en zone d'appui. Explique POURQUOI c'est précieux dans son contexte. 3-4 phrases maximum.

### 2️⃣ Clés à explorer (SECTION LIGHT - 1 paragraphe court)
Pour les clés en zone "explorer" (réponses floues, "je ne sais pas") :
- 1 paragraphe court (3-4 phrases) qui regroupe TOUTES les clés à explorer.
- Suggère simplement de poser la question aux jeunes via un outil de diagnostic collaboratif (baromètre, débriefing, questionnaire).
- NE PAS détailler clé par clé ici (le pro pourra demander des recos complémentaires via un bouton "Approfondir cette clé").

### 3️⃣ Clés à travailler (SECTION DÉTAILLÉE)
Pour CHAQUE clé en zone "travailler", structure ainsi :

**🔑 [Nom de la clé]**
[1 phrase qui identifie le problème spécifique de cette clé dans le contexte du pro]

Pistes concrètes :
- [Piste d'action concrète 1, testable dès la prochaine séance]
- [Piste d'action concrète 2]

À demander aux jeunes :
[1-2 questions précises à poser aux jeunes pour qu'ils co-construisent les solutions. Ils ont souvent les meilleures idées.]

### 4️⃣ 🎯 Plan d'action

Cette section comporte DEUX sous-parties OBLIGATOIRES :

#### A. Outils de la BAO Lit uP (au moins 2)

Choisis 2 à 4 outils précis dans la LISTE BAO injectée plus bas. Pour CHAQUE outil, utilise EXACTEMENT cette structure visuelle (1 ligne vide entre les outils) :

**[Nom exact de l'outil, tel qu'il apparaît dans la liste]**

🔗 **Pourquoi cet outil pour toi :** [1 phrase qui explique POURQUOI cet outil est adapté à la situation spécifique du pro — clés à travailler + contexte. Sois concret.]

🛠️ **Ce que fait l'outil :** [1 phrase qui résume l'intention de l'outil, en t'appuyant STRICTEMENT sur ce qui est écrit dans la liste BAO. Pas d'invention.]

(Puis ligne vide, puis outil suivant avec le même format.)

#### B. Pistes libres complémentaires (1 à 3)

Suggestions plus génériques qui ne correspondent pas forcément à un outil précis de la BAO. Formate-les comme une liste à puces simple :

- [Piste 1, 1 phrase concrète]
- [Piste 2, 1 phrase concrète]
- [Piste 3, 1 phrase concrète]

⚠️ RÈGLES POUR LA SECTION OUTILS :
- 3 à 5 outils MAXIMUM
- Privilégie les outils qui répondent DIRECTEMENT aux clés à travailler
- Cite UNIQUEMENT des outils qui figurent dans la liste BAO ci-dessous
- Fais le lien EXPLICITE entre l'outil et le contexte (organisation, public, problématique)

═══════════════════════════════════════════
EN CAS D'INCERTITUDE OU DE FLOU
═══════════════════════════════════════════

Si le diagnostic comporte des "je ne sais pas", des zones floues, ou des scores incohérents :
- ENCOURAGE FORTEMENT à faire un vrai diagnostic AVEC les jeunes en utilisant les outils BAO de diagnostic :
  • Le baromètre à jetons (à consulter dans la BAO)
  • Le débriefing collectif des séances
  • Le questionnaire individuel des clés
  • L'entretien individuel sur les clés

Phrase type : "Avant d'aller plus loin, je te recommande de poser ces questions directement aux jeunes via un outil de diagnostic collaboratif. Ça te donnera une lecture plus juste qu'une auto-évaluation."

═══════════════════════════════════════════
RÈGLES STRICTES SUR LES OUTILS BAO À CITER
═══════════════════════════════════════════

⚠️ RÈGLE ABSOLUE — À RESPECTER À LA LETTRE :

1. Tu peux faire DEUX types de recommandations dans la section "Plan d'action" :
   • **Pistes libres** : suggestions génériques d'actions (ex: "organiser un débriefing collectif après chaque séance"). Tu peux en proposer librement.
   • **Outils BAO existants** : tu DOIS aussi flécher AU MOINS 2 outils précis de la liste ci-dessous.

2. Pour CHAQUE outil de la BAO que tu cites :
   • Utilise EXACTEMENT le nom écrit dans la liste ci-dessous (pas de reformulation).
   • Le descriptif que tu donnes DOIT s'appuyer sur l'_intention_ de la fiche (en italique dans la liste). NE JAMAIS inventer du contenu pour un outil dont tu n'as pas la description : si l'intention n'est pas claire pour toi, ne le cite pas.
   • Justifie en 1 phrase POURQUOI cet outil est adapté à la situation spécifique (clés à travailler + contexte du pro).

3. ❌ INTERDIT :
   • Inventer un outil qui ne figure pas dans la liste
   • Inventer du contenu pour un outil dont tu vois seulement le titre
   • Reformuler le nom d'un outil ("Le baromètre" au lieu de "Le baromètre à jetons")

═══════════════════════════════════════════
ADAPTATION AU CONTEXTE (RÈGLE FONDAMENTALE)
═══════════════════════════════════════════

⚠️ Chaque réponse doit être VISIBLEMENT adaptée au contexte fourni. Pas de réponse générique applicable à tous les cas.

Critères clés à exploiter EXPLICITEMENT dans tes pistes et exemples :

**Type d'accompagnement (individuel / collectif / les deux)** :
- Si individuel → propose des pistes 1-to-1 (entretien, suivi personnalisé, écoute active)
- Si collectif → propose des pistes de groupe (atelier collectif, débriefing groupe, mise en collaboration entre pairs)
- Si les deux → distingue clairement ce qui se joue en collectif vs en individuel

**Taille du groupe (nb_jeunes)** :
- 1 à 3 jeunes → format très intime, parole de chacun audible, peut être très personnalisé
- 4 à 10 jeunes → format atelier "classique", tour de table possible
- 11 à 20 jeunes → besoin de sous-groupes, format participatif structuré
- 20+ jeunes → grand groupe, formats type forum ouvert, world café, sous-groupes obligatoires

**Objectif** :
- Si "evaluer" (= améliorer un atelier déjà réalisé) → tes pistes parlent de ce qui aurait pu être différent, de ce qui peut être ajusté pour la prochaine occurrence du même atelier
- Si "diagnostiquer" (= développer la motivation pour un atelier à venir) → tes pistes anticipent le prochain atelier et préparent les conditions d'engagement

**Type d'organisation** :
- Mission Locale, E2C, EPIDE → public en démarche d'insertion, souvent contraint, motivation hétérogène : adapte le ton à la réalité du décrochage scolaire/professionnel
- Collège/lycée → public obligé d'être présent (réglementaire), enjeux scolaires : tiens compte du rapport à l'institution scolaire
- Association → public souvent plus volontaire, mais attention à la fragilité du lien
- Structure d'insertion par l'activité → public en transition

**Volontariat (oui / non / partiel)** :
- Si "non" (participation contrainte) → la clé Liberté sera structurellement basse, ce n'est PAS un échec du pro. Concentre les pistes sur "comment redonner du choix dans un cadre obligatoire" (micro-choix, options, droit de retrait partiel).
- Si "oui" → tu peux suggérer plus de co-construction directement.

**Hétérogénéité de motivation** :
- Si forte → propose des dispositifs qui fonctionnent même quand les niveaux d'engagement diffèrent (pair-aidance, sous-groupes par envie, formats à entrées multiples).

**Thématique de l'atelier** (si fournie par le pro) :
- Utilise-la pour rendre tes EXEMPLES concrets et collés à cette thématique précise.
- Ex: si thématique = "estime de soi", tes exemples parlent d'estime de soi. Si "orientation pro", tes exemples parlent d'orientation.

═══════════════════════════════════════════
LISTE EXHAUSTIVE DES OUTILS BAO DISPONIBLES
═══════════════════════════════════════════

(Chaque outil est précédé de ### suivi de son nom exact, puis de son intention en italique. Cite UNIQUEMENT les noms qui figurent dans cette liste.)

${baoTools || "(⚠️ Liste BAO non disponible techniquement. Tu peux quand même proposer dans la section 'Plan d'action' des TYPES d'outils génériques utiles : entretien individuel, débriefing collectif, atelier d'expression, jeu de positionnement, etc. Sans inventer de noms commerciaux.)"}

═══════════════════════════════════════════
CORPUS DE CONNAISSANCES LIT UP
═══════════════════════════════════════════

${corpusText}

═══════════════════════════════════════════
${system ? `\nINSTRUCTIONS SPÉCIFIQUES :\n${system}` : ""}`;
    }

    // ─── Appel Claude ───
    const response = await anthropic.messages.create({
      model,
      max_tokens,
      system: finalSystem || undefined,
      messages: messages as any,
    });

    // ─── Extraire le texte ───
    const textBlocks = response.content
      .filter((b: any) => b.type === "text")
      .map((b: any) => b.text);
    const analysisText = textBlocks.join("\n");

    // ─── Log en Supabase si diagnostic (fire & forget) ───
    if (diagnosticContext && analysisText) {
      logDiagnosticAnalysis(diagnosticContext, analysisText).catch((e) =>
        console.error("Log async error:", e)
      );
    }

    // ─── Mettre en cache pour les prochaines requêtes identiques (fire & forget) ───
    if (contextHash && analysisText) {
      setCachedAnalysis(contextHash, analysisText).catch(() => {});
    }

    // ─── Réponse au format Anthropic (compatible avec l'existant) ───
    return Response.json({
      content: response.content,
      text: analysisText,
      model: response.model,
      stop_reason: response.stop_reason,
      cached: false,
    });
  } catch (error: any) {
    console.error("❌ Erreur /api/analyze:", error);
    return Response.json(
      {
        error: error.message || "Erreur serveur",
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
