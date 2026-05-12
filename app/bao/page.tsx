"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getFiches,
  getCles,
  getEtapes,
  getParcours,
  getFichesByParcours,
  getClesByFiche,
  getEtapeById,
  type Fiche,
  type Cle,
  type Etape,
  type Parcours,
} from "@/lib/supabase";
import { useCurrentUser } from "@/lib/useCurrentUser";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import FicheCard from "@/components/FicheCard";
import FicheModal from "@/components/FicheModal";
import WelcomeModal from "@/components/WelcomeModal";

interface FicheWithMeta extends Fiche {
  fichesCles: Cle[];
  etape: Etape | null;
}

export default function BaoPage() {
  const [fiches, setFiches] = useState<FicheWithMeta[]>([]);
  const [cles, setCles] = useState<Cle[]>([]);
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [parcoursList, setParcoursList] = useState<Parcours[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [activeEtapes, setActiveEtapes] = useState<string[]>([]);
  const [activeCles, setActiveCles] = useState<string[]>([]);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"step" | "name" | "duration">("step");

  const [activeParcours, setActiveParcours] = useState<Parcours | null>(null);
  const [parcoursFicheIds, setParcoursFicheIds] = useState<string[]>([]);
  const [parcoursVisible, setParcoursVisible] = useState(true);
  const [parcoursCountMap, setParcoursCountMap] = useState<Record<string, number>>({});

  const [selectedFiche, setSelectedFiche] = useState<FicheWithMeta | null>(null);
  const [showWelcome, setShowWelcome] = useState(false);

  const { userId, favorisIds, updateFavori, isAdmin } = useCurrentUser();

  // Afficher la modale de bienvenue à la première visite
  useEffect(() => {
    try {
      const seen = sessionStorage.getItem("bao_welcome_seen");
      if (!seen) setShowWelcome(true);
    } catch {}
  }, []);

  function closeWelcome() {
    setShowWelcome(false);
    try { sessionStorage.setItem("bao_welcome_seen", "1"); } catch {}
  }

  useEffect(() => {
    async function loadData() {
      try {
        const [fichesData, clesData, etapesData, parcoursData] = await Promise.all([
          getFiches(), getCles(), getEtapes(), getParcours(),
        ]);
        const fichesWithMeta = await Promise.all(
          fichesData.map(async (f) => {
            const [ficheCles, etape] = await Promise.all([
              getClesByFiche(f.id),
              f.etape_id ? getEtapeById(f.etape_id) : Promise.resolve(null),
            ]);
            return { ...f, fichesCles: ficheCles, etape };
          })
        );
        setFiches(fichesWithMeta);
        setCles(clesData);
        setEtapes(etapesData);
        setParcoursList(parcoursData);

        const counts: Record<string, number> = {};
        await Promise.all(
          parcoursData.map(async (p) => {
            const pf = await getFichesByParcours(p.id);
            counts[p.id] = pf.length;
          })
        );
        setParcoursCountMap(counts);
      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const selectParcours = async (p: Parcours) => {
    if (activeParcours?.id === p.id) { setActiveParcours(null); setParcoursFicheIds([]); return; }
    setActiveParcours(p);
    const pf = await getFichesByParcours(p.id);
    setParcoursFicheIds(pf.map((f) => f.id));
  };
  const clearParcours = () => { setActiveParcours(null); setParcoursFicheIds([]); };

  const formats = useMemo(() => {
    const s = new Set<string>();
    fiches.forEach((f) => { if (f.format) s.add(f.format); });
    return Array.from(s).sort();
  }, [fiches]);

  const fichesCountByEtape = useMemo(() => {
    const c: Record<string, number> = {};
    fiches.forEach((f) => { if (f.etape_id) c[f.etape_id] = (c[f.etape_id] || 0) + 1; });
    return c;
  }, [fiches]);

  const fichesCountByCle = useMemo(() => {
    const c: Record<string, number> = {};
    fiches.forEach((f) => f.fichesCles.forEach((k) => { c[k.id] = (c[k.id] || 0) + 1; }));
    return c;
  }, [fiches]);

  const filtered = useMemo(() => {
    let r = fiches.filter((f) => {
      const q = searchQuery.toLowerCase();
      return (!q || f.nom.toLowerCase().includes(q) || (f.intention || "").toLowerCase().includes(q) || (f.pourquoi || "").toLowerCase().includes(q))
        && (activeEtapes.length === 0 || (f.etape_id && activeEtapes.includes(f.etape_id)))
        && (activeCles.length === 0 || f.fichesCles.some((c) => activeCles.includes(c.id)))
        && (activeFormats.length === 0 || (f.format && activeFormats.includes(f.format)))
        && (parcoursFicheIds.length === 0 || parcoursFicheIds.includes(f.id));
    });
    if (sortBy === "name") r = [...r].sort((a, b) => a.nom.localeCompare(b.nom));
    else if (sortBy === "duration") r = [...r].sort((a, b) => (a.duree_min || 999) - (b.duree_min || 999));
    else r = [...r].sort((a, b) => (a.etape?.ordre ?? 999) - (b.etape?.ordre ?? 999) || a.nom.localeCompare(b.nom));
    return r;
  }, [fiches, searchQuery, activeEtapes, activeCles, activeFormats, parcoursFicheIds, sortBy]);

  const toggleEtape = (id: string) => setActiveEtapes((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleCle = (id: string) => setActiveCles((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);
  const toggleFormat = (f: string) => setActiveFormats((p) => p.includes(f) ? p.filter((x) => x !== f) : [...p, f]);
  const resetFilters = () => { setActiveEtapes([]); setActiveCles([]); setActiveFormats([]); setSearchQuery(""); clearParcours(); };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .bao-main-grid {
            grid-template-columns: 1fr !important;
          }
          .bao-results {
            padding: 16px !important;
            padding-bottom: 100px !important;
          }
          .bao-results-grid {
            grid-template-columns: 1fr !important;
          }
          .bao-parcours-header {
            flex-direction: column !important;
            align-items: flex-start !important;
            gap: 8px !important;
          }
          .bao-parcours-header-text {
            flex-direction: column !important;
            gap: 2px !important;
          }
          .bao-parcours-header-text span:first-child {
            font-size: 16px !important;
          }
          .bao-parcours-section {
            padding: 16px !important;
          }
          .bao-parcours-grid {
            grid-template-columns: 1fr 1fr !important;
          }
          .bao-results-header {
            flex-direction: column !important;
            gap: 8px !important;
          }
          .bao-active-parcours-bar {
            flex-wrap: wrap !important;
            padding: 12px 16px !important;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", background: "var(--blanc)" }}>
        <AppHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} onOpenGuide={() => setShowWelcome(true)} />

        {/* ═══ Parcours guidés ═══ */}
        {parcoursVisible && parcoursList.length > 0 && (
          <div className="bao-parcours-section" style={{ borderBottom: "2px solid var(--line)", background: "white", padding: "20px 28px 24px" }}>
            <div className="bao-parcours-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", maxWidth: "1500px", margin: "0 auto 16px" }}>
              <div className="bao-parcours-header-text" style={{ display: "flex", alignItems: "baseline", gap: "12px" }}>
                <span style={{ fontSize: "20px", fontWeight: 800, color: "var(--anthracite)" }}>Par où commencer ?</span>
                <em style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: "var(--jaune-accent)", fontStyle: "italic" }}>— choisissez votre situation</em>
              </div>
              <button onClick={() => setParcoursVisible(false)} style={{ background: "transparent", border: "1.5px solid var(--line)", borderRadius: "16px", padding: "6px 14px", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "var(--muted)", fontFamily: "inherit", whiteSpace: "nowrap" }}>
                Masquer ▲
              </button>
            </div>
            <div className="bao-parcours-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "12px", maxWidth: "1500px", margin: "0 auto" }}>
              {parcoursList.map((p) => (
                <button key={p.id} onClick={() => selectParcours(p)} style={{
                  background: activeParcours?.id === p.id ? "var(--canard)" : "white",
                  color: activeParcours?.id === p.id ? "white" : "var(--anthracite)",
                  border: `2px solid ${activeParcours?.id === p.id ? "var(--canard)" : "var(--line)"}`,
                  borderRadius: "14px", padding: "16px", cursor: "pointer", textAlign: "left", fontFamily: "inherit", transition: "all 0.2s", position: "relative", overflow: "hidden",
                }}>
                  {parcoursCountMap[p.id] !== undefined && (
                    <span style={{ position: "absolute", top: "10px", right: "10px", background: activeParcours?.id === p.id ? "white" : "var(--canard)", color: activeParcours?.id === p.id ? "var(--canard)" : "white", fontSize: "11px", fontWeight: 700, width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      {parcoursCountMap[p.id]}
                    </span>
                  )}
                  <div style={{ fontSize: "24px", marginBottom: "8px" }}>{p.emoji || "📋"}</div>
                  <div style={{ fontSize: "14px", fontWeight: 700, lineHeight: 1.25, marginBottom: "6px" }}>{p.titre}</div>
                  {p.description && (
                    <div style={{ fontSize: "12px", lineHeight: 1.4, opacity: 0.75, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
                      {p.description}
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {!parcoursVisible && parcoursList.length > 0 && (
          <div style={{ borderBottom: "2px solid var(--line)", background: "white", padding: "8px 28px" }}>
            <button onClick={() => setParcoursVisible(true)} style={{ background: "transparent", border: "none", fontFamily: "inherit", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: "var(--canard)", padding: "4px 0" }}>
              + Afficher les parcours guidés
            </button>
          </div>
        )}

        {activeParcours && (
          <div className="bao-active-parcours-bar" style={{ background: "var(--canard)", color: "white", padding: "12px 28px", display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "20px" }}>{activeParcours.emoji}</span>
            <div style={{ flexGrow: 1 }}>
              <div style={{ fontWeight: 700, fontSize: "14px" }}>{activeParcours.titre}</div>
              {activeParcours.description && <div style={{ fontSize: "12px", opacity: 0.8 }}>{activeParcours.description}</div>}
            </div>
            <button onClick={clearParcours} style={{ background: "rgba(255,255,255,0.2)", border: "none", color: "white", padding: "6px 14px", borderRadius: "14px", fontSize: "12px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit", whiteSpace: "nowrap" }}>
              ✕ Tout afficher
            </button>
          </div>
        )}

        <div className="bao-main-grid" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 0, maxWidth: "1500px", margin: "0 auto", flexGrow: 1, width: "100%" }}>
          <Sidebar etapes={etapes} cles={cles} formats={formats} activeEtapes={activeEtapes} activeCles={activeCles} activeFormats={activeFormats} onToggleEtape={toggleEtape} onToggleCle={toggleCle} onToggleFormat={toggleFormat} onReset={resetFilters} fichesCountByEtape={fichesCountByEtape} fichesCountByCle={fichesCountByCle} />

          <section className="bao-results" style={{ padding: "28px 32px 80px" }}>
            <div className="bao-results-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "24px", flexWrap: "wrap", gap: "12px" }}>
              <div style={{ fontSize: "26px", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--anthracite)" }}>
                <strong style={{ color: "var(--canard)", fontWeight: 800 }}>{loading ? "—" : filtered.length}</strong> outils
                <span style={{ fontFamily: "'Caveat', cursive", fontWeight: 500, color: "var(--jaune-accent)", fontSize: "22px", marginLeft: "6px" }}>pour avancer.</span>
              </div>
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value as "step" | "name" | "duration")} style={{ fontSize: "13px", fontFamily: "inherit", fontWeight: 600, padding: "7px 14px", border: "2px solid var(--line-strong)", background: "white", color: "var(--anthracite)", cursor: "pointer", borderRadius: "18px" }}>
                <option value="step">Trier par étape du parcours</option>
                <option value="name">Trier par nom</option>
                <option value="duration">Trier par durée</option>
              </select>
            </div>

            {loading ? (
              <div className="bao-results-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} style={{ background: "white", border: "2px solid var(--line)", borderRadius: "16px", padding: "22px", minHeight: "260px" }}>
                    <div style={{ height: "4px", background: "#e0e0e0", borderRadius: "2px", marginBottom: "16px" }} />
                    <div style={{ height: "20px", background: "#e0e0e0", borderRadius: "4px", width: "60%", marginBottom: "8px" }} />
                    <div style={{ height: "14px", background: "#f0f0f0", borderRadius: "4px", width: "80%" }} />
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: "80px 40px", textAlign: "center", background: "white", border: "2px dashed var(--line)", borderRadius: "16px", fontSize: "20px", color: "var(--muted)" }}>
                <span style={{ color: "var(--jaune-accent)", fontSize: "28px", display: "block", fontFamily: "'Caveat', cursive", marginBottom: "8px" }}>Hmm…</span>
                Aucun outil ne correspond à ces filtres.
              </div>
            ) : (
              <div className="bao-results-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
                {filtered.map((fiche) => (
                  <FicheCard
                    key={fiche.id}
                    fiche={fiche}
                    cles={fiche.fichesCles}
                    etape={fiche.etape}
                    onClick={() => setSelectedFiche(fiche)}
                    userId={userId}
                    isFavori={favorisIds.includes(fiche.id)}
                    onFavoriToggle={updateFavori}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        {selectedFiche && (
          <FicheModal fiche={selectedFiche} cles={selectedFiche.fichesCles} etape={selectedFiche.etape} onClose={() => setSelectedFiche(null)} userId={userId} isAdmin={isAdmin} />
        )}

        {showWelcome && (
          <WelcomeModal onClose={closeWelcome} />
        )}
      </div>
    </>
  );
}
