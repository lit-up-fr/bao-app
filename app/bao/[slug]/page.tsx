"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  getFicheBySlug,
  getClesByFiche,
  getEtapeById,
  formatDuree,
  type Fiche,
  type Cle,
  type Etape,
} from "@/lib/supabase";
import { supabase } from "@/lib/supabase";
import { getProfileByUserId } from "@/lib/auth";
import AppHeader from "@/components/AppHeader";
import RetoursSection from "@/components/RetoursSection";

function parseJSON(val: any): any {
  if (!val) return null;
  if (typeof val === "object") return val;
  try { return JSON.parse(val); } catch { return val; }
}

export default function FicheDetailPage({ params }: { params: { slug: string } }) {
  const [fiche, setFiche] = useState<Fiche | null>(null);
  const [cles, setCles] = useState<Cle[]>([]);
  const [etape, setEtape] = useState<Etape | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function load() {
      const f = await getFicheBySlug(params.slug);
      if (f) {
        setFiche(f);
        const [c, e] = await Promise.all([
          getClesByFiche(f.id),
          f.etape_id ? getEtapeById(f.etape_id) : Promise.resolve(null),
        ]);
        setCles(c);
        setEtape(e);
      }
      // Get current user
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUserId(session.user.id);
        const prof = await getProfileByUserId(session.user.id);
        if (prof?.is_admin) setIsAdmin(true);
      }
      setLoading(false);
    }
    load();
  }, [params.slug]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--blanc)" }}>
        <AppHeader searchQuery="" onSearchChange={() => {}} />
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 28px", textAlign: "center", color: "var(--muted)" }}>
          Chargement...
        </div>
      </div>
    );
  }

  if (!fiche) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--blanc)" }}>
        <AppHeader searchQuery="" onSearchChange={() => {}} />
        <div style={{ maxWidth: "760px", margin: "0 auto", padding: "80px 28px", textAlign: "center" }}>
          <h1 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", marginBottom: "12px" }}>Fiche introuvable</h1>
          <Link href="/bao" style={{ color: "var(--canard)", textDecoration: "none", fontWeight: 600 }}>Retour aux outils</Link>
        </div>
      </div>
    );
  }

  const duree = formatDuree(fiche);
  const stepColor = etape?.couleur_hex || "var(--canard)";
  const objectifs = parseJSON(fiche.objectifs);
  const materielListe = parseJSON(fiche.materiel_liste);
  const deroule = parseJSON(fiche.deroule);
  const conseils = parseJSON(fiche.conseils);
  const variantes = parseJSON(fiche.variantes);
  const illustrationsList: string[] = Array.isArray((fiche as any).illustrations) ? (fiche as any).illustrations : [];
  const pdfsComp: { nom: string; url: string }[] = Array.isArray((fiche as any).pdfs_complementaires) ? (fiche as any).pdfs_complementaires : [];

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://odadaqpihvcnuprkdchr.supabase.co";
  const pdfUrl = fiche.pdf_url
    ? fiche.pdf_url.startsWith("http")
      ? fiche.pdf_url
      : `${SUPABASE_URL}/storage/v1/object/public/fiches-pdf/${fiche.pdf_url.replace(/^\/?(pdfs\/)?/, "")}`
    : null;

  return (
    <div style={{ minHeight: "100vh", background: "var(--blanc)" }}>
      <AppHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div style={{ maxWidth: "760px", margin: "0 auto", padding: "40px 28px 80px" }}>
        {/* Back link */}
        <Link href="/bao" style={{ color: "var(--canard)", textDecoration: "none", fontSize: "14px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "28px" }}>
          Retour aux outils
        </Link>

        {/* Step badge */}
        {etape && (
          <div style={{ marginBottom: "16px" }}>
            <span style={{
              display: "inline-block", fontSize: "11px", fontWeight: 700,
              letterSpacing: "0.05em", padding: "5px 12px", borderRadius: "14px",
              color: "white", textTransform: "uppercase", background: stepColor,
            }}>
              {etape.code} - {etape.nom}
            </span>
          </div>
        )}

        {/* Title */}
        <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, marginBottom: "20px", color: "var(--anthracite)" }}>
          {fiche.nom}
        </h1>

        {/* Illustrations carrousel */}
        {illustrationsList.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", gap: "10px", overflowX: "auto", paddingBottom: "8px" }}>
              {illustrationsList.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={url}
                  alt={`Illustration ${i + 1}`}
                  style={{
                    height: "220px",
                    borderRadius: "12px",
                    objectFit: "cover",
                    flexShrink: 0,
                    border: "2px solid var(--line)",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Metadata grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "16px 24px", margin: "20px 0 24px", padding: "20px 24px", background: "white", borderRadius: "14px", border: "2px solid var(--line)" }}>
          {duree && <MetaItem label="Duree" value={duree} />}
          {fiche.format && <MetaItem label="Format" value={fiche.format} />}
          {fiche.materiel && <MetaItem label="Materiel" value={fiche.materiel} />}
          {fiche.participants && <MetaItem label="Participants" value={fiche.participants} />}
          {fiche.pour_qui && <MetaItem label="Pour qui" value={fiche.pour_qui} />}
          {fiche.source && <MetaItem label="Source" value={fiche.source} />}
        </div>

        {/* Cles */}
        {cles.length > 0 && (
          <div style={{ marginBottom: "24px" }}>
            <SectionLabel text="Cles d'engagement" />
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
              {cles.map((cle) => (
                <span key={cle.id} style={{ fontSize: "11px", padding: "4px 10px", borderRadius: "10px", color: "white", fontWeight: 600, background: cle.couleur_hex || "var(--canard)" }}>
                  {cle.nom}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Intention */}
        {fiche.intention && (
          <div style={{ padding: "18px 20px 18px 28px", borderRadius: "12px", background: "#e0f3f4", position: "relative", marginBottom: "12px" }}>
            <div style={{ position: "absolute", left: 0, top: "8px", bottom: "8px", width: "4px", borderRadius: "2px", background: "var(--canard)" }} />
            <SectionLabel text="L'intention" color="var(--canard-dark)" />
            <div style={{ fontSize: "15px", lineHeight: 1.55, color: "var(--anthracite)", fontStyle: "italic" }}>{fiche.intention}</div>
          </div>
        )}

        {/* Pourquoi */}
        {fiche.pourquoi && (
          <div style={{ padding: "18px 20px 18px 28px", borderRadius: "12px", background: "#fff7df", position: "relative", marginBottom: "32px" }}>
            <div style={{ position: "absolute", left: 0, top: "8px", bottom: "8px", width: "4px", borderRadius: "2px", background: "var(--jaune-dark)" }} />
            <SectionLabel text="Pourquoi cet outil fonctionne" color="var(--jaune-accent)" />
            <div style={{ fontSize: "15px", lineHeight: 1.55, color: "var(--anthracite)" }}>{fiche.pourquoi}</div>
          </div>
        )}

        {/* Materiel liste */}
        {materielListe && Array.isArray(materielListe) && materielListe.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <SectionHeading text="Ce dont vous avez besoin" />
            <div style={{ background: "white", borderRadius: "12px", border: "2px solid var(--line)", padding: "4px 0" }}>
              {materielListe.map((item: any, i: number) => {
                const text = typeof item === "string" ? item : item.item || item.titre || Object.values(item).join(" - ");
                return (
                  <div key={i} style={{ padding: "11px 18px", borderBottom: i < materielListe.length - 1 ? "1px solid var(--line)" : "none", fontSize: "15px", display: "flex", gap: "10px", alignItems: "baseline", lineHeight: 1.45 }}>
                    <span style={{ color: "var(--canard)", fontWeight: 700, flexShrink: 0 }}>*</span>
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Objectifs */}
        {objectifs && Array.isArray(objectifs) && objectifs.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <SectionHeading text="Objectifs pedagogiques" />
            {objectifs.map((obj: any, i: number) => {
              const title = typeof obj === "string" ? obj : obj.titre || obj.title || obj.objectif;
              const detail = typeof obj === "object" ? (obj.detail || obj.description) : null;
              return (
                <div key={i} style={{ marginBottom: "14px" }}>
                  <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--canard-dark)", display: "flex", alignItems: "baseline", gap: "8px" }}>
                    <span style={{ color: "var(--canard)", fontWeight: 800 }}>-&gt;</span>
                    <span>{title}</span>
                  </div>
                  {detail && <div style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.5, paddingLeft: "20px", marginTop: "4px" }}>{detail}</div>}
                </div>
              );
            })}
          </div>
        )}

        {/* Deroule */}
        {deroule && Array.isArray(deroule) && deroule.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <SectionHeading text="Le deroule, etape par etape" />
            {deroule.map((step: any, i: number) => (
              <div key={i} style={{ background: "white", borderRadius: "12px", border: "2px solid var(--line)", padding: "18px 22px 18px 24px", marginBottom: "14px", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: "12px", bottom: "12px", width: "5px", background: stepColor, borderRadius: "2px" }} />
                <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "12px", paddingBottom: "12px", borderBottom: "1px solid var(--line)" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: stepColor, color: "white", fontWeight: 800, fontSize: "13px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    {step.etape || i + 1}
                  </span>
                  <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--anthracite)", flexGrow: 1 }}>
                    {step.titre || step.title || `Etape ${i + 1}`}
                  </span>
                  {(step.duree) && (
                    <span style={{ fontSize: "12px", fontWeight: 700, background: stepColor, color: "white", padding: "4px 10px", borderRadius: "10px", whiteSpace: "nowrap" }}>
                      {step.duree}
                    </span>
                  )}
                </div>
                {step.actions && Array.isArray(step.actions) && (
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {step.actions.map((a: string, j: number) => (
                      <li key={j} style={{ padding: "5px 0 5px 18px", fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.5, position: "relative" }}>
                        <span style={{ position: "absolute", left: "4px", top: "12px", width: "5px", height: "5px", borderRadius: "50%", background: stepColor }} />
                        <span dangerouslySetInnerHTML={{ __html: a }} />
                      </li>
                    ))}
                  </ul>
                )}
                {step.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={step.image_url}
                    alt={`Illustration ${step.titre || `etape ${i + 1}`}`}
                    style={{
                      width: "100%",
                      maxHeight: "350px",
                      objectFit: "contain",
                      borderRadius: "10px",
                      marginTop: "14px",
                      border: "1px solid var(--line)",
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Conseils */}
        {conseils && Array.isArray(conseils) && conseils.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <SectionHeading text="Conseils pour bien animer" />
            <div style={{ padding: "16px 20px", borderRadius: "12px", background: "#f5e9f3", borderLeft: "4px solid var(--prune)" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {conseils.map((c: any, i: number) => {
                  const text = typeof c === "string" ? c : c.conseil || c.titre || c.text || Object.values(c).join(" - ");
                  return (
                    <li key={i} style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.5, padding: "4px 0 4px 20px", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, fontWeight: 700, color: "var(--prune)" }}>-&gt;</span>
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
          <div style={{ marginBottom: "32px" }}>
            <SectionHeading text="Variantes possibles" />
            <div style={{ padding: "16px 20px", borderRadius: "12px", background: "#fff7df", borderLeft: "4px solid var(--jaune-accent)" }}>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {variantes.map((v: any, i: number) => {
                  const text = typeof v === "string" ? v : v.variante || v.titre || v.text || Object.values(v).join(" - ");
                  return (
                    <li key={i} style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.5, padding: "4px 0 4px 20px", position: "relative" }}>
                      <span style={{ position: "absolute", left: 0, fontWeight: 900, color: "var(--jaune-accent)", fontSize: "18px", lineHeight: 1, top: "4px" }}>.</span>
                      {text}
                    </li>
                  );
                })}
              </ul>
            </div>
          </div>
        )}

        {/* PDFs complementaires */}
        {pdfsComp.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <SectionHeading text="Ressources complementaires" />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {pdfsComp.map((pdf, i) => (
                <a
                  key={i}
                  href={pdf.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "12px 16px",
                    background: "white",
                    borderRadius: "10px",
                    textDecoration: "none",
                    border: "2px solid var(--line)",
                    transition: "border-color 0.15s",
                  }}
                >
                  <span style={{ fontSize: "20px" }}>PDF</span>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--anthracite)", flex: 1 }}>
                    {pdf.nom || `Document ${i + 1}`}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--canard)" }}>
                    Telecharger
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}

        {/* PDF principal */}
        {pdfUrl && (
          <div style={{ marginTop: "28px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <a href={pdfUrl} target="_blank" rel="noopener noreferrer" style={{
              padding: "11px 20px", border: "2px solid var(--canard)", background: "var(--canard)", color: "white",
              fontFamily: "inherit", fontSize: "13px", fontWeight: 700, cursor: "pointer", borderRadius: "24px",
              transition: "all 0.2s", display: "inline-flex", alignItems: "center", gap: "8px",
              letterSpacing: "0.02em", textDecoration: "none",
            }}>
              Telecharger la fiche PDF
            </a>
          </div>
        )}

        {/* Source */}
        {fiche.source && (
          <div style={{ marginTop: "32px", paddingTop: "20px", borderTop: "1px dashed var(--line-strong)", fontSize: "13px", color: "var(--muted)" }}>
            <strong>Source :</strong> {fiche.source}
          </div>
        )}

        {/* Retours d'experience */}
        <RetoursSection
          ficheId={fiche.id}
          userId={userId}
          isAdmin={isAdmin}
        />
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
      <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "var(--muted)" }}>{label}</span>
      <span style={{ fontSize: "15px", fontWeight: 600, color: "var(--anthracite)", lineHeight: 1.4 }}>{value}</span>
    </div>
  );
}

function SectionLabel({ text, color }: { text: string; color?: string }) {
  return (
    <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px", color: color || "var(--muted)" }}>
      {text}
    </div>
  );
}

function SectionHeading({ text }: { text: string }) {
  return (
    <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--anthracite)", letterSpacing: "-0.015em", lineHeight: 1.1, marginBottom: "16px" }}>
      {text}
    </div>
  );
}
