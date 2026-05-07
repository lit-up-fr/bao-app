"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, type Fiche, type Etape } from "@/lib/supabase";

interface FicheRow extends Fiche {
  etapes_parcours: Etape | null;
}

export default function AdminFichesPage() {
  const [fiches, setFiches] = useState<FicheRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadFiches();
  }, []);

  async function loadFiches() {
    const { data, error } = await supabase
      .from("fiches")
      .select("*, etapes_parcours(*)")
      .order("nom");
    if (error) {
      console.error("Erreur:", error.message);
      return;
    }
    setFiches(data || []);
    setLoading(false);
  }

  async function togglePublie(fiche: FicheRow) {
    const { error } = await supabase
      .from("fiches")
      .update({ publie: !fiche.publie })
      .eq("id", fiche.id);
    if (!error) {
      setFiches((prev) =>
        prev.map((f) => (f.id === fiche.id ? { ...f, publie: !f.publie } : f))
      );
    }
  }

  async function deleteFiche(fiche: FicheRow) {
    if (!confirm(`Supprimer "${fiche.nom}" ? Cette action est irréversible.`)) return;
    // Delete associations first
    await supabase.from("fiches_cles").delete().eq("fiche_id", fiche.id);
    await supabase.from("parcours_fiches").delete().eq("fiche_id", fiche.id);
    const { error } = await supabase.from("fiches").delete().eq("id", fiche.id);
    if (!error) {
      setFiches((prev) => prev.filter((f) => f.id !== fiche.id));
    }
  }

  const filtered = fiches.filter((f) => {
    const q = search.toLowerCase();
    return !q || f.nom.toLowerCase().includes(q) || (f.intention || "").toLowerCase().includes(q);
  });

  const published = filtered.filter((f) => f.publie);
  const drafts = filtered.filter((f) => !f.publie);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "28px", flexWrap: "wrap", gap: "12px" }}>
        <div>
          <h1 style={{ fontSize: "30px", fontWeight: 800, color: "var(--anthracite)", letterSpacing: "-0.02em" }}>Fiches</h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "4px" }}>
            {fiches.length} fiche{fiches.length !== 1 ? "s" : ""} au total · {published.length} publiée{published.length !== 1 ? "s" : ""} · {drafts.length} brouillon{drafts.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/fiches/new" style={{
          padding: "10px 20px", background: "var(--canard)", color: "white", borderRadius: "12px",
          fontSize: "14px", fontWeight: 700, textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "6px",
        }}>
          + Nouvelle fiche
        </Link>
      </div>

      {/* Search */}
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Rechercher une fiche…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%", maxWidth: "400px", padding: "10px 16px", border: "2px solid var(--line-strong)",
            borderRadius: "12px", fontSize: "14px", fontFamily: "inherit", color: "var(--anthracite)", outline: "none",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "var(--canard)"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line-strong)"; }}
        />
      </div>

      {loading ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)" }}>Chargement…</div>
      ) : filtered.length === 0 ? (
        <div style={{ padding: "60px", textAlign: "center", color: "var(--muted)", background: "white", borderRadius: "16px", border: "2px dashed var(--line)" }}>
          Aucune fiche trouvée.
        </div>
      ) : (
        <div style={{ background: "white", borderRadius: "16px", border: "2px solid var(--line)", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--line)", textAlign: "left" }}>
                <th style={thStyle}>Nom</th>
                <th style={{ ...thStyle, width: "140px" }}>Étape</th>
                <th style={{ ...thStyle, width: "100px" }}>Statut</th>
                <th style={{ ...thStyle, width: "80px" }}>PDF</th>
                <th style={{ ...thStyle, width: "160px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((fiche) => (
                <tr key={fiche.id} style={{ borderBottom: "1px solid var(--line)" }}>
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 600, color: "var(--anthracite)" }}>{fiche.nom}</div>
                    {fiche.intention && (
                      <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "400px" }}>
                        {fiche.intention}
                      </div>
                    )}
                  </td>
                  <td style={tdStyle}>
                    {fiche.etapes_parcours ? (
                      <span style={{
                        fontSize: "11px", fontWeight: 700, padding: "3px 8px", borderRadius: "8px",
                        background: fiche.etapes_parcours.couleur_hex ? `${fiche.etapes_parcours.couleur_hex}20` : "var(--blanc)",
                        color: fiche.etapes_parcours.couleur_hex || "var(--muted)",
                      }}>
                        {fiche.etapes_parcours.code}
                      </span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td style={tdStyle}>
                    <button
                      onClick={() => togglePublie(fiche)}
                      style={{
                        fontSize: "11px", fontWeight: 700, padding: "4px 10px", borderRadius: "10px",
                        border: "none", cursor: "pointer", fontFamily: "inherit",
                        background: fiche.publie ? "rgba(0,152,157,0.12)" : "rgba(43,52,66,0.06)",
                        color: fiche.publie ? "var(--canard-dark)" : "var(--muted)",
                      }}
                    >
                      {fiche.publie ? "✓ Publié" : "Brouillon"}
                    </button>
                  </td>
                  <td style={tdStyle}>
                    {fiche.pdf_url ? (
                      <span style={{ fontSize: "11px", color: "var(--canard)", fontWeight: 600 }}>✓</span>
                    ) : (
                      <span style={{ fontSize: "12px", color: "var(--muted)" }}>—</span>
                    )}
                  </td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                      <Link href={`/admin/fiches/${fiche.id}/edit`} style={{
                        fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "8px",
                        background: "var(--blanc)", color: "var(--anthracite)", textDecoration: "none",
                        border: "1px solid var(--line)",
                      }}>
                        Modifier
                      </Link>
                      <button onClick={() => deleteFiche(fiche)} style={{
                        fontSize: "12px", fontWeight: 600, padding: "5px 12px", borderRadius: "8px",
                        background: "transparent", color: "#dc2626", border: "1px solid #fecaca",
                        cursor: "pointer", fontFamily: "inherit",
                      }}>
                        Suppr.
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  verticalAlign: "middle",
};
