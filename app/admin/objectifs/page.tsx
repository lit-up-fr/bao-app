"use client";

import { useEffect, useState } from "react";
import { supabase, type Fiche, type Objectif } from "@/lib/supabase";

interface ObjectifRow extends Objectif {
  ficheCount: number;
}

export default function AdminObjectifsPage() {
  const [objectifs, setObjectifs] = useState<ObjectifRow[]>([]);
  const [fiches, setFiches] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit/Create form
  const [editing, setEditing] = useState<ObjectifRow | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formNom, setFormNom] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formEmoji, setFormEmoji] = useState("");
  const [formMotCle, setFormMotCle] = useState("");
  const [formOrdre, setFormOrdre] = useState(1);
  const [selectedFicheIds, setSelectedFicheIds] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ficheSearch, setFicheSearch] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [{ data: objData }, { data: fichesData }, { data: assocData }] = await Promise.all([
      supabase.from("objectifs").select("*").order("ordre"),
      supabase.from("fiches").select("id, nom, emoji, publie").order("nom"),
      supabase.from("objectifs_fiches").select("objectif_id, fiche_id"),
    ]);

    const countMap: Record<string, number> = {};
    (assocData || []).forEach((a: any) => {
      countMap[a.objectif_id] = (countMap[a.objectif_id] || 0) + 1;
    });

    setObjectifs(
      (objData || []).map((o: any) => ({ ...o, ficheCount: countMap[o.id] || 0 }))
    );
    setFiches((fichesData || []) as any);
    setLoading(false);
  }

  async function openEdit(obj: ObjectifRow) {
    setEditing(obj);
    setIsCreating(false);
    setFormNom(obj.nom);
    setFormDescription(obj.description || "");
    setFormEmoji(obj.emoji || "");
    setFormMotCle(obj.mot_cle || "");
    setFormOrdre(obj.ordre);
    setError("");
    setFicheSearch("");

    // Load associations
    const { data } = await supabase
      .from("objectifs_fiches")
      .select("fiche_id")
      .eq("objectif_id", obj.id)
      .order("ordre");
    setSelectedFicheIds((data || []).map((d: any) => d.fiche_id));
  }

  function openCreate() {
    setEditing(null);
    setIsCreating(true);
    setFormNom("");
    setFormDescription("");
    setFormEmoji("📋");
    setFormMotCle("");
    setFormOrdre(objectifs.length + 1);
    setSelectedFicheIds([]);
    setError("");
    setFicheSearch("");
  }

  function closeForm() {
    setEditing(null);
    setIsCreating(false);
  }

  function toggleFiche(ficheId: string) {
    setSelectedFicheIds((prev) =>
      prev.includes(ficheId) ? prev.filter((id) => id !== ficheId) : [...prev, ficheId]
    );
  }

  async function handleSave() {
    if (!formNom.trim()) { setError("Le nom est obligatoire."); return; }
    setSaving(true);
    setError("");

    const payload = {
      nom: formNom.trim(),
      description: formDescription.trim() || null,
      emoji: formEmoji.trim() || null,
      mot_cle: formMotCle.trim() || null,
      ordre: formOrdre,
    };

    let objectifId = editing?.id;

    if (editing) {
      const { error: err } = await supabase.from("objectifs").update(payload).eq("id", editing.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { data, error: err } = await supabase.from("objectifs").insert(payload).select("id").single();
      if (err) { setError(err.message); setSaving(false); return; }
      objectifId = data.id;
    }

    // Sync associations
    if (objectifId) {
      await supabase.from("objectifs_fiches").delete().eq("objectif_id", objectifId);
      if (selectedFicheIds.length > 0) {
        const rows = selectedFicheIds.map((ficheId, i) => ({
          objectif_id: objectifId,
          fiche_id: ficheId,
          ordre: i + 1,
        }));
        const { error: assocErr } = await supabase.from("objectifs_fiches").insert(rows);
        if (assocErr) console.error("Erreur associations:", assocErr.message);
      }
    }

    setSaving(false);
    closeForm();
    loadData();
  }

  async function handleDelete(obj: ObjectifRow) {
    if (!confirm(`Supprimer l'objectif "${obj.nom}" et ses ${obj.ficheCount} associations ?`)) return;
    await supabase.from("objectifs_fiches").delete().eq("objectif_id", obj.id);
    await supabase.from("objectifs").delete().eq("id", obj.id);
    loadData();
  }

  const filteredFiches = fiches.filter((f) =>
    !ficheSearch || f.nom.toLowerCase().includes(ficheSearch.toLowerCase())
  );

  const showForm = editing || isCreating;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px" }}>
        <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)" }}>
          Objectifs
        </h1>
        <button
          onClick={openCreate}
          style={{
            padding: "10px 20px", background: "var(--canard)", color: "white", border: "none",
            borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
          }}
        >
          + Nouvel objectif
        </button>
      </div>

      {loading ? (
        <p style={{ color: "var(--muted)" }}>Chargement…</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          {objectifs.map((obj) => (
            <div
              key={obj.id}
              style={{
                display: "flex", alignItems: "center", gap: "16px",
                padding: "14px 18px", background: "white", borderRadius: "12px",
                border: "2px solid var(--line)", transition: "border-color 0.15s",
              }}
            >
              <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", width: "20px", textAlign: "center" }}>
                {obj.ordre}
              </span>
              <span style={{ fontSize: "24px" }}>{obj.emoji || "📋"}</span>
              <div style={{ flexGrow: 1 }}>
                <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--anthracite)" }}>{obj.nom}</div>
                <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                  {obj.mot_cle && <span style={{ background: "var(--canard)", color: "white", padding: "1px 6px", borderRadius: "6px", fontSize: "10px", fontWeight: 700, marginRight: "8px" }}>{obj.mot_cle}</span>}
                  {obj.ficheCount} fiche{obj.ficheCount !== 1 ? "s" : ""} associée{obj.ficheCount !== 1 ? "s" : ""}
                </div>
              </div>
              <button onClick={() => openEdit(obj)} style={{ padding: "6px 14px", background: "white", border: "1.5px solid var(--canard)", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "var(--canard)", cursor: "pointer", fontFamily: "inherit" }}>
                Modifier
              </button>
              <button onClick={() => handleDelete(obj)} style={{ padding: "6px 14px", background: "white", border: "1.5px solid #dc2626", borderRadius: "8px", fontSize: "13px", fontWeight: 600, color: "#dc2626", cursor: "pointer", fontFamily: "inherit" }}>
                Supprimer
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ═══ Modal formulaire ═══ */}
      {showForm && (
        <>
          <div onClick={closeForm} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100 }} />
          <div style={{
            position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            background: "white", borderRadius: "16px", padding: "32px", width: "680px", maxWidth: "95vw",
            maxHeight: "90vh", overflowY: "auto", zIndex: 101, boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--anthracite)", marginBottom: "24px" }}>
              {editing ? "Modifier l'objectif" : "Nouvel objectif"}
            </h2>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {/* Emoji + Nom */}
              <div style={{ display: "grid", gridTemplateColumns: "80px 1fr", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Emoji</label>
                  <input type="text" value={formEmoji} onChange={(e) => setFormEmoji(e.target.value)} style={{ ...inputStyle, fontSize: "28px", textAlign: "center", padding: "6px" }} maxLength={4} />
                </div>
                <div>
                  <label style={labelStyle}>Nom *</label>
                  <input type="text" value={formNom} onChange={(e) => setFormNom(e.target.value)} placeholder="Ex: Je crée un cadre sécurisant et bienveillant" style={inputStyle} />
                </div>
              </div>

              {/* Mot-clé + Ordre */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 100px", gap: "12px" }}>
                <div>
                  <label style={labelStyle}>Mot-clé</label>
                  <input type="text" value={formMotCle} onChange={(e) => setFormMotCle(e.target.value)} placeholder="Ex: Cadrage" style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Ordre</label>
                  <input type="number" value={formOrdre} onChange={(e) => setFormOrdre(parseInt(e.target.value) || 1)} style={inputStyle} />
                </div>
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={formDescription} onChange={(e) => setFormDescription(e.target.value)} placeholder="Description affichée quand l'objectif est sélectionné…" style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} />
              </div>

              {/* Fiches associées */}
              <div>
                <label style={labelStyle}>Fiches associées ({selectedFicheIds.length})</label>
                <input
                  type="text"
                  value={ficheSearch}
                  onChange={(e) => setFicheSearch(e.target.value)}
                  placeholder="Rechercher une fiche…"
                  style={{ ...inputStyle, marginBottom: "8px" }}
                />
                <div style={{
                  maxHeight: "240px", overflowY: "auto", border: "2px solid var(--line)",
                  borderRadius: "10px", padding: "4px",
                }}>
                  {filteredFiches.map((f) => {
                    const selected = selectedFicheIds.includes(f.id);
                    return (
                      <button
                        key={f.id}
                        onClick={() => toggleFiche(f.id)}
                        style={{
                          display: "flex", alignItems: "center", gap: "10px", width: "100%",
                          padding: "8px 10px", background: selected ? "#e0f7f7" : "transparent",
                          border: "none", borderRadius: "8px", cursor: "pointer", fontFamily: "inherit",
                          textAlign: "left", fontSize: "13px", color: "var(--anthracite)", transition: "background 0.1s",
                        }}
                      >
                        <span style={{
                          width: "18px", height: "18px", borderRadius: "4px", flexShrink: 0,
                          border: selected ? "none" : "2px solid var(--line-strong)",
                          background: selected ? "var(--canard)" : "white",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          color: "white", fontSize: "11px", fontWeight: 700,
                        }}>
                          {selected ? "✓" : ""}
                        </span>
                        <span>{(f as any).emoji || ""}</span>
                        <span style={{ fontWeight: 600, flexGrow: 1 }}>{f.nom}</span>
                        {!f.publie && (
                          <span style={{ fontSize: "10px", color: "var(--muted)", fontStyle: "italic" }}>brouillon</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {error && (
                <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "10px", padding: "10px 14px", fontSize: "13px", color: "#dc2626" }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", paddingTop: "8px" }}>
                <button onClick={handleSave} disabled={saving} style={{
                  padding: "10px 24px", background: saving ? "var(--muted)" : "var(--canard)", color: "white",
                  border: "none", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: saving ? "wait" : "pointer", fontFamily: "inherit",
                }}>
                  {saving ? "Enregistrement…" : "Enregistrer"}
                </button>
                <button onClick={closeForm} style={{
                  padding: "10px 24px", background: "white", color: "var(--anthracite)",
                  border: "2px solid var(--line-strong)", borderRadius: "10px", fontSize: "14px", fontWeight: 700, cursor: "pointer", fontFamily: "inherit",
                }}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

const labelStyle: React.CSSProperties = {
  display: "block", fontSize: "13px", fontWeight: 700, color: "var(--anthracite)", marginBottom: "6px",
};

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "2px solid var(--line-strong)", borderRadius: "10px",
  fontSize: "14px", fontFamily: "inherit", color: "var(--anthracite)", outline: "none",
  boxSizing: "border-box", background: "white",
};
