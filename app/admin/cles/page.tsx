"use client";

import { useEffect, useState } from "react";
import { supabase, type Cle } from "@/lib/supabase";

export default function AdminClesPage() {
  const [cles, setCles] = useState<Cle[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [showNew, setShowNew] = useState(false);

  // Form fields
  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [description, setDescription] = useState("");
  const [descriptionLongue, setDescriptionLongue] = useState("");
  const [couleurHex, setCouleurHex] = useState("#00989D");
  const [ordre, setOrdre] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { loadCles(); }, []);

  async function loadCles() {
    const { data } = await supabase.from("cles").select("*").order("ordre");
    setCles(data || []);
    setLoading(false);
  }

  function resetForm() {
    setCode(""); setNom(""); setDescription(""); setDescriptionLongue(""); setCouleurHex("#00989D"); setOrdre(0);
    setEditId(null); setShowNew(false); setError("");
  }

  function startEdit(cle: Cle) {
    setEditId(cle.id);
    setShowNew(false);
    setCode(cle.code || "");
    setNom(cle.nom || "");
    setDescription(cle.description || "");
    setDescriptionLongue(cle.description_longue || "");
    setCouleurHex(cle.couleur_hex || "#00989D");
    setOrdre(cle.ordre || 0);
  }

  function startNew() {
    resetForm();
    setShowNew(true);
    setOrdre(cles.length + 1);
  }

  async function handleSave() {
    if (!nom.trim()) { setError("Le nom est obligatoire."); return; }
    setSaving(true); setError("");

    const data = { code: code || nom.substring(0, 3).toUpperCase(), nom, description: description || null, description_longue: descriptionLongue || null, couleur_hex: couleurHex, ordre };

    if (editId) {
      const { error: err } = await supabase.from("cles").update(data).eq("id", editId);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { error: err } = await supabase.from("cles").insert(data);
      if (err) { setError(err.message); setSaving(false); return; }
    }

    setSaving(false);
    resetForm();
    loadCles();
  }

  async function handleDelete(cle: Cle) {
    if (!confirm(`Supprimer la clé "${cle.nom}" ?`)) return;
    await supabase.from("fiches_cles").delete().eq("cle_id", cle.id);
    await supabase.from("cles").delete().eq("id", cle.id);
    loadCles();
  }

  const isEditing = editId || showNew;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "var(--anthracite)" }}>Clés d&apos;engagement</h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>{cles.length} clé{cles.length !== 1 ? "s" : ""}</p>
        </div>
        {!isEditing && (
          <button onClick={startNew} style={{ padding: "10px 20px", background: "var(--canard)", color: "white", borderRadius: "12px", fontSize: "14px", fontWeight: 700, border: "none", cursor: "pointer", fontFamily: "inherit" }}>
            + Nouvelle clé
          </button>
        )}
      </div>

      {/* Form */}
      {isEditing && (
        <div style={{ background: "white", border: "2px solid var(--canard)", borderRadius: "16px", padding: "24px", marginBottom: "24px" }}>
          <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--anthracite)", marginBottom: "16px" }}>{editId ? "Modifier la clé" : "Nouvelle clé"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 100px 80px", gap: "12px", marginBottom: "12px" }}>
            <div>
              <label style={labelStyle}>Nom *</label>
              <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Sens" style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Code</label>
              <input type="text" value={code} onChange={(e) => setCode(e.target.value)} placeholder="SEN" style={inputStyle} />
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

      {/* List */}
      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {cles.map((cle) => (
            <div key={cle.id} style={{ background: "white", border: "2px solid var(--line)", borderRadius: "12px", padding: "14px 18px", display: "flex", alignItems: "center", gap: "14px" }}>
              <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: cle.couleur_hex || "var(--canard)", flexShrink: 0 }} />
              <span style={{ fontSize: "13px", fontWeight: 800, color: "var(--muted)", minWidth: "40px" }}>{cle.code}</span>
              <span style={{ fontSize: "15px", fontWeight: 700, color: "var(--anthracite)", flexGrow: 1 }}>{cle.nom}</span>
              {cle.description && <span style={{ fontSize: "12px", color: "var(--muted)", flexGrow: 2 }}>{cle.description}</span>}
              <span style={{ fontSize: "12px", color: "var(--muted)" }}>#{cle.ordre}</span>
              <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                <button onClick={() => startEdit(cle)} style={actionBtn}>Modifier</button>
                <button onClick={() => handleDelete(cle)} style={{ ...actionBtn, color: "#dc2626", borderColor: "#fecaca" }}>Suppr.</button>
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
