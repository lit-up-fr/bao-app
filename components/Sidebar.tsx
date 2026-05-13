"use client";

import { useState, useEffect } from "react";
import type { Cle, Objectif } from "@/lib/supabase";

/* ── Tranches de durée ── */
export const DUREE_TRANCHES = [
  { label: "Moins de 15 min", min: 0, max: 14 },
  { label: "15 – 30 min", min: 15, max: 30 },
  { label: "30 – 60 min", min: 31, max: 60 },
  { label: "1h – 3h", min: 61, max: 180 },
] as const;

export type DureeTranche = (typeof DUREE_TRANCHES)[number];

export function parseDureeLibreToMinutes(dureeLibre: string | null): number | null {
  if (!dureeLibre) return null;
  const s = dureeLibre.toLowerCase().trim();
  const hMatch = s.match(/^(\d+)\s*h\s*(\d+)?/);
  if (hMatch) return parseInt(hMatch[1]) * 60 + (parseInt(hMatch[2]) || 0);
  const minMatch = s.match(/^(\d+)\s*min/);
  if (minMatch) return parseInt(minMatch[1]);
  const numMatch = s.match(/^(\d+)/);
  if (numMatch) return parseInt(numMatch[1]);
  return null;
}

interface SidebarProps {
  formats: string[];
  activeFormats: string[];
  onToggleFormat: (f: string) => void;
  activeDurees: number[];
  onToggleDuree: (index: number) => void;
  materiels: string[];
  activMateriels: string[];
  onToggleMateriel: (m: string) => void;
  // En mode "objectifs" (défaut) : clés dans la sidebar
  cles: Cle[];
  activeCles: string[];
  onToggleCle: (id: string) => void;
  // En mode "cles" : objectifs dans la sidebar
  objectifs?: Objectif[];
  activeObjectifs?: string[];
  onToggleObjectif?: (id: string) => void;
  fichesCountByObjectif?: Record<string, number>;
  // Mode d'affichage
  viewMode?: "objectifs" | "cles";
  onReset: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

function Chip({
  label, active, onClick, dotColor, count,
}: {
  label: string; active: boolean; onClick: () => void; dotColor?: string; count?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: "8px",
        padding: "7px 12px",
        border: `1.5px solid ${active ? "var(--canard-dark)" : "var(--line)"}`,
        background: active ? "var(--canard-dark)" : "white",
        cursor: "pointer", fontSize: "13px", borderRadius: "18px",
        transition: "all 0.15s", userSelect: "none", lineHeight: "1.3",
        color: active ? "white" : "var(--anthracite)",
        fontFamily: "inherit", width: "100%", textAlign: "left",
      }}
    >
      {dotColor && (
        <span style={{ width: "9px", height: "9px", borderRadius: "50%", flexShrink: 0, background: active ? "white" : dotColor }} />
      )}
      <span style={{ flexGrow: 1 }}>{label}</span>
      {count !== undefined && count > 0 && (
        <span style={{ marginLeft: "auto", fontSize: "11px", fontWeight: 600, color: active ? "white" : "var(--muted)" }}>{count}</span>
      )}
    </button>
  );
}

function FilterGroup({
  title, activeCount, children, defaultOpen = true,
}: {
  title: string; activeCount?: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  useEffect(() => { setOpen(defaultOpen); }, [defaultOpen]);

  return (
    <div style={{ marginBottom: "20px" }}>
      <button
        onClick={() => setOpen(!open)}
        style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          width: "100%", background: "none", border: "none", cursor: "pointer",
          padding: "0 0 8px 0", fontFamily: "inherit",
        }}
      >
        <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--anthracite)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {title}
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {activeCount !== undefined && activeCount > 0 && (
            <span style={{ fontSize: "10px", fontWeight: 700, color: "white", background: "var(--canard)", borderRadius: "8px", padding: "1px 6px", minWidth: "18px", textAlign: "center" }}>
              {activeCount}
            </span>
          )}
          <span style={{ fontSize: "12px", color: "var(--muted)", transition: "transform 0.15s", transform: open ? "rotate(0)" : "rotate(-90deg)" }}>▼</span>
        </span>
      </button>
      {open && (
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>{children}</div>
      )}
    </div>
  );
}

function SidebarContent(props: SidebarProps) {
  const {
    formats, activeFormats, onToggleFormat,
    activeDurees, onToggleDuree,
    materiels, activMateriels, onToggleMateriel,
    cles, activeCles, onToggleCle,
    objectifs, activeObjectifs, onToggleObjectif, fichesCountByObjectif,
    viewMode = "objectifs",
    onReset, searchQuery, onSearchChange,
  } = props;

  const hasFilters =
    activeFormats.length > 0 || activeDurees.length > 0 ||
    activMateriels.length > 0 || activeCles.length > 0 ||
    (activeObjectifs && activeObjectifs.length > 0) ||
    searchQuery.length > 0;

  return (
    <>
      {/* Recherche */}
      <div style={{ marginBottom: "20px" }}>
        <div style={{ position: "relative" }}>
          <input
            type="text" value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Rechercher un outil…"
            style={{
              width: "100%", padding: "9px 12px 9px 34px",
              border: "1.5px solid var(--line)", borderRadius: "12px",
              fontSize: "13px", fontFamily: "inherit", background: "white",
              color: "var(--anthracite)", outline: "none", boxSizing: "border-box",
              transition: "border-color 0.15s",
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = "var(--canard)"; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = "var(--line)"; }}
          />
          <span style={{ position: "absolute", left: "11px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "var(--muted)", pointerEvents: "none" }}>🔍</span>
          {searchQuery && (
            <button onClick={() => onSearchChange("")} style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: "14px", color: "var(--muted)", padding: "2px 4px" }}>✕</button>
          )}
        </div>
      </div>

      {/* En mode "cles" : objectifs comme filtres dans la sidebar (sans Diagnostic) */}
      {viewMode === "cles" && objectifs && objectifs.length > 0 && onToggleObjectif && (
        <FilterGroup title="Objectif" activeCount={activeObjectifs?.length || 0} defaultOpen={true}>
          {objectifs.filter((obj) => obj.ordre !== 1).map((obj) => (
            <Chip
              key={obj.id}
              label={`${obj.emoji || ""} ${obj.mot_cle || obj.nom}`}
              active={activeObjectifs?.includes(obj.id) || false}
              onClick={() => onToggleObjectif(obj.id)}
              count={fichesCountByObjectif?.[obj.id]}
            />
          ))}
        </FilterGroup>
      )}

      {/* Format */}
      {formats.length > 0 && (
        <FilterGroup title="Format" activeCount={activeFormats.length}>
          {formats.map((f) => (
            <Chip key={f} label={f} active={activeFormats.includes(f)} onClick={() => onToggleFormat(f)} />
          ))}
        </FilterGroup>
      )}

      {/* Durée */}
      <FilterGroup title="Durée" activeCount={activeDurees.length}>
        {DUREE_TRANCHES.map((tranche, i) => (
          <Chip key={i} label={tranche.label} active={activeDurees.includes(i)} onClick={() => onToggleDuree(i)} />
        ))}
      </FilterGroup>

      {/* Matériel */}
      {materiels.length > 0 && (
        <FilterGroup title="Matériel" activeCount={activMateriels.length} defaultOpen={false}>
          {materiels.map((m) => (
            <Chip key={m} label={m} active={activMateriels.includes(m)} onClick={() => onToggleMateriel(m)} />
          ))}
        </FilterGroup>
      )}

      {/* En mode "objectifs" (défaut) : clés de motivation dans la sidebar */}
      {viewMode === "objectifs" && cles.length > 0 && (
        <FilterGroup title="Clé de motivation" activeCount={activeCles.length} defaultOpen={false}>
          {cles.map((cle) => (
            <Chip
              key={cle.id}
              label={cle.nom.split(" (")[0]}
              active={activeCles.includes(cle.id)}
              onClick={() => onToggleCle(cle.id)}
              dotColor={cle.couleur_hex || "var(--canard)"}
            />
          ))}
        </FilterGroup>
      )}

      {/* Reset */}
      {hasFilters && (
        <button onClick={onReset} style={{
          width: "100%", marginTop: "8px", padding: "10px", background: "transparent",
          border: "1.5px dashed var(--line-strong)", fontFamily: "inherit", fontSize: "12px",
          fontWeight: 600, cursor: "pointer", color: "var(--muted)", borderRadius: "14px",
        }}>
          ↺ Réinitialiser les filtres
        </button>
      )}
    </>
  );
}

export default function Sidebar(props: SidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterCount =
    props.activeFormats.length + props.activeDurees.length +
    props.activMateriels.length + props.activeCles.length +
    (props.activeObjectifs?.length || 0) +
    (props.searchQuery ? 1 : 0);

  return (
    <>
      <style>{`
        .sidebar-desktop { display: block; }
        .sidebar-mobile-trigger { display: none !important; }
        .sidebar-drawer-overlay { display: none !important; }
        .sidebar-drawer { display: none !important; }
        @media (max-width: 768px) {
          .sidebar-desktop { display: none !important; }
          .sidebar-mobile-trigger { display: flex !important; }
          .sidebar-drawer-overlay { display: ${drawerOpen ? "block" : "none"} !important; }
          .sidebar-drawer { display: ${drawerOpen ? "flex" : "none"} !important; }
        }
      `}</style>

      <aside className="sidebar-desktop" style={{
        borderRight: "2px solid var(--line)", padding: "20px 18px",
        position: "sticky", top: "70px", height: "calc(100vh - 70px)",
        overflowY: "auto", background: "white", width: "260px", flexShrink: 0,
      }}>
        <SidebarContent {...props} />
      </aside>

      <button className="sidebar-mobile-trigger" onClick={() => setDrawerOpen(true)} style={{
        position: "fixed", bottom: "20px", left: "50%", transform: "translateX(-50%)",
        zIndex: 40, padding: "12px 24px", borderRadius: "24px", border: "none",
        background: "var(--canard-dark)", color: "white", fontSize: "14px", fontWeight: 700,
        fontFamily: "inherit", cursor: "pointer", boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        alignItems: "center", gap: "8px",
      }}>
        <span>☰ Filtres</span>
        {filterCount > 0 && (
          <span style={{ background: "var(--jaune)", color: "var(--anthracite)", borderRadius: "10px", padding: "2px 8px", fontSize: "12px", fontWeight: 700 }}>{filterCount}</span>
        )}
      </button>

      <div className="sidebar-drawer-overlay" style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 50 }} onClick={() => setDrawerOpen(false)} />

      <div className="sidebar-drawer" style={{
        position: "fixed", bottom: 0, left: 0, right: 0, maxHeight: "80vh",
        background: "white", borderRadius: "20px 20px 0 0", zIndex: 51,
        flexDirection: "column", boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
      }}>
        <div style={{ padding: "16px 20px 12px", borderBottom: "1px solid var(--line)", display: "flex", justifyContent: "space-between", alignItems: "center", flexShrink: 0 }}>
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--anthracite)" }}>Filtres</span>
          <button onClick={() => setDrawerOpen(false)} style={{ background: "none", border: "none", fontSize: "22px", cursor: "pointer", color: "var(--muted)", padding: "4px 8px" }}>✕</button>
        </div>
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          <SidebarContent {...props} />
        </div>
        <div style={{ padding: "12px 20px 20px", borderTop: "1px solid var(--line)", flexShrink: 0 }}>
          <button onClick={() => setDrawerOpen(false)} style={{
            width: "100%", padding: "14px", borderRadius: "12px", border: "none",
            background: "var(--canard-dark)", color: "white", fontSize: "15px", fontWeight: 700,
            fontFamily: "inherit", cursor: "pointer",
          }}>Voir les résultats</button>
        </div>
      </div>
    </>
  );
}
