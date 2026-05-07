"use client";

import { useEffect, useState } from "react";
import { supabase, type Parcours, type Fiche, getFiches, getFichesByParcours } from "@/lib/supabase";

export default function AdminParcoursPage() {
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [allFiches, setAllFiches] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  // Fiches association
  const [managingId, setManagingId] = useState<string | null>(null);
  const [parcoursFiches, setParcoursFiches] = useState<Fiche[]>([]);
  const [availableFiches, setAvailableFiches] = useState<Fiche[]>([]);

  const [titre, setTitre] = useState("");
  const [description, setDescription] = useState("");
  const [emoji, setEmoji] = useState("");
  const [couleurHex, setCouleurHex] = useState("#00989D");
  const [ordre, setOrdre] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: pData }, fichesData] = await Promise.all([
      supabase.from("parcours_guides").select("*").order("ordre"),
      getFiches(),
    ]);
    setParcours(pData || []);
    setAllFiches(fichesData);
    setLoading(false);
  }

  function resetForm() {
    setTitre(""); setDescription(""); setEmoji(""); setCouleurHex("#00989D"); setOrdre(0);
    setEditId(null); setShowNew(false); setError("");
  }

  function startEdit(p: Parcours) {
    setEditId(p.id); setShowNew(false); setManagingId(null);
    setTitre(p.titre || ""); setDescription(p.description || "");
    setEmoji(p.emoji || ""); setCouleurHex(p.couleur_hex || "#00989D"); setOrdre(p.ordre || 0);
  }

  function startNew() { resetForm(); setShowNew(true); setManagingId(null); setOrdre(parcours.length + 1); }

  async function handleSave() {
    if (!titre.trim()) { setError("Le titre est obligatoire."); return; }
    setSaving(true); setError("");
    const data = { titre, description: description || null, emoji: emoji || null, couleur_hex: couleurHex, ordre };

    if (editId) {
      const { error: err } = await supabase.from("parcours_guides").update(data).eq("id", editId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("parcours_guides").insert(data);
      if (err) { setError(err.message); setSaving(false); return; }
    }
    setSaving(false); resetForm(); loadData();
  }

  async function handleDelete(p: Parcours) {
    if (!confirm(`Supprimer le parcours "${p.titre}" ?`)) return;
    await supabase.from("parcours_fiches").delete().eq("parcours_id", p.id);
    await supabase.from("parcours_guides").delete().eq("id", p.id);
    loadData();
  }

  // ── Gestion des fiches associées ──

  async function startManageFiches(p: Parcours) {
    setManagingId(p.id); setEditId(null); setShowNew(false);
    const fiches = await getFichesByParcours(p.id);
    setParcoursFiches(fiches);
    const ficheIds = new Set(fiches.map((f) => f.id));
    setAvailableFiches(allFiches.filter((f) => !ficheIds.has(f.id)));
  }

  async function addFicheToParcours(ficheId: string) {
    if (!managingId) return;
    const newOrdre = parcoursFiches.length + 1;
    await supabase.from("parcours_fiches").insert({ parcours_id: managingId, fiche_id: ficheId, ordre: newOrdre });
    startManageFiches(parcours.find((p) => p.id === managingId)!);
  }

  async function removeFicheFromParcours(ficheId: string) {
    if (!managingId) return;
    await supabase.from("parcours_fiches").delete().eq("parcours_id", managingId).eq("fiche_id", ficheId);
    startManageFiches(parcours.find((p) => p.id === managingId)!);
  }

  const isEditing = editId || showNew;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "var(--anthracite)" }}>Parcours guidés</h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>{parcours.length} parcours</p>
        </div>
        {!isEditing && !managingId && (
          <button onClick={startNew} style={{ padding: "10px 20px", background: "var(--canard)", color: "white", borderRadius: "12px", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            + Nouveau parcours
          </button>
        )}
      </div>

      {/* Form */}
      {isEditing && (
        <div style={{ background: "white", border: "2px solid var(--canard)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--anthracite)", marginBottom: "16px" }}>{editId ? "Modifier le parcours" : "Nouveau parcours"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "80px 1fr 100px 80px", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>Emoji</label>
              <input type="text" value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🎯" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Titre *</label>
              <input type="text" value={titre} onChange={(e) => setTitre(e.target.value)} placeholder="Ex: Je diagnostique l'engagement" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Couleur</label>
              <input type="color" value={couleurHex} onChange={(e) => setCouleurHex(e.target.value)} style={{ ...inputStyle, padding: "4px", height: "38px" }} />
            </div>
            <div>
              <label style={labelStyle}>Ordre</label>
              <input type="number" value={ordre} onChange={(e) => setOrdre(parseInt(e.target.value) || 0)} style={inputStyle} />
            </div>
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description du parcours…" style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px", fontSize: "13px", color: "#dc2626", marginBottom: "12px" }}>{error}</div>}
          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleSave} disabled={saving} style={{ padding: "8px 20px", background: "var(--canard)", color: "white", border: "none", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              {saving ? "…" : editId ? "Enregistrer" : "Créer"}
            </button>
            <button onClick={resetForm} style={{ padding: "8px 20px", background: "white", color: "var(--anthracite)", border: "2px solid var(--line)", borderRadius: "10px", fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit" }}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Fiches management panel */}
      {managingId && (
        <div style={{ background: "white", border: "2px solid var(--jaune)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--anthracite)" }}>
              Fiches du parcours ({parcoursFiches.length})
            </h3>
            <button onClick={() => setManagingId(null)} style={{ padding: "6px 14px", background: "white", border: "2px solid var(--line)", borderRadius: "10px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", color: "var(--muted)" }}>
              Fermer
            </button>
          </div>

          {/* Current fiches in parcours */}
          {parcoursFiches.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Dans le parcours (dans l&apos;ordre)</div>
              {parcoursFiches.map((f, i) => (
                <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--canard)", minWidth: "24px" }}>{i + 1}</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--anthracite)", flexGrow: 1 }}>{f.nom}</span>
                  <button onClick={() => removeFicheFromParcours(f.id)} style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "8px", background: "transparent", color: "#dc2626", border: "1px solid #fecaca", cursor: "pointer", fontFamily: "inherit" }}>
                    Retirer
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Available fiches to add */}
          {availableFiches.length > 0 && (
            <div>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: "8px" }}>Ajouter une fiche</div>
              <div style={{ maxHeight: "200px", overflowY: "auto", border: "1px solid var(--line)", borderRadius: "10px" }}>
                {availableFiches.map((f) => (
                  <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderBottom: "1px solid var(--line)", cursor: "pointer" }} onClick={() => addFicheToParcours(f.id)}>
                    <span style={{ fontSize: "14px", color: "var(--anthracite)", flexGrow: 1 }}>{f.nom}</span>
                    <span style={{ fontSize: "12px", color: "var(--canard)", fontWeight: 600 }}>+ Ajouter</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {parcours.map((p) => (
            <div key={p.id} style={{ background: "white", border: "2px solid var(--line)", borderRadius: "12px", padding: "16px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ fontSize: "28px" }}>{p.emoji || "📋"}</span>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--anthracite)" }}>{p.titre}</div>
                {p.description && <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>{p.description}</div>}
              </div>
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>#{p.ordre}</span>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button onClick={() => startManageFiches(p)} style={{ ...actionBtn, color: "var(--canard)", borderColor: "var(--canard-light)" }}>Fiches</button>
                <button onClick={() => startEdit(p)} style={actionBtn}>Modifier</button>
                <button onClick={() => handleDelete(p)} style={{ ...actionBtn, color: "#dc2626", borderColor: "#fecaca" }}>Suppr.</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "12px", fontWeight: 700, color: "var(--muted)", marginBottom: "4px", textTransform: "uppercase", letterSpacing: "0.04em" };
const inputStyle: React.CSSProperties = { width: "100%", padding: "8px 12px", border: "2px solid var(--line-strong)", borderRadius: "10px", fontSize: "14px", fontFamily: "inherit", color: "var(--anthracite)", outline: "none", boxSizing: "border-box", background: "white" };
const actionBtn: React.CSSProperties = { fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "8px", background: "white", color: "var(--anthracite)", border: "1px solid var(--line)", cursor: "pointer", fontFamily: "inherit" };
