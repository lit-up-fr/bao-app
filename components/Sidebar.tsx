"use client";

import { useState } from "react";
import type { Etape, Cle } from "@/lib/supabase";

interface SidebarProps {
  etapes: Etape[];
  cles: Cle[];
  formats: string[];
  activeEtapes: string[];
  activeCles: string[];
  activeFormats: string[];
  onToggleEtape: (id: string) => void;
  onToggleCle: (id: string) => void;
  onToggleFormat: (f: string) => void;
  onReset: () => void;
  fichesCountByEtape: Record<string, number>;
  fichesCountByCle: Record<string, number>;
}

function Chip({
  label,
  active,
  onClick,
  dotColor,
  code,
  count,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  dotColor?: string;
  code?: string;
  count?: number;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "7px 12px",
        border: `1.5px solid ${active ? "var(--canard-dark)" : "var(--line)"}`,
        background: active ? "var(--canard-dark)" : "white",
        cursor: "pointer",
        fontSize: "13px",
        borderRadius: "18px",
        transition: "all 0.15s",
        userSelect: "none",
        lineHeight: "1.3",
        color: active ? "white" : "var(--anthracite)",
        fontFamily: "inherit",
        width: "100%",
        textAlign: "left",
      }}
    >
      {dotColor && (
        <span
          style={{
            width: "9px",
            height: "9px",
            borderRadius: "50%",
            flexShrink: 0,
            background: active ? "white" : dotColor,
          }}
        />
      )}
      {code && (
        <span
          style={{
            fontWeight: 800,
            fontSize: "12px",
            minWidth: "22px",
            textAlign: "center",
            flexShrink: 0,
          }}
        >
          {code}
        </span>
      )}
      <span style={{ flexGrow: 1 }}>{label}</span>
      {count !== undefined && (
        <span
          style={{
            marginLeft: "auto",
            fontSize: "11px",
            fontWeight: 600,
            color: active ? "white" : "var(--muted)",
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}

function SidebarContent({
  etapes,
  cles,
  formats,
  activeEtapes,
  activeCles,
  activeFormats,
  onToggleEtape,
  onToggleCle,
  onToggleFormat,
  onReset,
  fichesCountByEtape,
  fichesCountByCle,
}: SidebarProps) {
  const hasFilters =
    activeEtapes.length > 0 || activeCles.length > 0 || activeFormats.length > 0;

  return (
    <>
      {/* Étapes */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--anthracite)",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <span>Étape du parcours</span>
          {activeEtapes.length > 0 && (
            <span style={{ color: "var(--canard)", fontSize: "12px" }}>
              {activeEtapes.length}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {etapes.map((etape) => (
            <Chip
              key={etape.id}
              label={etape.nom}
              code={etape.code}
              active={activeEtapes.includes(etape.id)}
              onClick={() => onToggleEtape(etape.id)}
              dotColor={etape.couleur_hex || "var(--canard)"}
              count={fichesCountByEtape[etape.id] || 0}
            />
          ))}
        </div>
      </div>

      {/* Clés d'engagement */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--anthracite)",
            marginBottom: "10px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          <span>Clé d&apos;engagement</span>
          {activeCles.length > 0 && (
            <span style={{ color: "var(--canard)", fontSize: "12px" }}>
              {activeCles.length}
            </span>
          )}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {cles.map((cle) => (
            <Chip
              key={cle.id}
              label={cle.nom.split(" (")[0]}
              active={activeCles.includes(cle.id)}
              onClick={() => onToggleCle(cle.id)}
              dotColor={cle.couleur_hex || "var(--canard)"}
              count={fichesCountByCle[cle.id] || 0}
            />
          ))}
        </div>
      </div>

      {/* Format */}
      <div style={{ marginBottom: "24px" }}>
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            color: "var(--anthracite)",
            marginBottom: "10px",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Format
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          {formats.map((f) => (
            <Chip
              key={f}
              label={f}
              active={activeFormats.includes(f)}
              onClick={() => onToggleFormat(f)}
            />
          ))}
        </div>
      </div>

      {/* Reset */}
      {hasFilters && (
        <button
          onClick={onReset}
          style={{
            width: "100%",
            marginTop: "8px",
            padding: "10px",
            background: "transparent",
            border: "1.5px dashed var(--line-strong)",
            fontFamily: "inherit",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            color: "var(--muted)",
            borderRadius: "14px",
            transition: "all 0.2s",
          }}
        >
          ↺ Réinitialiser les filtres
        </button>
      )}
    </>
  );
}

export default function Sidebar(props: SidebarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const filterCount =
    props.activeEtapes.length + props.activeCles.length + props.activeFormats.length;

  return (
    <>
      <style>{`
        .sidebar-desktop {
          display: block;
        }
        .sidebar-mobile-trigger {
          display: none !important;
        }
        .sidebar-drawer-overlay {
          display: none !important;
        }
        .sidebar-drawer {
          display: none !important;
        }

        @media (max-width: 768px) {
          .sidebar-desktop {
            display: none !important;
          }
          .sidebar-mobile-trigger {
            display: flex !important;
          }
          .sidebar-drawer-overlay {
            display: ${drawerOpen ? "block" : "none"} !important;
          }
          .sidebar-drawer {
            display: ${drawerOpen ? "flex" : "none"} !important;
          }
        }
      `}</style>

      {/* Desktop sidebar */}
      <aside
        className="sidebar-desktop"
        style={{
          borderRight: "2px solid var(--line)",
          padding: "24px 22px",
          position: "sticky",
          top: "70px",
          height: "calc(100vh - 70px)",
          overflowY: "auto",
          background: "white",
          width: "280px",
          flexShrink: 0,
        }}
      >
        <SidebarContent {...props} />
      </aside>

      {/* Mobile: floating filter button */}
      <button
        className="sidebar-mobile-trigger"
        onClick={() => setDrawerOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 40,
          padding: "12px 24px",
          borderRadius: "24px",
          border: "none",
          background: "var(--canard-dark)",
          color: "white",
          fontSize: "14px",
          fontWeight: 700,
          fontFamily: "inherit",
          cursor: "pointer",
          boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>☰ Filtres</span>
        {filterCount > 0 && (
          <span
            style={{
              background: "var(--jaune)",
              color: "var(--anthracite)",
              borderRadius: "10px",
              padding: "2px 8px",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {filterCount}
          </span>
        )}
      </button>

      {/* Mobile: overlay */}
      <div
        className="sidebar-drawer-overlay"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.4)",
          zIndex: 50,
        }}
        onClick={() => setDrawerOpen(false)}
      />

      {/* Mobile: drawer from bottom */}
      <div
        className="sidebar-drawer"
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          maxHeight: "80vh",
          background: "white",
          borderRadius: "20px 20px 0 0",
          zIndex: 51,
          flexDirection: "column",
          boxShadow: "0 -4px 24px rgba(0,0,0,0.15)",
        }}
      >
        {/* Drawer header */}
        <div
          style={{
            padding: "16px 20px 12px",
            borderBottom: "1px solid var(--line)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: "16px", fontWeight: 700, color: "var(--anthracite)" }}>
            Filtres
          </span>
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              background: "none",
              border: "none",
              fontSize: "22px",
              cursor: "pointer",
              color: "var(--muted)",
              padding: "4px 8px",
            }}
          >
            ✕
          </button>
        </div>

        {/* Drawer content */}
        <div style={{ padding: "20px", overflowY: "auto", flex: 1 }}>
          <SidebarContent {...props} />
        </div>

        {/* Drawer footer */}
        <div
          style={{
            padding: "12px 20px 20px",
            borderTop: "1px solid var(--line)",
            flexShrink: 0,
          }}
        >
          <button
            onClick={() => setDrawerOpen(false)}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "12px",
              border: "none",
              background: "var(--canard-dark)",
              color: "white",
              fontSize: "15px",
              fontWeight: 700,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Voir les résultats
          </button>
        </div>
      </div>
    </>
  );
}
