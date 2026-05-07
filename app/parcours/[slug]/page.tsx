"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getParcours,
  getFichesByParcours,
  getClesByFiche,
  getEtapeById,
  slugify,
  formatDuree,
  type Parcours,
  type Fiche,
  type Cle,
  type Etape,
} from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

interface FicheWithMeta extends Fiche {
  fichesCles: Cle[];
  etape: Etape | null;
}

export default function ParcoursDetailPage({ params }: { params: { slug: string } }) {
  const [parcours, setParcours] = useState<Parcours | null>(null);
  const [fiches, setFiches] = useState<FicheWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      const all = await getParcours();
      const match = all.find((p) => slugify(p.titre) === params.slug);
      if (match) {
        setParcours(match);
        const fichesData = await getFichesByParcours(match.id);
        const fichesWithMeta = await Promise.all(
          fichesData.map(async (f) => {
            const [cles, etape] = await Promise.all([
              getClesByFiche(f.id),
              f.etape_id ? getEtapeById(f.etape_id) : Promise.resolve(null),
            ]);
            return { ...f, fichesCles: cles, etape };
          })
        );
        setFiches(fichesWithMeta);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--blanc)" }}>
        <AppHeader searchQuery="" onSearchChange={() => {}} />
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 28px", textAlign: "center", color: "var(--muted)" }}>
          Chargement…
        </div>
      </div>
    );
  }

  if (!parcours) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--blanc)" }}>
        <AppHeader searchQuery="" onSearchChange={() => {}} />
        <div style={{ maxWidth: "800px", margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", marginBottom: "12px" }}>Parcours introuvable</h1>
          <Link href="/parcours" style={{ color: "var(--canard)", textDecoration: "none", fontWeight: 600 }}>
            ← Retour aux parcours
          </Link>
        </div>
      </div>
    );
  }

  const color = parcours.couleur_hex || "var(--canard)";

  return (
    <div style={{ minHeight: "100vh", background: "var(--blanc)" }}>
      <AppHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      {/* Hero banner */}
      <div style={{ background: color, padding: "40px 28px", color: "white" }}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <Link href="/parcours" style={{ color: "rgba(255,255,255,0.7)", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}>
            ← Retour aux parcours
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "20px" }}>
            <span style={{ fontSize: "48px" }}>{parcours.emoji || "📋"}</span>
            <div>
              <h1 style={{ fontSize: "32px", fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>
                {parcours.titre}
              </h1>
              {parcours.description && (
                <p style={{ fontSize: "16px", opacity: 0.85, marginTop: "8px", lineHeight: 1.5 }}>
                  {parcours.description}
                </p>
              )}
            </div>
          </div>
          <div style={{ marginTop: "16px", fontSize: "14px", fontWeight: 600, opacity: 0.7 }}>
            {fiches.length} outil{fiches.length !== 1 ? "s" : ""} dans ce parcours
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div style={{ maxWidth: "800px", margin: "0 auto", padding: "40px 28px 80px" }}>
        {fiches.length === 0 ? (
          <p style={{ textAlign: "center", padding: "48px", color: "var(--muted)" }}>Aucune fiche associée.</p>
        ) : (
          <div>
            {fiches.map((fiche, i) => {
              const duree = formatDuree(fiche);
              const stepColor = fiche.etape?.couleur_hex || color;

              return (
                <div key={fiche.id} style={{ display: "flex", gap: "20px" }}>
                  {/* Timeline */}
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flexShrink: 0 }}>
                    <div style={{
                      width: "40px", height: "40px", borderRadius: "50%",
                      background: color, color: "white",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "15px", fontWeight: 800,
                      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                    }}>
                      {i + 1}
                    </div>
                    {i < fiches.length - 1 && (
                      <div style={{ width: "3px", flexGrow: 1, background: `${color}25`, margin: "4px 0" }} />
                    )}
                  </div>

                  {/* Card */}
                  <Link
                    href={`/bao/${fiche.slug}`}
                    style={{
                      flex: 1,
                      background: "white",
                      border: "2px solid var(--line)",
                      borderRadius: "16px",
                      padding: "22px",
                      marginBottom: "16px",
                      textDecoration: "none",
                      color: "inherit",
                      transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                      position: "relative",
                      overflow: "hidden",
                      display: "block",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "translateY(-2px)";
                      e.currentTarget.style.boxShadow = "0 6px 20px rgba(43,52,66,0.08)";
                      e.currentTarget.style.borderColor = color;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "translateY(0)";
                      e.currentTarget.style.boxShadow = "none";
                      e.currentTarget.style.borderColor = "var(--line)";
                    }}
                  >
                    {/* Top bar */}
                    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "4px", background: stepColor }} />

                    {/* Step badge */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                      {fiche.etape && (
                        <span style={{
                          fontSize: "11px", fontWeight: 800, letterSpacing: "0.04em",
                          padding: "3px 10px", borderRadius: "10px",
                          color: "white", textTransform: "uppercase",
                          background: stepColor,
                        }}>
                          {fiche.etape.code} · {fiche.etape.nom}
                        </span>
                      )}
                      {fiche.public_pro_pair && (
                        <span style={{ fontSize: "10px", fontWeight: 700, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                          {fiche.public_pro_pair}
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <h3 style={{ fontSize: "18px", fontWeight: 700, color: "var(--anthracite)", lineHeight: 1.25, marginBottom: "8px" }}>
                      {fiche.nom}
                    </h3>

                    {/* Intention */}
                    {fiche.intention && (
                      <p style={{
                        fontSize: "13px", color: "var(--muted)", lineHeight: 1.45,
                        fontStyle: "italic", marginBottom: "12px",
                        display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                      }}>
                        {fiche.intention}
                      </p>
                    )}

                    {/* Meta */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                      {duree && (
                        <span style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "10px", background: "var(--blanc)", color: "var(--anthracite-soft)", fontWeight: 500 }}>
                          ⏱ {duree}
                        </span>
                      )}
                      {fiche.format && (
                        <span style={{ fontSize: "11px", padding: "3px 9px", borderRadius: "10px", background: "var(--blanc)", color: "var(--anthracite-soft)", fontWeight: 500 }}>
                          {fiche.format}
                        </span>
                      )}
                    </div>

                    {/* Clés */}
                    {fiche.fichesCles.length > 0 && (
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px", marginTop: "10px", paddingTop: "10px", borderTop: "1px dashed var(--line)" }}>
                        {fiche.fichesCles.map((cle) => (
                          <span key={cle.id} style={{
                            fontSize: "10px", padding: "2px 7px", borderRadius: "8px",
                            color: "white", fontWeight: 600, background: cle.couleur_hex || "var(--canard)",
                          }}>
                            {cle.nom.split(" (")[0]}
                          </span>
                        ))}
                      </div>
                    )}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
