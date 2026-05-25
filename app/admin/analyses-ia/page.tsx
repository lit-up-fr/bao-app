"use client";

// app/admin/analyses-ia/page.tsx
// Page admin : liste des analyses IA générées, avec statut de relecture.
// Permet aux admins de filtrer et de cliquer sur une analyse pour la relire paragraphe par paragraphe.

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { Bot, ClipboardList, BarChart3, Key } from "lucide-react";

interface DiagnosticAnalysis {
  id: string;
  created_at: string;
  source: string;
  nom_atelier: string | null;
  type_organisation: string | null;
  contexte: string | null; // type_accompagnement
  nb_jeunes: number | null;
  user_email: string | null;
  reviewed_status: string | null;
  reviewed_at: string | null;
  zones: { appui?: string[]; explorer?: string[]; travailler?: string[] } | null;
}

const STATUS_LABELS: Record<string, string> = {
  pending: "À relire",
  in_progress: "En cours",
  validated: "Validé",
  rejected: "Rejeté",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "#ea580c",
  in_progress: "#0891b2",
  validated: "#16a34a",
  rejected: "#9ca3af",
};

export default function AnalysesIAListPage() {
  const [items, setItems] = useState<DiagnosticAnalysis[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("pending");

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        let query = supabase
          .from("diagnostic_analyses")
          .select("id, created_at, source, nom_atelier, type_organisation, contexte, nb_jeunes, user_email, reviewed_status, reviewed_at, zones")
          .order("created_at", { ascending: false })
          .limit(200);

        if (filter !== "all") {
          query = query.eq("reviewed_status", filter);
        }

        const { data, error } = await query;
        if (error) {
          console.error("Erreur chargement analyses:", error);
        } else if (data) {
          setItems(data as DiagnosticAnalysis[]);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [filter]);

  return (
    <div>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", display: "flex", alignItems: "center", gap: "10px" }}>
          <Bot size={28} strokeWidth={2} color="var(--canard)" />
          Analyses IA à valider
        </h1>
        <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px", maxWidth: "640px" }}>
          Relis les analyses générées par l&apos;IA et envoie les paragraphes validés
          vers la feuille &quot;Retours terrain diagnostic&quot; pour enrichir le corpus.
        </p>
      </div>

      {/* Filtres de statut */}
      <div style={{ display: "flex", gap: "8px", marginBottom: "24px", flexWrap: "wrap" }}>
        {[
          { val: "pending", label: "À relire" },
          { val: "in_progress", label: "En cours" },
          { val: "validated", label: "Validé" },
          { val: "rejected", label: "Rejeté" },
          { val: "all", label: "Tous" },
        ].map(({ val, label }) => (
          <button
            key={val}
            onClick={() => setFilter(val)}
            style={{
              padding: "8px 14px",
              borderRadius: "20px",
              border: "2px solid",
              borderColor: filter === val ? "var(--canard)" : "var(--line)",
              background: filter === val ? "var(--canard)" : "white",
              color: filter === val ? "white" : "var(--anthracite)",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{ color: "var(--muted)", fontSize: "14px" }}>Chargement…</div>
      ) : items.length === 0 ? (
        <div style={{
          padding: "40px",
          textAlign: "center",
          background: "white",
          borderRadius: "12px",
          border: "2px dashed var(--line)",
          color: "var(--muted)",
        }}>
          Aucune analyse {filter !== "all" ? `avec le statut "${STATUS_LABELS[filter] || filter}"` : ""} pour le moment.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {items.map((a) => {
            const status = a.reviewed_status || "pending";
            const travailler = a.zones?.travailler?.slice(0, 3) || [];
            return (
              <Link
                key={a.id}
                href={`/admin/analyses-ia/${a.id}`}
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid var(--line)",
                  padding: "16px 20px",
                  textDecoration: "none",
                  color: "inherit",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  transition: "box-shadow 0.15s, border-color 0.15s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--canard)";
                  e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,152,157,0.1)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--line)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Icône source */}
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px", flexShrink: 0,
                  background: a.source === "diagnostic_pro" ? "#ede9fe" : "#e0f3f4",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  {a.source === "diagnostic_pro"
                    ? <ClipboardList size={22} strokeWidth={2} color="#6B2468" />
                    : <BarChart3 size={22} strokeWidth={2} color="var(--canard)" />}
                </div>

                {/* Info principale */}
                <div style={{ flexGrow: 1, minWidth: 0 }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--anthracite)" }}>
                    {a.nom_atelier || "Sans nom"}
                  </div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", display: "flex", gap: "12px", flexWrap: "wrap", marginTop: "2px" }}>
                    <span>{new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}</span>
                    {a.user_email && <span>{a.user_email}</span>}
                    {a.type_organisation && <span>{a.type_organisation}</span>}
                    {a.contexte && <span>{a.contexte === "individuel" ? "Individuel" : a.contexte === "collectif" ? "Collectif" : "Mixte"}</span>}
                    {a.nb_jeunes && <span>{a.nb_jeunes} jeunes</span>}
                  </div>
                  {travailler.length > 0 && (
                    <div style={{ fontSize: "11px", color: "#ea580c", marginTop: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Key size={11} strokeWidth={2.5} />
                      <span>À travailler : {travailler.join(", ")}{(a.zones?.travailler?.length || 0) > 3 ? "…" : ""}</span>
                    </div>
                  )}
                </div>

                {/* Statut */}
                <div style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: `${STATUS_COLORS[status]}20`,
                  color: STATUS_COLORS[status],
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  whiteSpace: "nowrap",
                  flexShrink: 0,
                }}>
                  {STATUS_LABELS[status] || status}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
