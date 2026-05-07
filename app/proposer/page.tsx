"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { createProposition, getMyPropositions, Proposition } from "@/lib/auth";
import AuthGuard from "@/components/AuthGuard";

function ProposerContent() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [myPropositions, setMyPropositions] = useState<Proposition[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    titre: "",
    description: "",
    contexte: "",
    objectifs: "",
    public_cible: "",
    format_suggere: "",
    duree_estimee: "",
    lien_ressource: "",
  });

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const props = await getMyPropositions(session.user.id);
        setMyPropositions(props);
      }
    }
    load();
  }, []);

  function updateForm(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit() {
    if (!userId) return;
    if (!form.titre.trim()) { setError("Le titre est requis"); return; }
    if (!form.description.trim()) { setError("La description est requise"); return; }

    setSubmitting(true);
    setError("");

    try {
      const newProp = await createProposition(userId, {
        titre: form.titre.trim(),
        description: form.description.trim(),
        contexte: form.contexte.trim() || undefined,
        objectifs: form.objectifs.trim() || undefined,
        public_cible: form.public_cible.trim() || undefined,
        format_suggere: form.format_suggere.trim() || undefined,
        duree_estimee: form.duree_estimee.trim() || undefined,
        lien_ressource: form.lien_ressource.trim() || undefined,
      });
      setMyPropositions((prev) => [newProp, ...prev]);
      setForm({ titre: "", description: "", contexte: "", objectifs: "", public_cible: "", format_suggere: "", duree_estimee: "", lien_ressource: "" });
      setShowForm(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch (e) {
      console.error("Erreur proposition:", e);
      setError("Une erreur est survenue");
    } finally {
      setSubmitting(false);
    }
  }

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    en_attente: { bg: "#fef3c7", text: "#92400e", label: "En attente de relecture" },
    acceptee: { bg: "#d1fae5", text: "#065f46", label: "Acceptée" },
    refusee: { bg: "#fee2e2", text: "#991b1b", label: "Non retenue" },
    en_discussion: { bg: "#e0e7ff", text: "#3730a3", label: "En discussion" },
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "10px 14px",
    border: "1.5px solid #d1d5db",
    borderRadius: "10px",
    fontSize: "14px",
    fontFamily: "inherit",
    color: "#2B3442",
    outline: "none",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "13px",
    fontWeight: 600,
    color: "#2B3442",
    marginBottom: "5px",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header style={{ background: "#2B3442", padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/bao">
            <img src="/logo-litup-white.png" alt="Lit uP" style={{ height: "28px", cursor: "pointer" }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>|</span>
          <span style={{ color: "white", fontSize: "16px", fontWeight: 600 }}>Proposer un outil</span>
        </div>
        <Link href="/bao" style={{ padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.8)", fontSize: "13px", fontWeight: 600, textDecoration: "none" }}>
          ← Retour à la BAO
        </Link>
      </header>

      <div style={{ maxWidth: "720px", margin: "0 auto", padding: "32px 20px" }}>
        {/* Intro */}
        <div style={{ marginBottom: "28px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2B3442", marginBottom: "8px" }}>
            Proposer un nouvel outil
          </h1>
          <p style={{ fontSize: "15px", color: "#6b7280", lineHeight: "1.6" }}>
            Vous connaissez un outil d'animation, une méthode ou une activité qui pourrait enrichir la Boîte à Outils ?
            Partagez votre idée, l'équipe Lit uP l'examinera pour une éventuelle intégration.
          </p>
        </div>

        {/* Success message */}
        {success && (
          <div style={{ background: "#d1fae5", border: "1px solid #6ee7b7", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", color: "#065f46", fontSize: "14px" }}>
            Votre proposition a bien été envoyée ! L'équipe Lit uP l'examinera prochainement.
          </div>
        )}

        {/* Bouton proposer */}
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            style={{
              padding: "14px 28px",
              borderRadius: "12px",
              border: "none",
              background: "#00989D",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              cursor: "pointer",
              fontFamily: "inherit",
              marginBottom: "32px",
            }}
          >
            + Proposer un outil
          </button>
        )}

        {/* Formulaire */}
        {showForm && (
          <div style={{ background: "white", borderRadius: "14px", border: "1px solid #e5e7eb", padding: "28px", marginBottom: "32px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#2B3442", marginBottom: "20px" }}>
              Décrivez votre outil
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Nom de l'outil / activité <span style={{ color: "#dc2626" }}>*</span></label>
                <input style={inputStyle} value={form.titre} onChange={(e) => updateForm("titre", e.target.value)} placeholder="Ex : Le photolangage des émotions" />
              </div>

              <div>
                <label style={labelStyle}>Description <span style={{ color: "#dc2626" }}>*</span></label>
                <textarea
                  style={{ ...inputStyle, minHeight: "100px", resize: "vertical", lineHeight: "1.5" }}
                  value={form.description}
                  onChange={(e) => updateForm("description", e.target.value)}
                  placeholder="Décrivez l'outil : en quoi consiste-t-il ? Comment se déroule-t-il ?"
                />
              </div>

              <div>
                <label style={labelStyle}>Contexte d'utilisation</label>
                <textarea
                  style={{ ...inputStyle, minHeight: "70px", resize: "vertical", lineHeight: "1.5" }}
                  value={form.contexte}
                  onChange={(e) => updateForm("contexte", e.target.value)}
                  placeholder="Dans quel contexte l'avez-vous utilisé ou découvert ?"
                />
              </div>

              <div>
                <label style={labelStyle}>Objectifs visés</label>
                <input style={inputStyle} value={form.objectifs} onChange={(e) => updateForm("objectifs", e.target.value)} placeholder="Quels objectifs pédagogiques cet outil permet-il d'atteindre ?" />
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Public cible</label>
                  <input style={inputStyle} value={form.public_cible} onChange={(e) => updateForm("public_cible", e.target.value)} placeholder="Ex : Jeunes 16-25 ans" />
                </div>
                <div>
                  <label style={labelStyle}>Format suggéré</label>
                  <input style={inputStyle} value={form.format_suggere} onChange={(e) => updateForm("format_suggere", e.target.value)} placeholder="Ex : Collectif, 8-15 pers." />
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Durée estimée</label>
                  <input style={inputStyle} value={form.duree_estimee} onChange={(e) => updateForm("duree_estimee", e.target.value)} placeholder="Ex : 45 min à 1h" />
                </div>
                <div>
                  <label style={labelStyle}>Lien / ressource</label>
                  <input style={inputStyle} value={form.lien_ressource} onChange={(e) => updateForm("lien_ressource", e.target.value)} placeholder="URL vers une ressource liée" />
                </div>
              </div>

              {error && (
                <div style={{ color: "#dc2626", fontSize: "13px" }}>{error}</div>
              )}

              <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "8px" }}>
                <button
                  onClick={() => { setShowForm(false); setError(""); }}
                  style={{ padding: "10px 22px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", color: "#6b7280", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  style={{ padding: "10px 22px", borderRadius: "8px", border: "none", background: submitting ? "#9ca3af" : "#00989D", color: "white", fontSize: "14px", fontWeight: 700, cursor: submitting ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                >
                  {submitting ? "Envoi..." : "Envoyer ma proposition"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Mes propositions */}
        <div>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#2B3442", marginBottom: "16px" }}>
            Mes propositions
          </h2>
          {myPropositions.length === 0 ? (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "32px", textAlign: "center", color: "#9ca3af", fontSize: "14px" }}>
              Vous n'avez pas encore proposé d'outil.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {myPropositions.map((p) => {
                const sc = statusColors[p.status] || statusColors.en_attente;
                return (
                  <div key={p.id} style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "12px", flexWrap: "wrap" }}>
                      <div style={{ fontSize: "16px", fontWeight: 700, color: "#2B3442" }}>{p.titre}</div>
                      <span style={{ fontSize: "12px", fontWeight: 600, padding: "3px 10px", borderRadius: "12px", background: sc.bg, color: sc.text, whiteSpace: "nowrap" }}>
                        {sc.label}
                      </span>
                    </div>
                    <p style={{ fontSize: "14px", color: "#6b7280", lineHeight: "1.5", margin: "0 0 8px 0" }}>
                      {p.description.slice(0, 200)}{p.description.length > 200 ? "…" : ""}
                    </p>
                    <div style={{ fontSize: "12px", color: "#9ca3af" }}>
                      Proposé le {new Date(p.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </div>
                    {p.admin_commentaire && (
                      <div style={{ marginTop: "12px", padding: "12px 16px", borderRadius: "10px", background: "#f9fafb", border: "1px solid #e5e7eb", fontSize: "13px", color: "#374151" }}>
                        <strong style={{ color: "#2B3442" }}>Réponse de l'équipe :</strong> {p.admin_commentaire}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ProposerPage() {
  return (
    <AuthGuard>
      <ProposerContent />
    </AuthGuard>
  );
}
