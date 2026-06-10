"use client";

// app/admin/analyses-ia/[id]/page.tsx
// Relecture d'une analyse IA paragraphe par paragraphe (v6).
// - Option A : découpage fin (chaque piste concrète = 1 paragraphe)
// - Option C : boutons icônes compacts (✓ et 📝) en coin haut-droit
// - 2 actions seulement : Valider OU Annoter pour l'IA
// - Persistance des statuts (colonne paragraph_reviews JSONB)
// - Retraitement possible via bouton "Recommencer la relecture"

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase, authHeaders } from "@/lib/supabase";
import {
  Calendar,
  User,
  CheckCircle,
  XCircle,
  RefreshCw,
  ClipboardList,
  Save,
  Send,
  Pencil,
  Lightbulb,
  AlertTriangle,
  Check,
  Undo2,
  Key,
} from "lucide-react";

interface DiagnosticAnalysis {
  id: string;
  created_at: string;
  source: string;
  nom_atelier: string | null;
  type_organisation: string | null;
  contexte: string | null;
  nb_jeunes: number | null;
  user_email: string | null;
  reviewed_status: string | null;
  reviewed_at: string | null;
  reviewed_by: string | null;
  zones: { appui?: string[]; explorer?: string[]; travailler?: string[] } | null;
  analysis_text: string | null;
  precisions: any;
  commentaire_libre: string | null;
  full_context: any;
  paragraph_reviews: any;
}

type ParagraphStatus = "pending" | "validated" | "annotated";

interface Paragraph {
  id: string;
  section: string;
  original: string;
  status: ParagraphStatus;
  note?: string;
  reformulation?: string;
}

const CLE_NAMES: Record<string, string> = {
  sens: "Sens",
  liberte: "Liberté",
  action: "Action",
  defi: "Défi",
  progression: "Progression",
  consideration: "Considération",
  utilite: "Utilité",
  appartenance: "Appartenance",
  plaisir: "Plaisir",
};

/* ═══════════════════════════════════════════
   DÉCOUPAGE FIN (parser amélioré)
   ═══════════════════════════════════════════ */

function isPistesHeader(line: string): boolean {
  return /^\s*\*?\*?\s*Pistes concrètes\s*:\s*\*?\*?\s*$/i.test(line);
}

function isDemanderHeader(line: string): boolean {
  return /^\s*\*?\*?\s*À demander aux jeunes\s*:\s*\*?\*?\s*$/i.test(line);
}

function splitCleATravailler(block: string, cleIdx: number): Paragraph[] {
  const paragraphs: Paragraph[] = [];
  const lines = block.split("\n");
  const firstLine = lines[0]?.trim() || "";
  const cleName = firstLine.replace(/\*\*/g, "").trim();
  const cleLabel = cleName || ("Cle " + (cleIdx + 1));

  let pistesLineIdx = -1;
  let demanderLineIdx = -1;
  for (let i = 0; i < lines.length; i++) {
    if (pistesLineIdx === -1 && isPistesHeader(lines[i])) pistesLineIdx = i;
    if (demanderLineIdx === -1 && isDemanderHeader(lines[i])) demanderLineIdx = i;
  }

  // 1. Diagnostic
  let diagnosticEndLine = lines.length;
  if (pistesLineIdx >= 0) diagnosticEndLine = pistesLineIdx;
  else if (demanderLineIdx >= 0) diagnosticEndLine = demanderLineIdx;
  const diagnosticLines = lines.slice(1, diagnosticEndLine);
  const diagnosticText = diagnosticLines.join("\n").trim();
  if (diagnosticText) {
    paragraphs.push({
      id: "cle" + cleIdx + "-diagnostic",
      section: cleLabel,
      original: diagnosticText,
      status: "pending",
    });
  }

  // 2. Pistes concrètes (1 puce = 1 bloc)
  if (pistesLineIdx >= 0) {
    const pistesEndLine = demanderLineIdx > pistesLineIdx ? demanderLineIdx : lines.length;
    const pistesBody = lines.slice(pistesLineIdx + 1, pistesEndLine).join("\n");
    const puces = pistesBody.split(/(?=^[-•*]\s)/m).filter((p) => /^[-•*]\s/.test(p.trim()));
    puces.forEach((puce, puceIdx) => {
      paragraphs.push({
        id: "cle" + cleIdx + "-piste" + puceIdx,
        section: cleLabel + " — Piste " + (puceIdx + 1),
        original: puce.trim(),
        status: "pending",
      });
    });
  }

  // 3. À demander aux jeunes
  if (demanderLineIdx >= 0) {
    const demanderBody = lines.slice(demanderLineIdx + 1).join("\n").trim();
    if (demanderBody) {
      paragraphs.push({
        id: "cle" + cleIdx + "-demander",
        section: cleLabel + " — Question à poser aux jeunes",
        original: demanderBody,
        status: "pending",
      });
    }
  }

  if (paragraphs.length === 0) {
    paragraphs.push({
      id: "cle" + cleIdx + "-tout",
      section: cleLabel,
      original: block.trim(),
      status: "pending",
    });
  }

  return paragraphs;
}

function splitAnalysisIntoParagraphs(text: string): Paragraph[] {
  if (!text) return [];

  const sections = text.split(/(?=^###\s)/m).filter((s) => s.trim().length > 0);
  const paragraphs: Paragraph[] = [];

  sections.forEach((section, sectionIdx) => {
    const firstNewline = section.indexOf("\n");
    let title = "";
    let body = section;
    if (firstNewline > 0) {
      title = section.substring(0, firstNewline).replace(/^#+\s*/, "").trim();
      body = section.substring(firstNewline + 1).trim();
    } else {
      title = section.replace(/^#+\s*/, "").trim();
      body = "";
    }

    const titleLower = title.toLowerCase();
    const isClesATravailler = /travailler/.test(titleLower) && !titleLower.includes("explorer");
    const isPlanAction = /plan d.action|outils de la bao/.test(titleLower);

    if (isClesATravailler) {
      const cleBlocks = body.split(/(?=^\*\*[^\n*]+\*\*\s*$)/m).filter((b) => b.trim().length > 0);
      if (cleBlocks.length > 1) {
        cleBlocks.forEach((block, i) => {
          paragraphs.push(...splitCleATravailler(block, i));
        });
      } else {
        paragraphs.push(...splitCleATravailler(body, 0));
      }
    } else if (isPlanAction) {
      const subSections = body.split(/(?=^####\s)/m).filter((s) => s.trim().length > 0);
      const firstSubIdx = body.search(/^####\s/m);
      if (firstSubIdx > 0) {
        const intro = body.substring(0, firstSubIdx).trim();
        if (intro) {
          paragraphs.push({
            id: "s" + sectionIdx + "-intro",
            section: "Plan d'action — intro",
            original: intro,
            status: "pending",
          });
        }
      }

      subSections.forEach((sub, subIdx) => {
        const subFirstLine = sub.split("\n")[0].trim();
        const subTitle = subFirstLine.replace(/^####\s*/, "").trim();
        const subBody = sub.substring(subFirstLine.length).trim();
        const isPistesLibres = /pistes? libres?|complémentaires?|^B\./i.test(subTitle);

        if (isPistesLibres) {
          const puces = subBody.split(/(?=^[-•*]\s)/m).filter((p) => /^[-•*]\s/.test(p.trim()));
          puces.forEach((puce, puceIdx) => {
            paragraphs.push({
              id: "s" + sectionIdx + "-sub" + subIdx + "-puce" + puceIdx,
              section: "Piste libre " + (puceIdx + 1),
              original: puce.trim(),
              status: "pending",
            });
          });
          if (puces.length === 0) {
            paragraphs.push({
              id: "s" + sectionIdx + "-sub" + subIdx,
              section: subTitle,
              original: subBody,
              status: "pending",
            });
          }
        } else {
          paragraphs.push({
            id: "s" + sectionIdx + "-sub" + subIdx,
            section: subTitle.replace(/^A\.\s*/, ""),
            original: subBody || sub.trim(),
            status: "pending",
          });
        }
      });
    } else {
      const cleanTitle = title.replace(/^[0-9]+️⃣\s*/, "").replace(/^[0-9]+\.\s*/, "");
      paragraphs.push({
        id: "s" + sectionIdx,
        section: cleanTitle || title || ("Section " + (sectionIdx + 1)),
        original: body,
        status: "pending",
      });
    }
  });

  return paragraphs;
}

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

export default function AnalysesIADetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [analyse, setAnalyse] = useState<DiagnosticAnalysis | null>(null);
  const [paragraphs, setParagraphs] = useState<Paragraph[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendResult, setSendResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showContext, setShowContext] = useState(true);
  const [savedFlash, setSavedFlash] = useState<Record<string, boolean>>({});

  useEffect(() => {
    async function load() {
      if (!id) return;
      setLoading(true);
      try {
        const { data, error: err } = await supabase
          .from("diagnostic_analyses")
          .select("*")
          .eq("id", id)
          .single();
        if (err) {
          setError(err.message);
        } else if (data) {
          setAnalyse(data as DiagnosticAnalysis);
          const rawParagraphs = splitAnalysisIntoParagraphs(data.analysis_text || "");
          const reviews = (data.paragraph_reviews || {}) as Record<string, any>;
          const restored = rawParagraphs.map((p) => {
            const review = reviews[p.id];
            if (review) {
              const rawStatus = review.status as string;
              const status: ParagraphStatus =
                rawStatus === "validated" ? "validated"
                : rawStatus === "annotated" || rawStatus === "problematic" ? "annotated"
                : "pending";
              return {
                ...p,
                status,
                note: review.note || "",
                reformulation: review.reformulation || "",
              };
            }
            return p;
          });
          setParagraphs(restored);

          if (data.reviewed_status === "pending") {
            await supabase
              .from("diagnostic_analyses")
              .update({ reviewed_status: "in_progress" })
              .eq("id", id);
          }
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  function updateLocalOnly(pId: string, patch: Partial<Paragraph>) {
    setParagraphs((prev) => prev.map((p) => (p.id === pId ? { ...p, ...patch } : p)));
  }

  async function persistReview(pId: string, newP: Paragraph) {
    if (!analyse) return;
    const currentReviews = (analyse.paragraph_reviews || {}) as Record<string, any>;
    const newReviews = { ...currentReviews };
    if (newP.status === "pending") {
      delete newReviews[pId];
    } else {
      newReviews[pId] = {
        status: newP.status,
        note: newP.note || "",
        reformulation: newP.reformulation || "",
      };
    }
    const { error: err } = await supabase
      .from("diagnostic_analyses")
      .update({ paragraph_reviews: newReviews })
      .eq("id", analyse.id);
    if (!err) {
      setAnalyse({ ...analyse, paragraph_reviews: newReviews });
      setSavedFlash((prev) => ({ ...prev, [pId]: true }));
      setTimeout(() => {
        setSavedFlash((prev) => {
          const copy = { ...prev };
          delete copy[pId];
          return copy;
        });
      }, 2000);
    } else {
      console.error("Erreur sauvegarde paragraph_reviews:", err);
    }
  }

  async function setStatus(pId: string, status: ParagraphStatus) {
    setParagraphs((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== pId) return p;
        const reset = status === "pending" || status === "validated";
        return {
          ...p,
          status,
          note: reset ? "" : (p.note || ""),
          reformulation: reset ? "" : (p.reformulation || ""),
        };
      });
      const newP = updated.find((x) => x.id === pId);
      if (newP) persistReview(pId, newP);
      return updated;
    });
  }

  async function saveAnnotation(pId: string) {
    const p = paragraphs.find((x) => x.id === pId);
    if (!p) return;
    await persistReview(pId, p);
  }

  async function recommencerRelecture() {
    if (!analyse) return;
    if (!confirm("Recommencer la relecture ? Tous les statuts seront réinitialisés. Les anciennes lignes du Sheet restent comme historique.")) return;
    setParagraphs((prev) => prev.map((p) => ({ ...p, status: "pending", note: "", reformulation: "" })));
    await supabase
      .from("diagnostic_analyses")
      .update({
        paragraph_reviews: {},
        reviewed_status: "in_progress",
        reviewed_at: null,
        reviewed_by: null,
      })
      .eq("id", analyse.id);
    setAnalyse({ ...analyse, paragraph_reviews: {}, reviewed_status: "in_progress" });
    setSendResult(null);
    setError(null);
  }

  async function sendToSheet(finalStatus: "validated" | "rejected") {
    if (!analyse) return;
    setSending(true);
    setSendResult(null);
    setError(null);

    const paragraphsToSend = paragraphs.filter((p) =>
      p.status === "validated" || p.status === "annotated"
    );

    if (finalStatus === "validated" && paragraphsToSend.length === 0) {
      setError("Aucun paragraphe traité. Traite au moins un paragraphe avant d'envoyer.");
      setSending(false);
      return;
    }

    try {
      const { data: userData } = await supabase.auth.getUser();
      const reviewerEmail = userData?.user?.email || "unknown";

      const payload = {
        analyseId: analyse.id,
        analyseMeta: {
          created_at: analyse.created_at,
          nom_atelier: analyse.nom_atelier,
          type_organisation: analyse.type_organisation,
          contexte: analyse.contexte,
          nb_jeunes: analyse.nb_jeunes,
          user_email: analyse.user_email,
          zones: analyse.zones,
          full_context: analyse.full_context,
        },
        paragraphs: paragraphsToSend.map((p) => ({
          section: p.section,
          content: p.original,
          status: p.status,
          note: p.note || "",
          reformulation: p.reformulation || "",
        })),
        reviewerEmail,
        finalStatus,
      };

      const res = await fetch("/api/admin/save-to-sheet", {
        method: "POST",
        headers: await authHeaders(),
        body: JSON.stringify(payload),
      });

      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(json.error || ("Erreur HTTP " + res.status));
        setSending(false);
        return;
      }

      await supabase
        .from("diagnostic_analyses")
        .update({
          reviewed_status: finalStatus,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewerEmail,
        })
        .eq("id", analyse.id);

      setSendResult(
        finalStatus === "validated"
          ? paragraphsToSend.length + " paragraphe(s) envoyé(s) au Google Sheet."
          : "Analyse marquée comme rejetée."
      );
      setAnalyse({ ...analyse, reviewed_status: finalStatus, reviewed_at: new Date().toISOString() });
      setTimeout(() => router.push("/admin/analyses-ia"), 2000);
    } catch (e: any) {
      setError(e?.message || "Erreur réseau");
    } finally {
      setSending(false);
    }
  }

  if (loading) {
    return <div style={{ color: "var(--muted)", fontSize: "14px" }}>Chargement…</div>;
  }

  if (!analyse) {
    return (
      <div>
        <Link href="/admin/analyses-ia" style={{ fontSize: "13px", color: "var(--canard)" }}>← Retour à la liste</Link>
        <p style={{ marginTop: "20px", color: "var(--muted)" }}>Analyse introuvable.</p>
      </div>
    );
  }

  const totalValidated = paragraphs.filter((p) => p.status === "validated").length;
  const totalAnnotated = paragraphs.filter((p) => p.status === "annotated").length;
  const totalPending = paragraphs.filter((p) => p.status === "pending").length;

  const fc = analyse.full_context || {};
  const precisionsObj: Record<string, any> = (fc && fc.precisions) || analyse.precisions || {};
  const precisionsNonVides = Object.entries(precisionsObj).filter(([, txt]) => txt && String(txt).trim().length > 0);
  const isAnalyseClosed = analyse.reviewed_status === "validated" || analyse.reviewed_status === "rejected";

  return (
    <div>
      <div style={{ marginBottom: "20px" }}>
        <Link href="/admin/analyses-ia" style={{ fontSize: "13px", color: "var(--canard)", textDecoration: "none", fontWeight: 600 }}>← Retour à la liste</Link>
      </div>

      <div style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--anthracite)" }}>
            {analyse.nom_atelier || "Analyse sans nom"}
          </h1>
          <div style={{ fontSize: "13px", color: "var(--muted)", display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "6px", alignItems: "center" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={13} strokeWidth={2} /> {new Date(analyse.created_at).toLocaleString("fr-FR")}
            </span>
            {analyse.user_email && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <User size={13} strokeWidth={2} /> {analyse.user_email}
              </span>
            )}
            {isAnalyseClosed && (
              <span style={{ color: analyse.reviewed_status === "validated" ? "#16a34a" : "#9ca3af", fontWeight: 700, display: "inline-flex", alignItems: "center", gap: "4px" }}>
                {analyse.reviewed_status === "validated"
                  ? <><CheckCircle size={14} strokeWidth={2.5} /> Validée et envoyée</>
                  : <><XCircle size={14} strokeWidth={2.5} /> Rejetée</>}
              </span>
            )}
          </div>
        </div>

        {isAnalyseClosed && (
          <button
            onClick={recommencerRelecture}
            style={{
              padding: "10px 18px",
              background: "white",
              color: "#0891b2",
              border: "2px solid #0891b2",
              borderRadius: "10px",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <RefreshCw size={14} strokeWidth={2.5} /> Recommencer la relecture
          </button>
        )}
      </div>

      {/* CONTEXTE COMPLET */}
      <div style={{ background: "#f9fafb", border: "1px solid var(--line)", borderRadius: "12px", marginBottom: "20px", overflow: "hidden" }}>
        <button
          onClick={() => setShowContext((s) => !s)}
          style={{
            width: "100%", padding: "12px 18px", background: "white",
            border: "none", textAlign: "left", cursor: "pointer",
            fontSize: "14px", fontWeight: 700, color: "var(--anthracite)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            fontFamily: "inherit",
            borderBottom: showContext ? "1px solid var(--line)" : "none",
          }}
        >
          <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
            <ClipboardList size={16} strokeWidth={2} color="var(--canard)" />
            Contexte complet du diagnostic
          </span>
          <span style={{ fontSize: "12px", color: "var(--muted)" }}>{showContext ? "▼ Masquer" : "▶ Afficher"}</span>
        </button>
        {showContext && (
          <div style={{ padding: "16px 18px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "12px", fontSize: "13px" }}>
              <ContextRow label="Objectif" value={fc.objectif === "evaluer" ? "Évaluer et améliorer un atelier" : fc.objectif === "diagnostiquer" ? "Diagnostiquer et développer la motivation" : fc.objectif} />
              <ContextRow label="Type d'accompagnement" value={fc.contexte === "individuel" ? "Individuel" : fc.contexte === "collectif" ? "Collectif" : fc.contexte === "les_deux" ? "Les deux (mixte)" : fc.contexte || analyse.contexte} />
              <ContextRow label="Type d'organisation" value={fc.type_organisation_raw || analyse.type_organisation} />
              {fc.autre_organisation && <ContextRow label="Précision organisation" value={fc.autre_organisation} />}
              <ContextRow label="Nombre de jeunes" value={analyse.nb_jeunes ? (analyse.nb_jeunes + " jeunes") : null} />
              <ContextRow label="Tranches d'âge" value={Array.isArray(fc.tranches_age) ? fc.tranches_age.join(", ") : fc.tranches_age} />
              <ContextRow label="Connaissance des jeunes" value={fc.connaissance_jeunes} />
              <ContextRow label="Fréquence" value={fc.frequence} />
              <ContextRow label="Objectif de l'accompagnement" value={fc.objectif_accompagnement} />
              <ContextRow label="Volontariat" value={
                fc.volontariat === "oui_volontaires" ? "Volontaires"
                : fc.volontariat === "non_obliges" ? "Participation obligée"
                : fc.volontariat === "mixte" ? "Mixte"
                : fc.volontariat
              } />
              <ContextRow label="Hétérogénéité motivation" value={fc.heterogeneite} />
              {fc.thematique_atelier && <ContextRow label="Thématique de l'atelier" value={fc.thematique_atelier} />}
              {fc.thematique_passe && <ContextRow label="Thématique atelier passé" value={fc.thematique_passe} />}
              {fc.thematique_avenir && <ContextRow label="Thématique atelier à venir" value={fc.thematique_avenir} />}
            </div>

            {analyse.zones && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Résultats par zone</div>
                {analyse.zones.appui && analyse.zones.appui.length > 0 && (
                  <div style={{ fontSize: "13px", color: "#16a34a", marginBottom: "4px" }}>
                    🟢 <strong>Points d&apos;appui :</strong> {analyse.zones.appui.join(", ")}
                  </div>
                )}
                {analyse.zones.explorer && analyse.zones.explorer.length > 0 && (
                  <div style={{ fontSize: "13px", color: "#ca8a04", marginBottom: "4px" }}>
                    🟡 <strong>À explorer :</strong> {analyse.zones.explorer.join(", ")}
                  </div>
                )}
                {analyse.zones.travailler && analyse.zones.travailler.length > 0 && (
                  <div style={{ fontSize: "13px", color: "#dc2626" }}>
                    🔴 <strong>À travailler :</strong> {analyse.zones.travailler.join(", ")}
                  </div>
                )}
              </div>
            )}

            {precisionsNonVides.length > 0 && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>
                  Précisions saisies par le pro sur les 9 clés
                </div>
                {precisionsNonVides.map(([cleId, txt]) => (
                  <div key={cleId} style={{ fontSize: "13px", marginBottom: "8px", padding: "8px 12px", background: "white", borderRadius: "6px", borderLeft: "3px solid var(--canard)" }}>
                    <strong style={{ color: "var(--canard)", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                      <Key size={13} strokeWidth={2.5} /> {CLE_NAMES[cleId] || cleId} :
                    </strong>
                    <div style={{ marginTop: "3px", color: "var(--anthracite)" }}>&quot;{String(txt)}&quot;</div>
                  </div>
                ))}
              </div>
            )}

            {analyse.commentaire_libre && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px solid var(--line)" }}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "8px" }}>Commentaire libre du pro</div>
                <div style={{ fontSize: "13px", color: "var(--anthracite)", fontStyle: "italic", padding: "8px 12px", background: "white", borderRadius: "6px", borderLeft: "3px solid var(--canard)" }}>
                  &quot;{analyse.commentaire_libre}&quot;
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div style={{ background: "white", border: "1px solid var(--line)", borderRadius: "12px", padding: "14px 18px", marginBottom: "20px", display: "flex", gap: "20px", flexWrap: "wrap", fontSize: "13px" }}>
        <div><strong style={{ color: "#16a34a" }}>{totalValidated}</strong> validé(s)</div>
        <div><strong style={{ color: "#0891b2" }}>{totalAnnotated}</strong> annoté(s)</div>
        <div><strong style={{ color: "#ea580c" }}>{totalPending}</strong> à traiter</div>
        <div style={{ marginLeft: "auto", color: "var(--muted)" }}>Total : {paragraphs.length} paragraphe{paragraphs.length > 1 ? "s" : ""}</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        {paragraphs.map((p) => (
          <ParagraphCard
            key={p.id}
            paragraph={p}
            isFlashSaved={!!savedFlash[p.id]}
            onValidate={() => setStatus(p.id, "validated")}
            onAnnotate={() => setStatus(p.id, "annotated")}
            onSaveAnnotation={() => saveAnnotation(p.id)}
            onReset={() => setStatus(p.id, "pending")}
            onUpdateNote={(note) => updateLocalOnly(p.id, { note })}
            onUpdateReformulation={(reformulation) => updateLocalOnly(p.id, { reformulation })}
          />
        ))}
      </div>

      <div style={{ position: "sticky", bottom: 0, background: "white", borderTop: "2px solid var(--line)", marginTop: "32px", padding: "16px 0", display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
        <button
          onClick={() => sendToSheet("validated")}
          disabled={sending || (totalValidated + totalAnnotated) === 0}
          style={{
            padding: "12px 22px",
            background: (totalValidated + totalAnnotated) === 0 ? "var(--muted)" : "#16a34a",
            color: "white",
            border: "none",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: sending || (totalValidated + totalAnnotated) === 0 ? "not-allowed" : "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          {sending ? "Envoi…" : (
            <>
              <Send size={15} strokeWidth={2.5} />
              Envoyer {totalValidated + totalAnnotated} paragraphe(s) au Sheet
            </>
          )}
        </button>

        <button
          onClick={() => sendToSheet("rejected")}
          disabled={sending}
          style={{
            padding: "12px 22px",
            background: "white",
            color: "var(--anthracite)",
            border: "2px solid var(--line-strong)",
            borderRadius: "10px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <XCircle size={15} strokeWidth={2.5} /> Rejeter toute l&apos;analyse
        </button>

        {sendResult && (
          <div style={{ color: "#16a34a", fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <CheckCircle size={14} strokeWidth={2.5} /> {sendResult}
          </div>
        )}
        {error && (
          <div style={{ color: "#dc2626", fontSize: "13px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <AlertTriangle size={14} strokeWidth={2.5} /> {error}
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   COMPOSANTS
   ═══════════════════════════════════════════ */

function ContextRow({ label, value }: { label: string; value: any }) {
  if (!value || value === "" || (Array.isArray(value) && value.length === 0)) return null;
  return (
    <div>
      <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.4px", marginBottom: "2px" }}>{label}</div>
      <div style={{ fontSize: "13px", color: "var(--anthracite)", fontWeight: 500 }}>{String(value)}</div>
    </div>
  );
}

function ParagraphCard({
  paragraph,
  isFlashSaved,
  onValidate,
  onAnnotate,
  onSaveAnnotation,
  onReset,
  onUpdateNote,
  onUpdateReformulation,
}: {
  paragraph: Paragraph;
  isFlashSaved: boolean;
  onValidate: () => void;
  onAnnotate: () => void;
  onSaveAnnotation: () => void;
  onReset: () => void;
  onUpdateNote: (note: string) => void;
  onUpdateReformulation: (reformulation: string) => void;
}) {
  const isAnnotating = paragraph.status === "annotated";
  const isValidated = paragraph.status === "validated";

  const borderColor = isValidated
    ? "#16a34a"
    : isAnnotating
      ? "#0891b2"
      : "var(--line)";

  return (
    <div style={{
      background: "white",
      border: ("2px solid " + borderColor),
      borderRadius: "10px",
      padding: "14px 16px",
      transition: "border-color 0.2s",
      position: "relative",
    }}>
      {/* Header compact : titre + boutons icônes à droite */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", marginBottom: "8px" }}>
        <h3 style={{ flex: 1, fontSize: "14px", fontWeight: 700, color: "var(--anthracite)", margin: 0, lineHeight: 1.3 }}>
          {paragraph.section}
        </h3>

        {/* Statut + boutons icônes */}
        <div style={{ display: "flex", gap: "6px", alignItems: "center", flexShrink: 0 }}>
          {isFlashSaved && (
            <span style={{ fontSize: "11px", color: "#16a34a", fontWeight: 700, marginRight: "4px", display: "inline-flex", alignItems: "center", gap: "3px" }}>
              <Save size={12} strokeWidth={2.5} /> <Check size={12} strokeWidth={3} />
            </span>
          )}

          {paragraph.status === "pending" && (
            <>
              <IconBtn label="Valider tel quel" color="#16a34a" onClick={onValidate}>
                <Check size={16} strokeWidth={3} />
              </IconBtn>
              <IconBtn label="Annoter pour l'IA" color="#0891b2" onClick={onAnnotate}>
                <Pencil size={14} strokeWidth={2.5} />
              </IconBtn>
            </>
          )}
          {isValidated && (
            <>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#16a34a", textTransform: "uppercase", letterSpacing: "0.5px", padding: "2px 8px", borderRadius: "10px", background: "#16a34a15", marginRight: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Check size={11} strokeWidth={3} /> Validé
              </span>
              <IconBtn label="Annuler" color="#9ca3af" onClick={onReset} secondary>
                <Undo2 size={14} strokeWidth={2.5} />
              </IconBtn>
            </>
          )}
          {isAnnotating && (
            <>
              <span style={{ fontSize: "11px", fontWeight: 700, color: "#0891b2", textTransform: "uppercase", letterSpacing: "0.5px", padding: "2px 8px", borderRadius: "10px", background: "#0891b215", marginRight: "4px", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <Pencil size={11} strokeWidth={2.5} /> Annoté
              </span>
              <IconBtn label="Annuler" color="#9ca3af" onClick={onReset} secondary>
                <Undo2 size={14} strokeWidth={2.5} />
              </IconBtn>
            </>
          )}
        </div>
      </div>

      {/* Contenu original */}
      <div style={{ fontSize: "13.5px", lineHeight: 1.65, color: "var(--anthracite)", whiteSpace: "pre-wrap" }}>
        {paragraph.original}
      </div>

      {/* Zone d'annotation (si statut "annoté") */}
      {isAnnotating && (
        <div style={{ marginTop: "12px", padding: "12px 14px", background: "#f0f9ff", borderRadius: "8px", borderLeft: "3px solid #0891b2" }}>
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#0891b2", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "5px" }}>
            <Pencil size={11} strokeWidth={2.5} /> Note pour l&apos;IA (le pro ne verra PAS cette note)
          </div>
          <textarea
            value={paragraph.note || ""}
            onChange={(e) => onUpdateNote(e.target.value)}
            placeholder="Ex : Attention, plutôt parler de « dans l&apos;atelier » que « avec toi » qui peut être jugeant."
            rows={3}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1.5px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "13px",
              fontFamily: "inherit",
              lineHeight: 1.5,
              color: "var(--anthracite)",
              outline: "none",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
          <div style={{ fontSize: "11px", fontWeight: 700, color: "#0891b2", marginTop: "10px", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.5px", display: "flex", alignItems: "center", gap: "5px" }}>
            <Lightbulb size={11} strokeWidth={2.5} /> Reformulation suggérée (optionnel)
          </div>
          <textarea
            value={paragraph.reformulation || ""}
            onChange={(e) => onUpdateReformulation(e.target.value)}
            placeholder="Ex : Les jeunes semblent ne pas bien percevoir le sens des activités."
            rows={2}
            style={{
              width: "100%",
              padding: "8px 10px",
              border: "1.5px solid #cbd5e1",
              borderRadius: "6px",
              fontSize: "13px",
              fontFamily: "inherit",
              lineHeight: 1.5,
              color: "var(--anthracite)",
              outline: "none",
              boxSizing: "border-box",
              resize: "vertical",
            }}
          />
          <button
            onClick={onSaveAnnotation}
            style={{
              marginTop: "10px",
              padding: "7px 14px",
              background: "#0891b2",
              color: "white",
              border: "none",
              borderRadius: "8px",
              fontSize: "12px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <Save size={13} strokeWidth={2.5} /> Sauvegarder l&apos;annotation
          </button>
        </div>
      )}
    </div>
  );
}

function IconBtn({
  label,
  color,
  onClick,
  secondary,
  children,
}: {
  label: string;
  color: string;
  onClick: () => void;
  secondary?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      title={label}
      onClick={onClick}
      style={{
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        background: secondary ? "white" : color,
        color: secondary ? color : "white",
        border: secondary ? ("1.5px solid " + color) : "none",
        fontSize: "14px",
        fontWeight: 700,
        cursor: "pointer",
        fontFamily: "inherit",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 0,
      }}
    >
      {children}
    </button>
  );
}
