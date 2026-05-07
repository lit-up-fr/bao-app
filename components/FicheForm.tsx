"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, type Cle, type Etape, slugify } from "@/lib/supabase";

/* ═══════════════════════════════════════════
   TYPES pour les champs structurés
   ═══════════════════════════════════════════ */

interface ObjectifItem { titre: string; detail: string }
interface DerouleStep { titre: string; duree: string; actions: string[] }

/* ═══════════════════════════════════════════
   COMPOSANT PRINCIPAL
   ═══════════════════════════════════════════ */

interface FicheFormProps { ficheId?: string }

export default function FicheForm({ ficheId }: FicheFormProps) {
  const router = useRouter();
  const isEdit = !!ficheId;

  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [allCles, setAllCles] = useState<Cle[]>([]);
  const [selectedCles, setSelectedCles] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Champs simples
  const [nom, setNom] = useState("");
  const [etapeId, setEtapeId] = useState("");
  const [dureeMin, setDureeMin] = useState("");
  const [dureeMax, setDureeMax] = useState("");
  const [dureeLibre, setDureeLibre] = useState("");
  const [format, setFormat] = useState("");
  const [participants, setParticipants] = useState("");
  const [materiel, setMateriel] = useState("");
  const [pourQui, setPourQui] = useState("");
  const [publicProPair, setPublicProPair] = useState("");
  const [typeOutil, setTypeOutil] = useState("");
  const [intention, setIntention] = useState("");
  const [pourquoi, setPourquoi] = useState("");
  const [source, setSource] = useState("");
  const [publie, setPublie] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");

  // Champs structurés (visuels)
  const [objectifs, setObjectifs] = useState<ObjectifItem[]>([]);
  const [materielListe, setMaterielListe] = useState<string[]>([]);
  const [deroule, setDeroule] = useState<DerouleStep[]>([]);
  const [conseils, setConseils] = useState<string[]>([]);
  const [variantes, setVariantes] = useState<string[]>([]);

  useEffect(() => {
    async function loadData() {
      const [{ data: etapesData }, { data: clesData }] = await Promise.all([
        supabase.from("etapes_parcours").select("*").order("ordre"),
        supabase.from("cles").select("*").order("ordre"),
      ]);
      setEtapes(etapesData || []);
      setAllCles(clesData || []);

      if (ficheId) {
        const { data: fiche } = await supabase.from("fiches").select("*").eq("id", ficheId).single();
        if (fiche) {
          setNom(fiche.nom || "");
          setEtapeId(fiche.etape_id || "");
          setDureeMin(fiche.duree_min?.toString() || "");
          setDureeMax(fiche.duree_max?.toString() || "");
          setDureeLibre(fiche.duree_libre || "");
          setFormat(fiche.format || "");
          setParticipants(fiche.participants || "");
          setMateriel(fiche.materiel || "");
          setPourQui(fiche.pour_qui || "");
          setPublicProPair(fiche.public_pro_pair || "");
          setTypeOutil(fiche.type_outil || "");
          setIntention(fiche.intention || "");
          setPourquoi(fiche.pourquoi || "");
          setSource(fiche.source || "");
          setPublie(fiche.publie || false);
          setPdfUrl(fiche.pdf_url || "");

          setObjectifs(parseObjectifs(fiche.objectifs));
          setMaterielListe(parseStringList(fiche.materiel_liste));
          setDeroule(parseDeroule(fiche.deroule));
          setConseils(parseStringList(fiche.conseils));
          setVariantes(parseStringList(fiche.variantes));
        }

        const { data: ficheCles } = await supabase.from("fiches_cles").select("cle_id").eq("fiche_id", ficheId);
        if (ficheCles) setSelectedCles(ficheCles.map((fc: any) => fc.cle_id));
      }
    }
    loadData();
  }, [ficheId]);

  /* ── Parsers : JSON Supabase → état visuel ── */

  function parseObjectifs(val: any): ObjectifItem[] {
    const arr = parseAny(val);
    if (!Array.isArray(arr)) return [];
    return arr.map((item: any) => {
      if (typeof item === "string") return { titre: item, detail: "" };
      return { titre: item.titre || item.title || item.objectif || "", detail: item.détail || item.detail || item.description || "" };
    });
  }

  function parseStringList(val: any): string[] {
    const arr = parseAny(val);
    if (!Array.isArray(arr)) return [];
    return arr.map((item: any) => {
      if (typeof item === "string") return item;
      return item.item || item.titre || item.conseil || item.variante || item.text || Object.values(item).join(" – ");
    });
  }

  function parseDeroule(val: any): DerouleStep[] {
    const arr = parseAny(val);
    if (!Array.isArray(arr)) return [];
    return arr.map((step: any) => ({
      titre: step.titre || step.title || "",
      duree: step.durée || step.duree || "",
      actions: Array.isArray(step.actions) ? step.actions : [],
    }));
  }

  function parseAny(val: any): any {
    if (!val) return null;
    if (typeof val === "object") return val;
    try { return JSON.parse(val); } catch { return null; }
  }

  /* ── Serializers : état visuel → JSON Supabase ── */

  function serializeObjectifs(): any {
    const filtered = objectifs.filter((o) => o.titre.trim());
    if (filtered.length === 0) return null;
    return filtered.map((o) => o.detail.trim() ? { titre: o.titre, détail: o.detail } : o.titre);
  }

  function serializeStringList(list: string[]): any {
    const filtered = list.filter((s) => s.trim());
    return filtered.length > 0 ? filtered : null;
  }

  function serializeDeroule(): any {
    const filtered = deroule.filter((s) => s.titre.trim());
    if (filtered.length === 0) return null;
    return filtered.map((s, i) => ({
      étape: i + 1,
      titre: s.titre,
      durée: s.duree || undefined,
      actions: s.actions.filter((a) => a.trim()),
    }));
  }

  /* ── Handlers ── */

  function toggleCle(cleId: string) {
    setSelectedCles((prev) => prev.includes(cleId) ? prev.filter((id) => id !== cleId) : [...prev, cleId]);
  }

  async function handlePdfUpload(file: File) {
    setUploading(true);
    setError("");
    const slug = slugify(nom || "fiche");
    const fileName = `${slug}.pdf`;
    const { error: uploadError } = await supabase.storage.from("fiches-pdf").upload(fileName, file, { upsert: true });
    if (uploadError) { setError("Erreur upload PDF : " + uploadError.message); setUploading(false); return; }
    setPdfUrl(`/pdfs/${fileName}`);
    setUploading(false);
    setSuccess("PDF uploadé.");
    setTimeout(() => setSuccess(""), 3000);
  }

  async function handleSubmit() {
    if (!nom.trim()) { setError("Le nom est obligatoire."); return; }
    setSaving(true);
    setError("");

    const ficheData = {
      nom: nom.trim(), slug: slugify(nom),
      etape_id: etapeId || null,
      duree_min: dureeMin ? parseInt(dureeMin) : null,
      duree_max: dureeMax ? parseInt(dureeMax) : null,
      duree_libre: dureeLibre || null,
      format: format || null, participants: participants || null,
      materiel: materiel || null, pour_qui: pourQui || null,
      public_pro_pair: publicProPair || null, type_outil: typeOutil || null,
      intention: intention || null, pourquoi: pourquoi || null,
      objectifs: serializeObjectifs(),
      materiel_liste: serializeStringList(materielListe),
      deroule: serializeDeroule(),
      conseils: serializeStringList(conseils),
      variantes: serializeStringList(variantes),
      source: source || null, publie, pdf_url: pdfUrl || null,
    };

    let savedId = ficheId;
    if (isEdit) {
      const { error } = await supabase.from("fiches").update(ficheData).eq("id", ficheId);
      if (error) { setError("Erreur : " + error.message); setSaving(false); return; }
    } else {
      const { data, error } = await supabase.from("fiches").insert(ficheData).select("id").single();
      if (error) { setError("Erreur : " + error.message); setSaving(false); return; }
      savedId = data.id;
    }

    if (savedId) {
      await supabase.from("fiches_cles").delete().eq("fiche_id", savedId);
      if (selectedCles.length > 0) {
        await supabase.from("fiches_cles").insert(
          selectedCles.map((cleId, i) => ({ fiche_id: savedId, cle_id: cleId, ordre: i + 1 }))
        );
      }
    }

    setSaving(false);
    router.push("/admin/fiches");
  }

  /* ═══════════════════════════════════════════
     RENDU
     ═══════════════════════════════════════════ */

  return (
    <div style={{ maxWidth: "800px" }}>
      <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", marginBottom: "28px" }}>
        {isEdit ? "Modifier la fiche" : "Nouvelle fiche"}
      </h1>

      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* ═══ Informations principales ═══ */}
        <SectionTitle text="Informations principales" />

        <Field label="Nom de la fiche *">
          <input type="text" value={nom} onChange={(e) => setNom(e.target.value)} placeholder="Ex: Brise-glace Antisava" style={inputStyle} />
        </Field>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Field label="Étape du parcours">
            <select value={etapeId} onChange={(e) => setEtapeId(e.target.value)} style={inputStyle}>
              <option value="">— Aucune —</option>
              {etapes.map((e) => <option key={e.id} value={e.id}>{e.code} · {e.nom}</option>)}
            </select>
          </Field>
          <Field label="Public visé">
            <select value={publicProPair} onChange={(e) => setPublicProPair(e.target.value)} style={inputStyle}>
              <option value="">— Non spécifié —</option>
              <option value="PRO">PRO</option>
              <option value="PAIR">PAIR</option>
              <option value="PRO · PAIR">PRO · PAIR</option>
            </select>
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
          <Field label="Durée min (min)">
            <input type="number" value={dureeMin} onChange={(e) => setDureeMin(e.target.value)} placeholder="30" style={inputStyle} />
          </Field>
          <Field label="Durée max (min)">
            <input type="number" value={dureeMax} onChange={(e) => setDureeMax(e.target.value)} placeholder="60" style={inputStyle} />
          </Field>
          <Field label="Durée libre">
            <input type="text" value={dureeLibre} onChange={(e) => setDureeLibre(e.target.value)} placeholder="Ex: 1h30 à 2h" style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Field label="Format">
            <input type="text" value={format} onChange={(e) => setFormat(e.target.value)} placeholder="Ex: Collectif" style={inputStyle} />
          </Field>
          <Field label="Participants">
            <input type="text" value={participants} onChange={(e) => setParticipants(e.target.value)} placeholder="Ex: 8 à 15" style={inputStyle} />
          </Field>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
          <Field label="Matériel (résumé)">
            <input type="text" value={materiel} onChange={(e) => setMateriel(e.target.value)} placeholder="Ex: Matériel de base" style={inputStyle} />
          </Field>
          <Field label="Source">
            <input type="text" value={source} onChange={(e) => setSource(e.target.value)} placeholder="Ex: Inspiré de…" style={inputStyle} />
          </Field>
        </div>

        {/* ═══ Contenu pédagogique ═══ */}
        <SectionTitle text="Contenu pédagogique" />

        <Field label="Intention">
          <textarea value={intention} onChange={(e) => setIntention(e.target.value)} rows={2} placeholder="La phrase d'accroche…" style={{ ...inputStyle, resize: "vertical" }} />
        </Field>

        <Field label="Pourquoi cet outil fonctionne">
          <textarea value={pourquoi} onChange={(e) => setPourquoi(e.target.value)} rows={3} placeholder="Explication pédagogique…" style={{ ...inputStyle, resize: "vertical" }} />
        </Field>

        {/* ═══ Objectifs (visuel) ═══ */}
        <SectionTitle text="Objectifs pédagogiques" />
        {objectifs.map((obj, i) => (
          <div key={i} style={{ background: "white", border: "2px solid var(--line)", borderRadius: "12px", padding: "14px", position: "relative" }}>
            <button onClick={() => setObjectifs(objectifs.filter((_, j) => j !== i))} style={removeBtn} title="Supprimer">✕</button>
            <Field label={`Objectif ${i + 1}`}>
              <input type="text" value={obj.titre} onChange={(e) => { const copy = [...objectifs]; copy[i].titre = e.target.value; setObjectifs(copy); }} placeholder="Titre de l'objectif" style={inputStyle} />
            </Field>
            <div style={{ marginTop: "8px" }}>
              <Field label="Détail (optionnel)">
                <input type="text" value={obj.detail} onChange={(e) => { const copy = [...objectifs]; copy[i].detail = e.target.value; setObjectifs(copy); }} placeholder="Précision supplémentaire…" style={inputStyle} />
              </Field>
            </div>
          </div>
        ))}
        <button onClick={() => setObjectifs([...objectifs, { titre: "", detail: "" }])} style={addBtn}>+ Ajouter un objectif</button>

        {/* ═══ Matériel liste (visuel) ═══ */}
        <SectionTitle text="Liste matériel détaillée" />
        <SimpleList items={materielListe} onChange={setMaterielListe} placeholder="Ex: Post-its de couleur" itemLabel="matériel" />

        {/* ═══ Déroulé (visuel) ═══ */}
        <SectionTitle text="Déroulé" />
        {deroule.map((step, i) => (
          <div key={i} style={{ background: "white", border: "2px solid var(--line)", borderRadius: "12px", padding: "16px", position: "relative" }}>
            <button onClick={() => setDeroule(deroule.filter((_, j) => j !== i))} style={removeBtn} title="Supprimer">✕</button>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
              <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "var(--canard)", color: "white", fontWeight: 800, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{i + 1}</span>
              <input type="text" value={step.titre} onChange={(e) => { const copy = [...deroule]; copy[i].titre = e.target.value; setDeroule(copy); }} placeholder="Titre de l'étape" style={{ ...inputStyle, fontWeight: 700 }} />
              <input type="text" value={step.duree} onChange={(e) => { const copy = [...deroule]; copy[i].duree = e.target.value; setDeroule(copy); }} placeholder="Durée" style={{ ...inputStyle, maxWidth: "120px" }} />
            </div>
            {/* Actions */}
            <div style={{ paddingLeft: "38px" }}>
              <div style={{ fontSize: "12px", fontWeight: 700, color: "var(--muted)", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.04em" }}>Actions</div>
              {step.actions.map((action, j) => (
                <div key={j} style={{ display: "flex", gap: "8px", marginBottom: "6px" }}>
                  <input type="text" value={action} onChange={(e) => { const copy = [...deroule]; copy[i].actions[j] = e.target.value; setDeroule(copy); }} placeholder={`Action ${j + 1}`} style={{ ...inputStyle, fontSize: "13px" }} />
                  <button onClick={() => { const copy = [...deroule]; copy[i].actions = copy[i].actions.filter((_, k) => k !== j); setDeroule(copy); }} style={{ ...removeBtn, position: "relative", top: 0, right: 0, width: "32px", height: "32px", fontSize: "14px" }}>✕</button>
                </div>
              ))}
              <button onClick={() => { const copy = [...deroule]; copy[i].actions = [...copy[i].actions, ""]; setDeroule(copy); }} style={{ ...addBtn, fontSize: "12px", padding: "4px 12px" }}>+ Action</button>
            </div>
          </div>
        ))}
        <button onClick={() => setDeroule([...deroule, { titre: "", duree: "", actions: [""] }])} style={addBtn}>+ Ajouter une étape</button>

        {/* ═══ Conseils (visuel) ═══ */}
        <SectionTitle text="Conseils pour bien animer" />
        <SimpleList items={conseils} onChange={setConseils} placeholder="Ex: Rester attentif aux dynamiques…" itemLabel="conseil" />

        {/* ═══ Variantes (visuel) ═══ */}
        <SectionTitle text="Variantes possibles" />
        <SimpleList items={variantes} onChange={setVariantes} placeholder="Ex: Version courte (30 min)…" itemLabel="variante" />

        {/* ═══ Clés d'engagement ═══ */}
        <SectionTitle text="Clés d'engagement" />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
          {allCles.map((cle) => {
            const active = selectedCles.includes(cle.id);
            return (
              <button key={cle.id} type="button" onClick={() => toggleCle(cle.id)} style={{
                padding: "6px 14px", borderRadius: "14px", fontSize: "13px", fontWeight: 600,
                border: `2px solid ${active ? (cle.couleur_hex || "var(--canard)") : "var(--line)"}`,
                background: active ? (cle.couleur_hex || "var(--canard)") : "white",
                color: active ? "white" : "var(--anthracite)",
                cursor: "pointer", fontFamily: "inherit", transition: "all 0.15s",
              }}>
                {cle.nom.split(" (")[0]}
              </button>
            );
          })}
        </div>

        {/* ═══ PDF ═══ */}
        <SectionTitle text="Fiche PDF" />
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <label style={{ padding: "10px 20px", background: "white", border: "2px dashed var(--line-strong)", borderRadius: "12px", fontSize: "14px", fontWeight: 600, color: "var(--anthracite)", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "8px" }}>
            {uploading ? "Upload en cours…" : "↑ Choisir un PDF"}
            <input type="file" accept=".pdf" style={{ display: "none" }} onChange={(e) => { const file = e.target.files?.[0]; if (file) handlePdfUpload(file); }} />
          </label>
          {pdfUrl && <span style={{ fontSize: "13px", color: "var(--canard)", fontWeight: 600 }}>✓ {pdfUrl.split("/").pop()}</span>}
        </div>

        {/* ═══ Publication ═══ */}
        <SectionTitle text="Publication" />
        <label style={{ display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" }}>
          <div onClick={() => setPublie(!publie)} style={{ width: "44px", height: "24px", borderRadius: "12px", background: publie ? "var(--canard)" : "var(--line-strong)", position: "relative", transition: "background 0.2s", cursor: "pointer" }}>
            <div style={{ width: "20px", height: "20px", borderRadius: "50%", background: "white", position: "absolute", top: "2px", left: publie ? "22px" : "2px", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
          </div>
          <span style={{ fontSize: "14px", fontWeight: 600, color: publie ? "var(--canard-dark)" : "var(--muted)" }}>
            {publie ? "Publié (visible sur le site)" : "Brouillon (non visible)"}
          </span>
        </label>

        {/* ═══ Messages ═══ */}
        {error && <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", color: "#dc2626" }}>{error}</div>}
        {success && <div style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: "12px", padding: "12px 16px", fontSize: "14px", color: "#16a34a" }}>{success}</div>}

        {/* ═══ Actions ═══ */}
        <div style={{ display: "flex", gap: "12px", paddingTop: "16px", borderTop: "2px solid var(--line)" }}>
          <button onClick={handleSubmit} disabled={saving} style={{ padding: "12px 28px", background: saving ? "var(--muted)" : "var(--canard)", color: "white", border: "none", borderRadius: "12px", fontSize: "15px", fontWeight: 700, fontFamily: "inherit", cursor: saving ? "wait" : "pointer" }}>
            {saving ? "Enregistrement…" : isEdit ? "Enregistrer" : "Créer la fiche"}
          </button>
          <button onClick={() => router.push("/admin/fiches")} style={{ padding: "12px 28px", background: "white", color: "var(--anthracite)", border: "2px solid var(--line-strong)", borderRadius: "12px", fontSize: "15px", fontWeight: 700, fontFamily: "inherit", cursor: "pointer" }}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════
   SOUS-COMPOSANTS
   ═══════════════════════════════════════════ */

function SimpleList({ items, onChange, placeholder, itemLabel }: { items: string[]; onChange: (items: string[]) => void; placeholder: string; itemLabel: string }) {
  return (
    <>
      {items.map((item, i) => (
        <div key={i} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span style={{ color: "var(--canard)", fontWeight: 700, flexShrink: 0, fontSize: "14px" }}>•</span>
          <input type="text" value={item} onChange={(e) => { const copy = [...items]; copy[i] = e.target.value; onChange(copy); }} placeholder={placeholder} style={inputStyle} />
          <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ ...removeBtn, position: "relative", top: 0, right: 0, width: "32px", height: "32px", fontSize: "14px" }}>✕</button>
        </div>
      ))}
      <button onClick={() => onChange([...items, ""])} style={addBtn}>+ Ajouter un {itemLabel}</button>
    </>
  );
}

function SectionTitle({ text }: { text: string }) {
  return <div style={{ fontSize: "18px", fontWeight: 800, color: "var(--anthracite)", marginTop: "8px", paddingTop: "16px", borderTop: "2px solid var(--line)" }}>{text}</div>;
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: "13px", fontWeight: 700, color: "var(--anthracite)", marginBottom: "6px" }}>{label}</label>
      {children}
    </div>
  );
}

/* ═══ Styles partagés ═══ */

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "10px 14px", border: "2px solid var(--line-strong)", borderRadius: "10px",
  fontSize: "14px", fontFamily: "inherit", color: "var(--anthracite)", outline: "none",
  boxSizing: "border-box", transition: "border-color 0.2s", background: "white",
};

const addBtn: React.CSSProperties = {
  padding: "8px 16px", background: "white", border: "2px dashed var(--line-strong)", borderRadius: "10px",
  fontSize: "13px", fontWeight: 600, color: "var(--canard)", cursor: "pointer", fontFamily: "inherit",
  transition: "all 0.15s", alignSelf: "flex-start",
};

const removeBtn: React.CSSProperties = {
  position: "absolute", top: "10px", right: "10px", width: "28px", height: "28px", borderRadius: "50%",
  background: "var(--blanc)", border: "1px solid var(--line)", fontSize: "12px", color: "var(--muted)",
  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "inherit",
  flexShrink: 0,
};
