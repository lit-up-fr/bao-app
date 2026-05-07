"use client";

import { useEffect, useState, useMemo } from "react";
import {
  getFiches,
  getCles,
  getEtapes,
  getClesByFiche,
  getEtapeById,
  formatDuree,
  type Fiche,
  type Cle,
  type Etape,
} from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";
import Sidebar from "@/components/Sidebar";
import FicheCard from "@/components/FicheCard";
import FicheModal from "@/components/FicheModal";

interface FicheWithMeta extends Fiche {
  fichesCles: Cle[];
  etape: Etape | null;
}

export default function BaoPage() {
  const [fiches, setFiches] = useState<FicheWithMeta[]>([]);
  const [cles, setCles] = useState<Cle[]>([]);
  const [etapes, setEtapes] = useState<Etape[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [activeEtapes, setActiveEtapes] = useState<string[]>([]);
  const [activeCles, setActiveCles] = useState<string[]>([]);
  const [activeFormats, setActiveFormats] = useState<string[]>([]);

  // Modal
  const [selectedFiche, setSelectedFiche] = useState<FicheWithMeta | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [fichesData, clesData, etapesData] = await Promise.all([
          getFiches(),
          getCles(),
          getEtapes(),
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
      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // Unique formats
  const formats = useMemo(() => {
    const set = new Set<string>();
    fiches.forEach((f) => {
      if (f.format) set.add(f.format);
    });
    return Array.from(set).sort();
  }, [fiches]);

  // Count fiches per etape
  const fichesCountByEtape = useMemo(() => {
    const counts: Record<string, number> = {};
    fiches.forEach((f) => {
      if (f.etape_id) counts[f.etape_id] = (counts[f.etape_id] || 0) + 1;
    });
    return counts;
  }, [fiches]);

  // Count fiches per cle
  const fichesCountByCle = useMemo(() => {
    const counts: Record<string, number> = {};
    fiches.forEach((f) => {
      f.fichesCles.forEach((c) => {
        counts[c.id] = (counts[c.id] || 0) + 1;
      });
    });
    return counts;
  }, [fiches]);

  // Filtered fiches
  const filtered = useMemo(() => {
    return fiches.filter((f) => {
      // Search
      const q = searchQuery.toLowerCase();
      const matchSearch =
        !q ||
        f.nom.toLowerCase().includes(q) ||
        (f.intention || "").toLowerCase().includes(q) ||
        (f.pourquoi || "").toLowerCase().includes(q);

      // Etape filter
      const matchEtape =
        activeEtapes.length === 0 ||
        (f.etape_id && activeEtapes.includes(f.etape_id));

      // Cle filter
      const matchCle =
        activeCles.length === 0 ||
        f.fichesCles.some((c) => activeCles.includes(c.id));

      // Format filter
      const matchFormat =
        activeFormats.length === 0 ||
        (f.format && activeFormats.includes(f.format));

      return matchSearch && matchEtape && matchCle && matchFormat;
    });
  }, [fiches, searchQuery, activeEtapes, activeCles, activeFormats]);

  const toggleEtape = (id: string) => {
    setActiveEtapes((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleCle = (id: string) => {
    setActiveCles((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };
  const toggleFormat = (f: string) => {
    setActiveFormats((prev) =>
      prev.includes(f) ? prev.filter((x) => x !== f) : [...prev, f]
    );
  };
  const resetFilters = () => {
    setActiveEtapes([]);
    setActiveCles([]);
    setActiveFormats([]);
    setSearchQuery("");
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "var(--blanc)",
      }}
    >
      <AppHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "280px 1fr",
          gap: 0,
          maxWidth: "1500px",
          margin: "0 auto",
          flexGrow: 1,
          width: "100%",
        }}
      >
        <Sidebar
          etapes={etapes}
          cles={cles}
          formats={formats}
          activeEtapes={activeEtapes}
          activeCles={activeCles}
          activeFormats={activeFormats}
          onToggleEtape={toggleEtape}
          onToggleCle={toggleCle}
          onToggleFormat={toggleFormat}
          onReset={resetFilters}
          fichesCountByEtape={fichesCountByEtape}
          fichesCountByCle={fichesCountByCle}
        />

        {/* Results area */}
        <section style={{ padding: "28px 32px 80px" }}>
          {/* Results header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              marginBottom: "24px",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div
              style={{
                fontSize: "26px",
                fontWeight: 800,
                letterSpacing: "-0.02em",
                color: "var(--anthracite)",
              }}
            >
              <strong style={{ color: "var(--canard)", fontWeight: 800 }}>
                {loading ? "—" : filtered.length}
              </strong>{" "}
              outils
              <span
                style={{
                  fontFamily: "'Caveat', cursive",
                  fontWeight: 500,
                  color: "var(--jaune-accent)",
                  fontSize: "22px",
                  marginLeft: "6px",
                }}
              >
                pour avancer.
              </span>
            </div>
          </div>

          {/* Grid */}
          {loading ? (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    border: "2px solid var(--line)",
                    borderRadius: "16px",
                    padding: "22px",
                    minHeight: "260px",
                  }}
                >
                  <div
                    style={{
                      height: "4px",
                      background: "#e0e0e0",
                      borderRadius: "2px",
                      marginBottom: "16px",
                    }}
                  />
                  <div
                    style={{
                      height: "20px",
                      background: "#e0e0e0",
                      borderRadius: "4px",
                      width: "60%",
                      marginBottom: "8px",
                    }}
                  />
                  <div
                    style={{
                      height: "14px",
                      background: "#f0f0f0",
                      borderRadius: "4px",
                      width: "80%",
                    }}
                  />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div
              style={{
                padding: "80px 40px",
                textAlign: "center",
                background: "white",
                border: "2px dashed var(--line)",
                borderRadius: "16px",
                fontSize: "20px",
                color: "var(--muted)",
              }}
            >
              <span
                style={{
                  color: "var(--jaune-accent)",
                  fontSize: "28px",
                  display: "block",
                  fontFamily: "'Caveat', cursive",
                  marginBottom: "8px",
                }}
              >
                Hmm…
              </span>
              Aucun outil ne correspond à ces filtres.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
                gap: "16px",
              }}
            >
              {filtered.map((fiche) => (
                <FicheCard
                  key={fiche.id}
                  fiche={fiche}
                  cles={fiche.fichesCles}
                  etape={fiche.etape}
                  onClick={() => setSelectedFiche(fiche)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal */}
      {selectedFiche && (
        <FicheModal
          fiche={selectedFiche}
          cles={selectedFiche.fichesCles}
          etape={selectedFiche.etape}
          onClose={() => setSelectedFiche(null)}
        />
      )}
    </div>
  );
}
