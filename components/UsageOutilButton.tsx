"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { pushImpactEvent } from "@/lib/impactSync";

// Bouton « J'ai utilisé cet outil avec X jeunes » : remonte un usage réel
// (outil + nb de jeunes) vers Airtable via la même synchro que l'inscription.
// Réservé aux utilisateurs connectés.
export default function UsageOutilButton({
  ficheNom,
  ficheSlug,
  userId,
}: {
  ficheNom: string;
  ficheSlug?: string;
  userId: string | null;
}) {
  const [open, setOpen] = useState(false);
  const [nb, setNb] = useState("");
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  if (!userId) return null;

  async function submit() {
    const n = parseInt(nb, 10);
    if (isNaN(n) || n < 0) return;
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const email = user?.email;
      if (!email) return;
      await pushImpactEvent({
        event: "usage_outil",
        email,
        fiche_nom: ficheNom,
        fiche_slug: ficheSlug,
        nb_jeunes: n,
      });
      setDone(true);
      setOpen(false);
    } catch (e) {
      console.error("usage outil:", e);
    } finally {
      setSaving(false);
    }
  }

  if (done) {
    return (
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "6px",
          padding: "11px 18px",
          borderRadius: "24px",
          background: "#f0fdfa",
          color: "#0f766e",
          fontSize: "13px",
          fontWeight: 700,
        }}
      >
        ✓ Merci, c&apos;est noté !
      </span>
    );
  }

  if (!open) {
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        style={{
          padding: "11px 20px",
          border: "2px solid var(--canard, #00989D)",
          background: "white",
          color: "var(--canard, #00989D)",
          fontFamily: "inherit",
          fontSize: "13px",
          fontWeight: 700,
          cursor: "pointer",
          borderRadius: "24px",
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          letterSpacing: "0.02em",
        }}
      >
        ✓ J&apos;ai utilisé cet outil
      </button>
    );
  }

  return (
    <div
      onClick={(e) => e.stopPropagation()}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        flexWrap: "wrap",
        padding: "10px 14px",
        border: "2px solid #99f6e4",
        background: "#f0fdfa",
        borderRadius: "16px",
      }}
    >
      <span style={{ fontSize: "13px", fontWeight: 600, color: "#0f766e" }}>
        Avec combien de jeunes ?
      </span>
      <input
        type="number"
        min={0}
        autoFocus
        value={nb}
        onChange={(e) => setNb(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        placeholder="ex. 12"
        style={{
          width: "90px",
          padding: "8px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          fontFamily: "inherit",
        }}
      />
      <button
        onClick={submit}
        disabled={saving || nb === ""}
        style={{
          padding: "8px 16px",
          border: "none",
          background: saving || nb === "" ? "#9ca3af" : "var(--canard, #00989D)",
          color: "white",
          borderRadius: "8px",
          fontSize: "13px",
          fontWeight: 700,
          cursor: saving || nb === "" ? "not-allowed" : "pointer",
          fontFamily: "inherit",
        }}
      >
        {saving ? "..." : "Enregistrer"}
      </button>
      <button
        onClick={() => setOpen(false)}
        style={{
          padding: "8px 12px",
          border: "none",
          background: "transparent",
          color: "#6b7280",
          fontSize: "13px",
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: "inherit",
        }}
      >
        Annuler
      </button>
    </div>
  );
}
