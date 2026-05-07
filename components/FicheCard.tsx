"use client";

import type { Fiche, Cle, Etape } from "@/lib/supabase";
import { formatDuree } from "@/lib/supabase";
import FavoriButton from "@/components/FavoriButton";

interface FicheCardProps {
  fiche: Fiche;
  cles: Cle[];
  etape: Etape | null;
  onClick: () => void;
  userId?: string | null;
  isFavori?: boolean;
  onFavoriToggle?: (ficheId: string, newState: boolean) => void;
}

export default function FicheCard({ fiche, cles, etape, onClick, userId, isFavori, onFavoriToggle }: FicheCardProps) {
  const duree = formatDuree(fiche);
  const stepColor = etape?.couleur_hex || "var(--muted)";

  return (
    <button
      onClick={onClick}
      style={{
        background: "white",
        padding: "22px",
        cursor: "pointer",
        transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s",
        display: "flex",
        flexDirection: "column",
        minHeight: "260px",
        border: "2px solid var(--line)",
        textAlign: "left",
        fontFamily: "inherit",
        color: "inherit",
        position: "relative",
        borderRadius: "16px",
        overflow: "hidden",
        width: "100%",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = "0 10px 28px rgba(43, 52, 66, 0.08)";
        e.currentTarget.style.borderColor = "var(--canard)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = "none";
        e.currentTarget.style.borderColor = "var(--line)";
      }}
    >
      {/* Colored top bar */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: stepColor,
        }}
      />

      {/* Header: step badge + favori + audience */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: "12px",
          gap: "10px",
        }}
      >
        {etape ? (
          <span
            style={{
              fontSize: "12px",
              fontWeight: 800,
              letterSpacing: "0.04em",
              padding: "4px 10px",
              borderRadius: "12px",
              color: "white",
              flexShrink: 0,
              textTransform: "uppercase",
              background: stepColor,
            }}
          >
            {etape.code}
          </span>
        ) : (
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: "var(--muted)",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
            }}
          >
            Non classé
          </span>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          {userId && (
            <FavoriButton
              ficheId={fiche.id}
              userId={userId}
              isFavori={isFavori || false}
              onToggle={(newState) => onFavoriToggle?.(fiche.id, newState)}
            />
          )}
          {fiche.public_pro_pair && (
            <span
              style={{
                fontSize: "9px",
                letterSpacing: "0.08em",
                color: "var(--muted)",
                fontWeight: 700,
                textTransform: "uppercase",
                background: "var(--blanc)",
                padding: "3px 7px",
                borderRadius: "8px",
              }}
            >
              {fiche.public_pro_pair}
            </span>
          )}
        </div>
      </div>

      {/* Title */}
      <div
        style={{
          fontSize: "20px",
          lineHeight: 1.2,
          fontWeight: 700,
          letterSpacing: "-0.01em",
          marginBottom: "8px",
          color: "var(--anthracite)",
        }}
      >
        {fiche.nom}
      </div>

      {/* Intention / pitch */}
      {fiche.intention && (
        <p
          style={{
            fontSize: "13px",
            lineHeight: 1.45,
            color: "var(--muted)",
            margin: "0 0 14px 0",
            flexGrow: 1,
            fontStyle: "italic",
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {fiche.intention}
        </p>
      )}

      {/* Meta pills */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "5px",
          marginBottom: "12px",
        }}
      >
        {duree && (
          <span
            style={{
              fontSize: "11px",
              padding: "3px 9px",
              borderRadius: "10px",
              background: "var(--blanc)",
              color: "var(--anthracite-soft)",
              fontWeight: 500,
            }}
          >
            ⏱ {duree}
          </span>
        )}
        {fiche.format && (
          <span
            style={{
              fontSize: "11px",
              padding: "3px 9px",
              borderRadius: "10px",
              background: "var(--blanc)",
              color: "var(--anthracite-soft)",
              fontWeight: 500,
            }}
          >
            {fiche.format}
          </span>
        )}
        {fiche.materiel && (
          <span
            style={{
              fontSize: "11px",
              padding: "3px 9px",
              borderRadius: "10px",
              background: "var(--blanc)",
              color: "var(--anthracite-soft)",
              fontWeight: 500,
            }}
          >
            {fiche.materiel}
          </span>
        )}
      </div>

      {/* Key pills */}
      {cles.length > 0 && (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "4px",
            marginTop: "auto",
            paddingTop: "12px",
            borderTop: "1px dashed var(--line)",
          }}
        >
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
              {cle.nom.split(" (")[0]}
            </span>
          ))}
        </div>
      )}
    </button>
  );
}
