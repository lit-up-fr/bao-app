"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getProfileByUserId,
  getFavoris,
  signOut,
  Profile,
} from "@/lib/auth";
import { getFiches, type Fiche } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";

interface AnalyseRow {
  id: string;
  nom_atelier: string | null;
  date_atelier: string | null;
  nb_jeunes: number | null;
  type_eval: string | null;
  scores: Record<string, number>;
  scores_detail: Record<string, Record<string, number>> | null;
  alertes: string[] | null;
  created_at: string;
}

const CLE_LABELS = ["Sens", "Liberté", "Plaisir", "Action", "Progression", "Utilité", "Sécurité", "Considération", "Confiance"];
const CLE_COLORS: Record<string, string> = {
  "Sens": "#00989D", "Liberté": "#6B2468", "Plaisir": "#FCC33E", "Action": "#e74c3c",
  "Progression": "#3498db", "Utilité": "#2ecc71", "Sécurité": "#1abc9c",
  "Considération": "#9b59b6", "Confiance": "#f39c12",
};
const COULEUR_HEX: Record<string, string> = {
  rose: "#e91e63", jaune: "#FCC33E", bleu: "#2196f3", vert: "#4caf50",
};
const COULEUR_LABELS: Record<string, string> = {
  rose: "Non", jaune: "Un peu", bleu: "Plutôt oui", vert: "Tout à fait",
};

function DashboardContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favoris, setFavoris] = useState<Fiche[]>([]);
  const [recents, setRecents] = useState<Fiche[]>([]);
  const [analyses, setAnalyses] = useState<AnalyseRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAnalyse, setSelectedAnalyse] = useState<AnalyseRow | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const [prof, allFiches, favIds] = await Promise.all([
          getProfileByUserId(session.user.id),
          getFiches(),
          getFavoris(session.user.id),
        ]);

        setProfile(prof);

        const favFiches = allFiches.filter((f) => favIds.includes(f.id));
        setFavoris(favFiches);

        const { data: consultData } = await supabase
          .from("consultations")
          .select("fiche_id, consulted_at")
          .eq("user_id", session.user.id)
          .order("consulted_at", { ascending: false })
          .limit(10);

        if (consultData) {
          const seen = new Set<string>();
          const uniqueIds: string[] = [];
          for (const c of consultData) {
            if (!seen.has(c.fiche_id)) {
              seen.add(c.fiche_id);
              uniqueIds.push(c.fiche_id);
            }
          }
          const recentFiches = uniqueIds
            .map((id) => allFiches.find((f) => f.id === id))
            .filter(Boolean) as Fiche[];
          setRecents(recentFiches.slice(0, 6));
        }

        const { data: analysesData } = await supabase
          .from("analyses")
          .select("*")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false })
          .limit(20);
        if (analysesData) setAnalyses(analysesData);

      } catch (e) {
        console.error("Erreur chargement dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  async function deleteAnalyse(id: string) {
    if (!confirm("Supprimer cette analyse ?")) return;
    await supabase.from("analyses").delete().eq("id", id);
    setAnalyses((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
        Chargement…
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header
        style={{
          background: "#2B3442",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo-litup-white.png" alt="Lit uP" style={{ height: "28px", cursor: "pointer" }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>|</span>
          <span style={{ color: "white", fontSize: "16px", fontWeight: 600 }}>Mon espace</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/bao"
            style={{
              padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)", fontSize: "13px", fontWeight: 600, textDecoration: "none",
            }}
          >
            Boîte à Outils
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px", borderRadius: "8px", background: "rgba(255,255,255,0.1)",
              border: "none", color: "rgba(255,255,255,0.8)", fontSize: "13px", fontWeight: 600,
              fontFamily: "inherit", cursor: "pointer",
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 20px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2B3442", marginBottom: "4px" }}>
            Bonjour {profile?.prenom} !
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Retrouvez vos outils favoris, vos analyses et votre activité récente.
          </p>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "36px" }}>
          <StatCard value={favoris.length} label="Outils favoris" color="#00989D" icon="⭐" />
          <StatCard value={analyses.length} label="Analyses réalisées" color="#6B2468" icon="📊" />
          <StatCard value={recents.length} label="Consultés récemment" color="#FCC33E" icon="👁" />
        </div>

        {/* Analyses */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#2B3442", display: "flex", alignItems: "center", gap: "8px", margin: 0 }}>
              📊 Mes analyses
            </h2>
            <Link href="/bao/analyse" style={{
              padding: "6px 14px", borderRadius: "8px", background: "#00989D", color: "white",
              fontSize: "13px", fontWeight: 600, textDecoration: "none",
            }}>
              + Nouvelle analyse
            </Link>
          </div>

          {analyses.length === 0 ? (
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "32px", textAlign: "center" }}>
              <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: "16px" }}>
                Vous n'avez pas encore réalisé d'analyse. Utilisez le baromètre de l'engagement pour diagnostiquer les leviers de motivation de votre groupe.
              </p>
              <Link href="/bao/analyse" style={{
                display: "inline-block", padding: "10px 24px", borderRadius: "8px",
                background: "#00989D", color: "white", fontSize: "14px", fontWeight: 600, textDecoration: "none",
              }}>
                Réaliser une analyse
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {analyses.map((a) => {
                const alertes = a.alertes || [];
                const scoreEntries = Object.entries(a.scores || {});
                const avgScore = scoreEntries.length > 0
                  ? Math.round(scoreEntries.reduce((sum, [, s]) => sum + s, 0) / scoreEntries.length)
                  : 0;
                const forces = scoreEntries.filter(([, s]) => s >= 70).length;
                const critiques = scoreEntries.filter(([, s]) => s < 30).length;

                return (
                  <div key={a.id} style={{
                    background: "white", borderRadius: "12px", border: "1px solid #e5e7eb",
                    padding: "18px 20px", display: "flex", alignItems: "center", gap: "16px",
                    transition: "box-shadow 0.15s",
                  }}>
                    {/* Mini radar indicator */}
                    <div style={{
                      width: "48px", height: "48px", borderRadius: "50%", flexShrink: 0,
                      background: avgScore >= 60 ? "#dcfce7" : avgScore >= 40 ? "#fef9c3" : "#fef2f2",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: "16px", fontWeight: 800,
                      color: avgScore >= 60 ? "#16a34a" : avgScore >= 40 ? "#ca8a04" : "#dc2626",
                    }}>
                      {avgScore}%
                    </div>

                    {/* Info */}
                    <div style={{ flexGrow: 1, minWidth: 0 }}>
                      <div style={{ fontSize: "15px", fontWeight: 700, color: "#2B3442", marginBottom: "2px" }}>
                        {a.nom_atelier || "Analyse sans nom"}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280", display: "flex", gap: "12px", flexWrap: "wrap" }}>
                        {a.date_atelier && <span>{new Date(a.date_atelier).toLocaleDateString("fr-FR")}</span>}
                        {a.nb_jeunes && <span>{a.nb_jeunes} jeunes</span>}
                        <span>{forces} force{forces !== 1 ? "s" : ""}</span>
                        {critiques > 0 && <span style={{ color: "#dc2626" }}>{critiques} critique{critiques !== 1 ? "s" : ""}</span>}
                      </div>
                      {alertes.length > 0 && (
                        <div style={{ fontSize: "11px", color: "#ea580c", marginTop: "4px" }}>
                          ⚠️ À renforcer : {alertes.join(", ")}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: "flex", gap: "8px", flexShrink: 0 }}>
                      <button
                        onClick={() => setSelectedAnalyse(a)}
                        style={{
                          padding: "6px 12px", borderRadius: "8px", background: "#6B2468",
                          color: "white", fontSize: "12px", fontWeight: 600, border: "none",
                          cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap",
                        }}
                      >
                        📊 Détails
                      </button>
                      <Link
                        href={`/bao?mode=cles&alertes=${encodeURIComponent(alertes.join(","))}&atelier=${encodeURIComponent(a.nom_atelier || "")}`}
                        style={{
                          padding: "6px 12px", borderRadius: "8px", background: "#00989D",
                          color: "white", fontSize: "12px", fontWeight: 600, textDecoration: "none", whiteSpace: "nowrap",
                        }}
                      >
                        🔑 Outils
                      </Link>
                      <button
                        onClick={() => deleteAnalyse(a.id)}
                        style={{
                          padding: "6px 10px", borderRadius: "8px", background: "white",
                          border: "1px solid #e5e7eb", fontSize: "12px", color: "#9ca3af",
                          cursor: "pointer", fontFamily: "inherit",
                        }}
                      >
                        🗑
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Favoris */}
        <Section
          title="Mes favoris"
          icon="⭐"
          emptyMessage="Vous n'avez pas encore ajouté d'outils en favoris. Explorez la Boîte à Outils et cliquez sur l'étoile pour en ajouter !"
          fiches={favoris}
          emptyAction={{ label: "Explorer la Boîte à Outils", href: "/bao" }}
        />

        {/* Récents */}
        <Section
          title="Consultés récemment"
          icon="👁"
          emptyMessage="Aucune consultation récente."
          fiches={recents}
        />

        {/* Mon profil */}
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px", marginTop: "16px" }}>
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#2B3442", marginBottom: "16px" }}>
            Mon profil
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
            <ProfileRow label="Nom" value={`${profile?.prenom} ${profile?.nom}`} />
            <ProfileRow label="Email" value={profile?.email} />
            <ProfileRow label="Structure" value={profile?.structure} />
            <ProfileRow label="Poste" value={profile?.poste} />
            <ProfileRow label="Catégorie" value={
              profile?.categorie_pro === "Autre" ? profile?.categorie_pro_autre : profile?.categorie_pro
            } />
            <ProfileRow label="Région" value={profile?.region} />
            <ProfileRow label="Public accompagné" value={profile?.public_accompagne} />
          </div>
        </div>
      </div>

      {/* Modale détails analyse */}
      {selectedAnalyse && (
        <AnalyseDetailModal
          analyse={selectedAnalyse}
          onClose={() => setSelectedAnalyse(null)}
        />
      )}
    </div>
  );
}

/* ═══ MODALE DÉTAILS ANALYSE ═══ */

function AnalyseDetailModal({ analyse, onClose }: { analyse: AnalyseRow; onClose: () => void }) {
  const scores = analyse.scores || {};
  const detail = analyse.scores_detail || {};
  const alertes = analyse.alertes || [];
  const scoreEntries = CLE_LABELS.map((k) => [k, scores[k] || 0] as [string, number]);
  const avgScore = scoreEntries.length > 0
    ? Math.round(scoreEntries.reduce((sum, [, s]) => sum + s, 0) / scoreEntries.length)
    : 0;

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "20px", overflowY: "auto",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "white", borderRadius: "16px", maxWidth: "720px", width: "100%",
          maxHeight: "90vh", overflowY: "auto", padding: "32px", position: "relative",
        }}
      >
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          style={{
            position: "absolute", top: "16px", right: "16px", width: "32px", height: "32px",
            borderRadius: "50%", background: "#f3f4f6", border: "none", fontSize: "16px",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            color: "#6b7280",
          }}
        >
          ✕
        </button>

        {/* Titre */}
        <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#2B3442", marginBottom: "4px", paddingRight: "40px" }}>
          {analyse.nom_atelier || "Analyse sans nom"}
        </h2>
        <div style={{ fontSize: "13px", color: "#6b7280", marginBottom: "24px", display: "flex", gap: "16px", flexWrap: "wrap" }}>
          {analyse.date_atelier && <span>📅 {new Date(analyse.date_atelier).toLocaleDateString("fr-FR")}</span>}
          {analyse.nb_jeunes && <span>👥 {analyse.nb_jeunes} jeunes</span>}
          {analyse.type_eval && <span>📋 {analyse.type_eval}</span>}
          <span style={{ fontWeight: 700, color: avgScore >= 60 ? "#16a34a" : avgScore >= 40 ? "#ca8a04" : "#dc2626" }}>
            Score moyen : {avgScore}%
          </span>
        </div>

        {/* Alertes */}
        {alertes.length > 0 && (
          <div style={{
            background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: "10px",
            padding: "12px 16px", marginBottom: "24px", fontSize: "13px", color: "#ea580c",
          }}>
            ⚠️ Clés à renforcer : <strong>{alertes.join(", ")}</strong>
          </div>
        )}

        {/* Radar SVG */}
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "28px" }}>
          <RadarChart scores={scores} />
        </div>

        {/* Barres de progression */}
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B3442", marginBottom: "16px" }}>
          Scores par clé
        </h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "24px" }}>
          {scoreEntries.map(([cle, score]) => {
            const isAlerte = alertes.includes(cle);
            return (
              <div key={cle}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                  <span style={{ fontSize: "13px", fontWeight: 600, color: isAlerte ? "#ea580c" : "#2B3442" }}>
                    {isAlerte ? "⚠️ " : ""}{cle}
                  </span>
                  <span style={{ fontSize: "13px", fontWeight: 700, color: score >= 60 ? "#16a34a" : score >= 40 ? "#ca8a04" : "#dc2626" }}>
                    {score}%
                  </span>
                </div>
                <div style={{ height: "8px", borderRadius: "4px", background: "#f3f4f6", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: "4px", transition: "width 0.5s ease",
                    width: `${score}%`,
                    background: score >= 60 ? "#4caf50" : score >= 40 ? "#FCC33E" : "#e74c3c",
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Détail par couleur */}
        {Object.keys(detail).length > 0 && (
          <>
            <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B3442", marginBottom: "16px" }}>
              Répartition des réponses par clé
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px" }}>
              {CLE_LABELS.map((cle) => {
                const d = detail[cle];
                if (!d) return null;
                const total = (d.rose || 0) + (d.jaune || 0) + (d.bleu || 0) + (d.vert || 0);
                if (total === 0) return null;
                return (
                  <div key={cle} style={{
                    background: "#f9fafb", borderRadius: "10px", padding: "12px",
                    border: "1px solid #e5e7eb",
                  }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "#2B3442", marginBottom: "8px" }}>
                      {cle}
                    </div>
                    {/* Barre empilée */}
                    <div style={{ display: "flex", height: "12px", borderRadius: "6px", overflow: "hidden", marginBottom: "6px" }}>
                      {(["rose", "jaune", "bleu", "vert"] as const).map((couleur) => {
                        const val = d[couleur] || 0;
                        if (val === 0) return null;
                        return (
                          <div
                            key={couleur}
                            style={{
                              width: `${(val / total) * 100}%`,
                              background: COULEUR_HEX[couleur],
                              minWidth: val > 0 ? "4px" : 0,
                            }}
                          />
                        );
                      })}
                    </div>
                    {/* Légende chiffres */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {(["rose", "jaune", "bleu", "vert"] as const).map((couleur) => (
                        <span key={couleur} style={{ fontSize: "11px", color: "#6b7280", display: "flex", alignItems: "center", gap: "3px" }}>
                          <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: COULEUR_HEX[couleur], display: "inline-block" }} />
                          {d[couleur] || 0}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Légende couleurs */}
        <div style={{ marginTop: "20px", padding: "12px 16px", background: "#f9fafb", borderRadius: "10px", border: "1px solid #e5e7eb" }}>
          <div style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.5px" }}>
            Légende
          </div>
          <div style={{ display: "flex", gap: "16px", flexWrap: "wrap", fontSize: "12px", color: "#4b5563" }}>
            {(["rose", "jaune", "bleu", "vert"] as const).map((c) => (
              <span key={c} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: COULEUR_HEX[c] }} />
                {COULEUR_LABELS[c]}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ RADAR SVG ═══ */

function RadarChart({ scores }: { scores: Record<string, number> }) {
  const size = 300;
  const center = size / 2;
  const radius = 120;
  const labels = CLE_LABELS;
  const n = labels.length;

  function polarToCart(angle: number, r: number): [number, number] {
    const a = (angle - 90) * (Math.PI / 180);
    return [center + r * Math.cos(a), center + r * Math.sin(a)];
  }

  const angleStep = 360 / n;

  // Grille
  const gridLevels = [0.25, 0.5, 0.75, 1];
  const gridPaths = gridLevels.map((level) => {
    const points = labels.map((_, i) => polarToCart(i * angleStep, radius * level));
    return points.map((p) => p.join(",")).join(" ");
  });

  // Données
  const dataPoints = labels.map((label, i) => {
    const val = (scores[label] || 0) / 100;
    return polarToCart(i * angleStep, radius * val);
  });
  const dataPath = dataPoints.map((p) => p.join(",")).join(" ");

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} style={{ maxWidth: "100%" }}>
      {/* Grille */}
      {gridPaths.map((points, i) => (
        <polygon key={i} points={points} fill="none" stroke="#e5e7eb" strokeWidth="1" />
      ))}
      {/* Axes */}
      {labels.map((_, i) => {
        const [x, y] = polarToCart(i * angleStep, radius);
        return <line key={i} x1={center} y1={center} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" />;
      })}
      {/* Données */}
      <polygon points={dataPath} fill="rgba(0,152,157,0.2)" stroke="#00989D" strokeWidth="2" />
      {dataPoints.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#00989D" />
      ))}
      {/* Labels */}
      {labels.map((label, i) => {
        const [x, y] = polarToCart(i * angleStep, radius + 24);
        const score = scores[label] || 0;
        return (
          <text
            key={i}
            x={x}
            y={y}
            textAnchor="middle"
            dominantBaseline="middle"
            fontSize="10"
            fontWeight="600"
            fill={score < 40 ? "#dc2626" : "#2B3442"}
          >
            {label}
          </text>
        );
      })}
    </svg>
  );
}

/* ═══ SOUS-COMPOSANTS ═══ */

function StatCard({ value, label, color, icon }: { value: number; label: string; color: string; icon: string }) {
  return (
    <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px", display: "flex", alignItems: "center", gap: "14px" }}>
      <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "#2B3442" }}>{value}</div>
        <div style={{ fontSize: "13px", color: "#6b7280" }}>{label}</div>
      </div>
    </div>
  );
}

function Section({ title, icon, emptyMessage, fiches, emptyAction }: {
  title: string; icon: string; emptyMessage: string; fiches: Fiche[];
  emptyAction?: { label: string; href: string };
}) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#2B3442", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>{icon}</span> {title}
      </h2>
      {fiches.length === 0 ? (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "32px", textAlign: "center" }}>
          <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: emptyAction ? "16px" : "0" }}>{emptyMessage}</p>
          {emptyAction && (
            <Link href={emptyAction.href} style={{
              display: "inline-block", padding: "10px 24px", borderRadius: "8px",
              background: "#00989D", color: "white", fontSize: "14px", fontWeight: 600, textDecoration: "none",
            }}>
              {emptyAction.label}
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {fiches.map((f) => (
            <Link key={f.id} href={`/bao/${f.slug || f.id}`} style={{ textDecoration: "none" }}>
              <div
                style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "18px", transition: "box-shadow 0.15s", cursor: "pointer" }}
                onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "none"; }}
              >
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#2B3442", marginBottom: "6px" }}>{f.nom}</div>
                {f.intention && (
                  <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.4", margin: 0 }}>
                    {f.intention.slice(0, 100)}{f.intention.length > 100 ? "…" : ""}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>{label}</div>
      <div style={{ color: value ? "#2B3442" : "#d1d5db", marginTop: "2px" }}>{value || "Non renseigné"}</div>
    </div>
  );
}

export default function MonEspacePage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
