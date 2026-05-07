"use client";

import { useEffect, useState } from "react";
import { getAllPropositions, updatePropositionStatus, Proposition } from "@/lib/auth";

type StatusFilter = "all" | "en_attente" | "acceptee" | "refusee" | "en_discussion";

export default function AdminPropositionsPage() {
  const [propositions, setPropositions] = useState<Proposition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selected, setSelected] = useState<Proposition | null>(null);
  const [commentaire, setCommentaire] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const data = await getAllPropositions();
      setPropositions(data);
      setLoading(false);
    }
    load();
  }, []);

  async function handleStatus(id: string, status: Proposition["status"]) {
    setActionLoading(id);
    try {
      await updatePropositionStatus(id, status, commentaire.trim() || undefined);
      setPropositions((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, status, admin_commentaire: commentaire.trim() || p.admin_commentaire } : p
        )
      );
      if (selected?.id === id) {
        setSelected((prev) =>
          prev ? { ...prev, status, admin_commentaire: commentaire.trim() || prev.admin_commentaire } : null
        );
      }
      setCommentaire("");
    } catch (e) {
      console.error("Erreur:", e);
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = propositions.filter((p) => filter === "all" || p.status === filter);

  const counts = {
    all: propositions.length,
    en_attente: propositions.filter((p) => p.status === "en_attente").length,
    acceptee: propositions.filter((p) => p.status === "acceptee").length,
    en_discussion: propositions.filter((p) => p.status === "en_discussion").length,
    refusee: propositions.filter((p) => p.status === "refusee").length,
  };

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    en_attente: { bg: "#fef3c7", text: "#92400e", label: "En attente" },
    acceptee: { bg: "#d1fae5", text: "#065f46", label: "Acceptée" },
    refusee: { bg: "#fee2e2", text: "#991b1b", label: "Non retenue" },
    en_discussion: { bg: "#e0e7ff", text: "#3730a3", label: "En discussion" },
  };

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Chargement des propositions...</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2B3442", marginBottom: "4px" }}>Propositions d'outils</h1>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>Examiner et modérer les propositions des utilisateurs</p>
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        {(["all", "en_attente", "en_discussion", "acceptee", "refusee"] as StatusFilter[]).map((s) => {
          const labels: Record<StatusFilter, string> = { all: "Toutes", en_attente: "En attente", acceptee: "Acceptées", en_discussion: "En discussion", refusee: "Non retenues" };
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: filter === s ? "2px solid #2B3442" : "2px solid #e5e7eb",
                background: filter === s ? "#2B3442" : "white",
                color: filter === s ? "white" : "#6b7280",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {labels[s]} ({counts[s]})
            </button>
          );
        })}
      </div>

      {/* Liste + Détail */}
      <div style={{ display: "flex", gap: "20px" }}>
        {/* Liste */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {filtered.length === 0 ? (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "40px", textAlign: "center", color: "#9ca3af" }}>
              Aucune proposition dans cette catégorie.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {filtered.map((p) => {
                const sc = statusColors[p.status];
                const profile = p.profile as Proposition["profile"];
                return (
                  <div
                    key={p.id}
                    onClick={() => { setSelected(p); setCommentaire(p.admin_commentaire || ""); }}
                    style={{
                      background: selected?.id === p.id ? "#f0fdfa" : "white",
                      borderRadius: "12px",
                      border: selected?.id === p.id ? "2px solid #00989D" : "1px solid #e5e7eb",
                      padding: "18px",
                      cursor: "pointer",
                      transition: "all 0.15s",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "6px" }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#2B3442" }}>{p.titre}</div>
                      <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "12px", background: sc.bg, color: sc.text, whiteSpace: "nowrap", flexShrink: 0 }}>
                        {sc.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "13px", color: "#6b7280", margin: "0 0 6px 0", lineHeight: "1.4" }}>
                      {p.description.slice(0, 120)}{p.description.length > 120 ? "…" : ""}
                    </p>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Par {profile?.prenom} {profile?.nom} ({profile?.structure || "Structure non renseignée"}) · {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Panneau détail */}
        {selected && (
          <div style={{ width: "380px", flexShrink: 0, background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", alignSelf: "flex-start", position: "sticky", top: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B3442", margin: 0 }}>Détail</h3>
              <button onClick={() => setSelected(null)} style={{ background: "none", border: "none", fontSize: "18px", cursor: "pointer", color: "#9ca3af" }}>✕</button>
            </div>

            <div style={{ fontSize: "20px", fontWeight: 700, color: "#2B3442", marginBottom: "4px" }}>{selected.titre}</div>
            <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "12px", background: statusColors[selected.status].bg, color: statusColors[selected.status].text }}>
              {statusColors[selected.status].label}
            </span>

            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
              <DetailRow label="Description" value={selected.description} />
              <DetailRow label="Contexte" value={selected.contexte} />
              <DetailRow label="Objectifs" value={selected.objectifs} />
              <DetailRow label="Public cible" value={selected.public_cible} />
              <DetailRow label="Format" value={selected.format_suggere} />
              <DetailRow label="Durée estimée" value={selected.duree_estimee} />
              {selected.lien_ressource && (
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>Lien</div>
                  <a href={selected.lien_ressource} target="_blank" rel="noopener noreferrer" style={{ fontSize: "14px", color: "#00989D", wordBreak: "break-all" }}>
                    {selected.lien_ressource}
                  </a>
                </div>
              )}
              <DetailRow
                label="Proposé par"
                value={`${(selected.profile as any)?.prenom} ${(selected.profile as any)?.nom} (${(selected.profile as any)?.structure || "—"}) · ${(selected.profile as any)?.categorie_pro || "—"}`}
              />
              <DetailRow
                label="Date"
                value={new Date(selected.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              />
            </div>

            {/* Commentaire admin */}
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
              <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "#2B3442", marginBottom: "6px" }}>
                Commentaire (visible par l'utilisateur)
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                placeholder="Merci pour votre proposition ! Nous allons..."
                style={{
                  width: "100%",
                  minHeight: "80px",
                  padding: "10px 12px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  fontSize: "13px",
                  fontFamily: "inherit",
                  resize: "vertical",
                  outline: "none",
                  lineHeight: "1.5",
                }}
              />
            </div>

            {/* Actions */}
            <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
              {selected.status !== "acceptee" && (
                <button
                  onClick={() => handleStatus(selected.id, "acceptee")}
                  disabled={actionLoading === selected.id}
                  style={{ padding: "10px", borderRadius: "8px", border: "none", background: "#10b981", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" }}
                >
                  Accepter la proposition
                </button>
              )}
              {selected.status !== "en_discussion" && selected.status !== "acceptee" && (
                <button
                  onClick={() => handleStatus(selected.id, "en_discussion")}
                  disabled={actionLoading === selected.id}
                  style={{ padding: "10px", borderRadius: "8px", border: "2px solid #6366f1", background: "white", color: "#6366f1", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" }}
                >
                  Mettre en discussion
                </button>
              )}
              {selected.status !== "refusee" && (
                <button
                  onClick={() => handleStatus(selected.id, "refusee")}
                  disabled={actionLoading === selected.id}
                  style={{ padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", color: "#6b7280", fontSize: "13px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", width: "100%" }}
                >
                  Ne pas retenir
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null;
  return (
    <div>
      <div style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>{label}</div>
      <div style={{ fontSize: "14px", color: "#2B3442", marginTop: "2px", lineHeight: "1.5", whiteSpace: "pre-wrap" }}>{value}</div>
    </div>
  );
}
