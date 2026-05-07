"use client";

import { useEffect, useState } from "react";
import { supabase, type Etape } from "@/lib/supabase";

export default function AdminEtapesPage() {
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionLongue, setDescriptionLongue] = useState("");
  const [couleurHex, setCouleurHex] = useState("#00989D");
  const [ordre, setOrdre] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadEtapes(); }, []);

  async function loadEtapes() {
    const { data } = await supabase.from("etapes_parcours").select("*").order("ordre");
    setEtapes(data || []);
    setLoading(false);
  }

  function resetForm() {
    setCode(""); setNom(""); setDescription(""); setDescriptionLongue(""); setCouleurHex("#00989D"); setOrdre(0);
    setEditId(null); setShowNew(false); setError("");
  }

  function startEdit(etape: Etape) {
    setEditId(etape.id); setShowNew(false);
    setCode(etape.code || ""); setNom(etape.nom || "");
    setDescription(etape.description || ""); setDescriptionLongue(etape.description_longue || "");
    setCouleurHex(etape.couleur_hex || "#00989D"); setOrdre(etape.ordre || 0);
  }

  function startNew() { resetForm(); setShowNew(true); setOrdre(etapes.length + 1); }

  async function handleSave() {
    if (!nom.trim() || !code.trim()) { setError("Le code et le nom sont obligatoires."); return; }
    setSaving(true); setError("");
    const data = { code, nom, description: description || null, description_longue: descriptionLongue || null, couleur_hex: couleurHex, ordre };

    if (editId) {
      const { error: err } = await supabase.from("etapes_parcours").update(data).eq("id", editId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("etapes_parcours").insert(data);
      if (err) { setError(err.message); setSaving(false); return; }
    }
    setSaving(false); resetForm(); loadEtapes();
  }

  async function handleDelete(etape: Etape) {
    if (!confirm(`Supprimer l'étape "${etape.code} · ${etape.nom}" ?`)) return;
    await supabase.from("etapes_parcours").delete().eq("id", etape.id);
    loadEtapes();
  }

  const isEditing = editId || showNew;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "var(--anthracite)" }}>Étapes de parcours</h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>{etapes.length} étape{etapes.length !== 1 ? "s" : ""}</p>
        </div>
        {!isEditing && (
          <button onClick={startNew} style={{ padding: "10px 20px", background: "var(--canard)", color: "white", borderRadius: "12px", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            + Nouvelle étape
          </button>
        )}
      </div>

      {isEditing && (
        <div style={{ background: "white", border: "2px solid var(--canard)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--anthracite)", marginBottom: "16px" }}>{editId ? "Modifier l'étape" : "Nouvelle étape"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "100px 1fr 100px 80px", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>Code *</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="A" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Cadrage / Connexion" style={inputStyle} />
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
          <div style={{ marginBottom: "12px" }}>
            <label style={labelStyle}>Description courte</label>
            <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description courte…" style={inputStyle} />
          </div>
          <div style={{ marginBottom: "16px" }}>
            <label style={labelStyle}>Description longue</label>
            <textarea value={descriptionLongue} onChange={(e) => setDescriptionLongue(e.target.value)} rows={2} placeholder="Description détaillée…" style={{ ...inputStyle, resize: "vertical" }} />
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

      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {etapes.map((etape) => (
            <div key={etape.id} style={{ background: "white", border: "2px solid var(--line)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: etape.couleur_hex || "var(--canard)", flexShrink: 0 }} />
              <span style={{ fontSize: "14px", fontWeight: 800, color: "var(--anthracite)", minWidth: "40px" }}>{etape.code}</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--anthracite)", flexGrow: 1 }}>{etape.nom}</span>
              {etape.description && <span style={{ fontSize: "12px", color: "var(--muted)", flexGrow: 2 }}>{etape.description}</span>}
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>#{etape.ordre}</span>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button onClick={() => startEdit(etape)} style={actionBtn}>Modifier</button>
                <button onClick={() => handleDelete(etape)} style={{ ...actionBtn, color: "#dc2626", borderColor: "#fecaca" }}>Suppr.</button>
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
