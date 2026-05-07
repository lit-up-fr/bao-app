"use client";

import { useEffect, useState } from "react";
import {
  getRetoursByFiche,
  createRetour,
  deleteRetour,
  Retour,
} from "@/lib/auth";

interface RetoursSectionProps {
  ficheId: string;
  userId: string | null;
  isAdmin?: boolean;
}

function StarRating({
  value,
  onChange,
  readonly = false,
  size = 20,
}: {
  value: number;
  onChange?: (n: number) => void;
  readonly?: boolean;
  size?: number;
}) {
  const [hover, setHover] = useState(0);

  return (
    <div style={{ display: "flex", gap: "2px" }}>
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          onClick={() => !readonly && onChange?.(n)}
          onMouseEnter={() => !readonly && setHover(n)}
          onMouseLeave={() => !readonly && setHover(0)}
          style={{
            cursor: readonly ? "default" : "pointer",
            fontSize: `${size}px`,
            color: n <= (hover || value) ? "#FCC33E" : "#d1d5db",
            transition: "color 0.1s",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "À l'instant";
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `Il y a ${Math.floor(diff / 86400)}j`;
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
}

export default function RetoursSection({ ficheId, userId, isAdmin }: RetoursSectionProps) {
  const [retours, setRetours] = useState<Retour[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [contenu, setContenu] = useState("");
  const [note, setNote] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getRetoursByFiche(ficheId);
      setRetours(data);
      setLoading(false);
    }
    load();
  }, [ficheId]);

  async function handleSubmit() {
    if (!userId) return;
    if (!contenu.trim()) {
      setError("Écrivez votre retour d'expérience");
      return;
    }
    if (note === 0) {
      setError("Attribuez une note");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const newRetour = await createRetour(ficheId, userId, contenu.trim(), note);
      setRetours((prev) => [newRetour, ...prev]);
      setContenu("");
      setNote(0);
      setShowForm(false);
    } catch (e) {
      console.error("Erreur création retour:", e);
      setError("Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(retourId: string) {
    if (!confirm("Supprimer ce retour d'expérience ?")) return;
    try {
      await deleteRetour(retourId);
      setRetours((prev) => prev.filter((r) => r.id !== retourId));
    } catch (e) {
      console.error("Erreur suppression:", e);
    }
  }

  const averageNote = retours.length > 0
    ? retours.filter((r) => r.note).reduce((sum, r) => sum + (r.note || 0), 0) / retours.filter((r) => r.note).length
    : 0;

  const userAlreadyPosted = userId && retours.some((r) => r.user_id === userId);

  return (
    <div style={{ marginTop: "36px", paddingTop: "28px", borderTop: "2px solid var(--line)" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--anthracite)", letterSpacing: "-0.015em" }}>
            Retours d'expérience
          </div>
          {retours.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
              <StarRating value={Math.round(averageNote)} readonly size={16} />
              <span style={{ fontSize: "13px", color: "var(--muted)" }}>
                {averageNote.toFixed(1)} / 5 ({retours.length} avis)
              </span>
            </div>
          )}
        </div>
        {userId && !userAlreadyPosted && !showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "8px 18px",
              borderRadius: "20px",
              border: "2px solid var(--canard)",
              background: "white",
              color: "var(--canard)",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              transition: "all 0.2s",
            }}
          >
            + Partager mon retour
          </button>
        )}
      </div>

      {/* Formulaire */}
      {showForm && (
        <div
          style={{
            background: "var(--blanc)",
            borderRadius: "14px",
            padding: "20px",
            marginBottom: "20px",
          }}
        >
          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--anthracite)", marginBottom: "6px" }}>
              Votre note
            </div>
            <StarRating value={note} onChange={setNote} size={28} />
          </div>

          <div style={{ marginBottom: "14px" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--anthracite)", marginBottom: "6px" }}>
              Votre retour d'expérience
            </div>
            <textarea
              value={contenu}
              onChange={(e) => { setContenu(e.target.value); setError(""); }}
              placeholder="Comment avez-vous utilisé cet outil ? Qu'est-ce qui a bien fonctionné ? Qu'adapteriez-vous ?"
              style={{
                width: "100%",
                minHeight: "100px",
                padding: "12px 14px",
                border: "1.5px solid var(--line-strong)",
                borderRadius: "10px",
                fontSize: "14px",
                fontFamily: "inherit",
                color: "var(--anthracite)",
                resize: "vertical",
                outline: "none",
                lineHeight: "1.5",
              }}
            />
          </div>

          {error && (
            <div style={{ color: "#dc2626", fontSize: "13px", marginBottom: "12px" }}>
              {error}
            </div>
          )}

          <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
            <button
              onClick={() => { setShowForm(false); setContenu(""); setNote(0); setError(""); }}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "1px solid #d1d5db",
                background: "white",
                color: "#6b7280",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              style={{
                padding: "8px 18px",
                borderRadius: "8px",
                border: "none",
                background: submitting ? "#9ca3af" : "var(--canard)",
                color: "white",
                fontSize: "13px",
                fontWeight: 600,
                cursor: submitting ? "not-allowed" : "pointer",
                fontFamily: "inherit",
              }}
            >
              {submitting ? "Envoi..." : "Publier"}
            </button>
          </div>
        </div>
      )}

      {/* Liste des retours */}
      {loading ? (
        <div style={{ padding: "20px", textAlign: "center", color: "var(--muted)", fontSize: "14px" }}>
          Chargement des retours...
        </div>
      ) : retours.length === 0 ? (
        <div
          style={{
            padding: "32px",
            textAlign: "center",
            background: "var(--blanc)",
            borderRadius: "14px",
            color: "var(--muted)",
            fontSize: "14px",
          }}
        >
          Aucun retour d'expérience pour le moment.
          {userId && " Soyez le premier à partager le vôtre !"}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {retours.map((r) => {
            const profile = r.profile as Retour["profile"];
            const isOwn = userId === r.user_id;

            return (
              <div
                key={r.id}
                style={{
                  background: "white",
                  border: "1.5px solid var(--line)",
                  borderRadius: "14px",
                  padding: "18px 20px",
                }}
              >
                {/* Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--anthracite)" }}>
                        {profile?.prenom} {profile?.nom?.charAt(0)}.
                      </span>
                      {profile?.structure && (
                        <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                          {profile.structure}
                        </span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                      {r.note && <StarRating value={r.note} readonly size={14} />}
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>
                        {timeAgo(r.created_at)}
                      </span>
                    </div>
                  </div>
                  {(isOwn || isAdmin) && (
                    <button
                      onClick={() => handleDelete(r.id)}
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "16px",
                        color: "#d1d5db",
                        padding: "2px 6px",
                      }}
                      title="Supprimer"
                    >
                      🗑
                    </button>
                  )}
                </div>

                {/* Contenu */}
                <p style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--anthracite)", margin: 0, whiteSpace: "pre-wrap" }}>
                  {r.contenu}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
