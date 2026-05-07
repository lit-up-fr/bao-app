"use client";

import type { Fiche, Cle, Etape } from "@/lib/supabase";
import { formatDuree } from "@/lib/supabase";

interface FicheModalProps {
  fiche: Fiche;
  cles: Cle[];
  etape: Etape | null;
  onClose: () => void;
}

function parseJSON(val: any): any {
  if (!val) return null;
  if (typeof val === "object") return val;
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}

export default function FicheModal({ fiche, cles, etape, onClose }: FicheModalProps) {
  const duree = formatDuree(fiche);
  const stepColor = etape?.couleur_hex || "var(--canard)";
  const objectifs = parseJSON(fiche.objectifs);
  const materielListe = parseJSON(fiche.materiel_liste);
  const deroule = parseJSON(fiche.deroule);
  const conseils = parseJSON(fiche.conseils);
  const variantes = parseJSON(fiche.variantes);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(43, 52, 66, 0.6)",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white",
          maxWidth: "720px",
          width: "100%",
          maxHeight: "88vh",
          overflowY: "auto",
          position: "relative",
          padding: "40px 44px 44px",
          animation: "modalIn 0.3s ease",
          borderRadius: "20px",
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "var(--blanc)",
            border: "none",
            fontSize: "22px",
            cursor: "pointer",
            color: "var(--anthracite)",
            lineHeight: 1,
            width: "36px",
            height: "36px",
            borderRadius: "50%",
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          ✕
        </button>

        {/* Step badge */}
        {etape && (
          <span
            style={{
              display: "inline-block",
              fontSize: "11px",
              fontWeight: 700,
              letterSpacing: "0.05em",
              padding: "5px 12px",
              borderRadius: "14px",
              color: "white",
              marginBottom: "16px",
              textTransform: "uppercase",
              background: stepColor,
            }}
          >
            {etape.code} · {etape.nom}
          </span>
        )}

        {/* Title */}
        <h1
          style={{
            fontSize: "36px",
            fontWeight: 800,
            letterSpacing: "-0.025em",
            lineHeight: 1.1,
            marginBottom: "20px",
            color: "var(--anthracite)",
          }}
        >
          {fiche.nom}
        </h1>

        {/* Metadata grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "16px 24px",
            margin: "20px 0 24px",
            padding: "20px 24px",
            background: "var(--blanc)",
            borderRadius: "14px",
          }}
        >
          {duree && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={labelStyle}>Durée</span>
              <span style={valueStyle}>{duree}</span>
            </div>
          )}
          {fiche.format && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={labelStyle}>Format</span>
              <span style={valueStyle}>{fiche.format}</span>
            </div>
          )}
          {fiche.materiel && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={labelStyle}>Matériel</span>
              <span style={valueStyle}>{fiche.materiel}</span>
            </div>
          )}
          {fiche.participants && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={labelStyle}>Participants</span>
              <span style={valueStyle}>{fiche.participants}</span>
            </div>
          )}
          {fiche.pour_qui && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={labelStyle}>Pour qui</span>
              <span style={valueStyle}>{fiche.pour_qui}</span>
            </div>
          )}
          {fiche.source && (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={labelStyle}>Source</span>
              <span style={valueStyle}>{fiche.source}</span>
            </div>
          )}
        </div>

        {/* Clés */}
        {cles.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <div style={sectionLabelStyle}>Clés d&apos;engagement</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {cles.map((cle) => (
                <span
                  key={cle.id}
                  style={{
                    fontSize: "10px",
                    padding: "3px 8px",
                    borderRadius: "10px",
                    color: "white",
                    fontWeight: 600,
                    letterSpacing: "0.02em",
                    background: cle.couleur_hex || "var(--canard)",
                  }}
                >
                  {cle.nom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Detail sections */}
        <div style={{ marginTop: "24px" }}>
          {/* Intention */}
          {fiche.intention && (
            <div style={{ marginTop: "32px" }}>
              <div
                style={{
                  padding: "18px 20px 18px 22px",
                  borderRadius: "12px",
                  background: "#e0f3f4",
                  position: "relative",
                  paddingLeft: "28px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "8px",
                    bottom: "8px",
                    width: "4px",
                    borderRadius: "2px",
                    background: "var(--canard)",
                  }}
                />
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    color: "var(--canard-dark)",
                  }}
                >
                  L&apos;intention
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.55,
                    color: "var(--anthracite)",
                    fontStyle: "italic",
                  }}
                >
                  {fiche.intention}
                </div>
              </div>
            </div>
          )}

          {/* Pourquoi */}
          {fiche.pourquoi && (
            <div style={{ marginTop: "12px" }}>
              <div
                style={{
                  padding: "18px 20px 18px 28px",
                  borderRadius: "12px",
                  background: "#fff7df",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: 0,
                    top: "8px",
                    bottom: "8px",
                    width: "4px",
                    borderRadius: "2px",
                    background: "var(--jaune-dark)",
                  }}
                />
                <div
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    marginBottom: "6px",
                    color: "var(--jaune-accent)",
                  }}
                >
                  Pourquoi cet outil fonctionne
                </div>
                <div
                  style={{
                    fontSize: "15px",
                    lineHeight: 1.55,
                    color: "var(--anthracite)",
                  }}
                >
                  {fiche.pourquoi}
                </div>
              </div>
            </div>
          )}

          {/* Matériel liste */}
          {materielListe && Array.isArray(materielListe) && materielListe.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <SectionHeading text="Ce dont vous avez besoin" />
              <div
                style={{
                  background: "var(--blanc)",
                  borderRadius: "12px",
                  padding: "4px 0",
                }}
              >
                {materielListe.map((item: any, i: number) => {
                  const text = typeof item === "string" ? item : item.item || item.titre || Object.values(item).join(" – ");
                  return (
                    <div
                      key={i}
                      style={{
                        padding: "11px 18px",
                        borderBottom: i < materielListe.length - 1 ? "1px solid var(--line)" : "none",
                        fontSize: "15px",
                        display: "flex",
                        gap: "10px",
                        alignItems: "baseline",
                        lineHeight: 1.45,
                      }}
                    >
                      <span style={{ color: "var(--canard)", fontWeight: 700, flexShrink: 0 }}>•</span>
                      <span>{text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Objectifs */}
          {objectifs && Array.isArray(objectifs) && objectifs.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <SectionHeading text="Objectifs pédagogiques" />
              {objectifs.map((obj: any, i: number) => {
                const title = typeof obj === "string" ? obj : obj.titre || obj.title || obj.objectif;
                const detail = typeof obj === "object" ? (obj.détail || obj.detail || obj.description) : null;
                return (
                  <div key={i} style={{ marginBottom: "14px" }}>
                    <div
                      style={{
                        fontSize: "15px",
                        fontWeight: 700,
                        color: "var(--canard-dark)",
                        marginBottom: "4px",
                        display: "flex",
                        alignItems: "baseline",
                        gap: "8px",
                      }}
                    >
                      <span style={{ color: "var(--canard)", fontWeight: 800 }}>→</span>
                      <span>{title}</span>
                    </div>
                    {detail && (
                      <div
                        style={{
                          fontSize: "14px",
                          color: "var(--anthracite)",
                          lineHeight: 1.5,
                          paddingLeft: "20px",
                        }}
                      >
                        {detail}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Déroulé */}
          {deroule && Array.isArray(deroule) && deroule.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <SectionHeading text="Le déroulé, étape par étape" />
              {deroule.map((step: any, i: number) => (
                <div
                  key={i}
                  style={{
                    background: "var(--blanc)",
                    borderRadius: "12px",
                    padding: "18px 22px 18px 24px",
                    marginBottom: "14px",
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  {/* Colored left bar */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "12px",
                      bottom: "12px",
                      width: "5px",
                      background: stepColor,
                      borderRadius: "2px",
                    }}
                  />
                  {/* Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "12px",
                      paddingBottom: "12px",
                      borderBottom: "1px solid var(--line)",
                    }}
                  >
                    <span
                      style={{
                        width: "28px",
                        height: "28px",
                        borderRadius: "50%",
                        background: stepColor,
                        color: "white",
                        fontWeight: 800,
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      {step.étape || step.etape || i + 1}
                    </span>
                    <span
                      style={{
                        fontSize: "16px",
                        fontWeight: 700,
                        color: "var(--anthracite)",
                        flexGrow: 1,
                      }}
                    >
                      {step.titre || step.title || `Étape ${i + 1}`}
                    </span>
                    {(step.durée || step.duree) && (
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: 700,
                          background: stepColor,
                          color: "white",
                          padding: "4px 10px",
                          borderRadius: "10px",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {step.durée || step.duree}
                      </span>
                    )}
                  </div>
                  {/* Actions */}
                  {step.actions && Array.isArray(step.actions) && (
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {step.actions.map((a: string, j: number) => (
                        <li
                          key={j}
                          style={{
                            padding: "5px 0 5px 18px",
                            fontSize: "14px",
                            color: "var(--anthracite)",
                            lineHeight: 1.5,
                            position: "relative",
                          }}
                        >
                          <span
                            style={{
                              position: "absolute",
                              left: "4px",
                              top: "12px",
                              width: "5px",
                              height: "5px",
                              borderRadius: "50%",
                              background: stepColor,
                            }}
                          />
                          <span dangerouslySetInnerHTML={{ __html: a }} />
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Conseils */}
          {conseils && Array.isArray(conseils) && conseils.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <SectionHeading text="Conseils pour bien animer" />
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  background: "#f5e9f3",
                  borderLeft: "4px solid var(--prune)",
                }}
              >
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {conseils.map((c: any, i: number) => {
                    const text = typeof c === "string" ? c : c.conseil || c.titre || c.text || Object.values(c).join(" – ");
                    return (
                      <li
                        key={i}
                        style={{
                          fontSize: "14px",
                          color: "var(--anthracite)",
                          lineHeight: 1.5,
                          padding: "4px 0 4px 20px",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            fontWeight: 700,
                            color: "var(--prune)",
                          }}
                        >
                          →
                        </span>
                        {text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}

          {/* Variantes */}
          {variantes && Array.isArray(variantes) && variantes.length > 0 && (
            <div style={{ marginTop: "32px" }}>
              <SectionHeading text="Variantes possibles" />
              <div
                style={{
                  padding: "16px 20px",
                  borderRadius: "12px",
                  background: "#fff7df",
                  borderLeft: "4px solid var(--jaune-accent)",
                }}
              >
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {variantes.map((v: any, i: number) => {
                    const text = typeof v === "string" ? v : v.variante || v.titre || v.text || Object.values(v).join(" – ");
                    return (
                      <li
                        key={i}
                        style={{
                          fontSize: "14px",
                          color: "var(--anthracite)",
                          lineHeight: 1.5,
                          padding: "4px 0 4px 20px",
                          position: "relative",
                        }}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            fontWeight: 900,
                            color: "var(--jaune-accent)",
                            fontSize: "18px",
                            lineHeight: 1,
                            top: "4px",
                          }}
                        >
                          ·
                        </span>
                        {text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* CTA buttons */}
        <div
          style={{
            marginTop: "28px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          {fiche.pdf_url && (
            <a
              href={fiche.pdf_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                padding: "11px 20px",
                border: "2px solid var(--canard)",
                background: "var(--canard)",
                color: "white",
                fontFamily: "inherit",
                fontSize: "13px",
                fontWeight: 700,
                cursor: "pointer",
                borderRadius: "24px",
                transition: "all 0.2s",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                letterSpacing: "0.02em",
                textDecoration: "none",
              }}
            >
              ↓ Télécharger la fiche PDF
            </a>
          )}
          <button
            onClick={() => window.print()}
            style={{
              padding: "11px 20px",
              border: "2px solid var(--canard)",
              background: "transparent",
              color: "var(--canard)",
              fontFamily: "inherit",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              borderRadius: "24px",
              transition: "all 0.2s",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              letterSpacing: "0.02em",
            }}
          >
            🖨 Imprimer
          </button>
        </div>

        {/* Source */}
        {fiche.source && (
          <div
            style={{
              marginTop: "32px",
              paddingTop: "20px",
              borderTop: "1px dashed var(--line-strong)",
              fontSize: "13px",
              color: "var(--muted)",
            }}
          >
            <strong>Source :</strong> {fiche.source}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Shared styles ── */

const labelStyle: React.CSSProperties = {
  fontSize: "11px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
};

const valueStyle: React.CSSProperties = {
  fontSize: "15px",
  fontWeight: 600,
  color: "var(--anthracite)",
  lineHeight: 1.4,
};

const sectionLabelStyle: React.CSSProperties = {
  fontSize: "12px",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  color: "var(--muted)",
  margin: "20px 0 10px",
};

/* ── Sub-components ── */

function SectionHeading({ text }: { text: string }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px",
      }}
    >
      <span
        style={{
          fontSize: "20px",
          fontWeight: 800,
          color: "var(--anthracite)",
          letterSpacing: "-0.015em",
          lineHeight: 1.1,
        }}
      >
        {text}
      </span>
    </div>
  );
}
