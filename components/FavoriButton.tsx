"use client";

import { useState } from "react";
import { toggleFavori } from "@/lib/auth";

interface FavoriButtonProps {
  ficheId: string;
  userId: string | null;
  isFavori: boolean;
  onToggle?: (newState: boolean) => void;
  size?: "small" | "medium";
}

export default function FavoriButton({
  ficheId,
  userId,
  isFavori: initialFavori,
  onToggle,
  size = "small",
}: FavoriButtonProps) {
  const [favori, setFavori] = useState(initialFavori);
  const [loading, setLoading] = useState(false);

  if (!userId) return null;

  async function handleClick(e: React.MouseEvent) {
    e.stopPropagation();
    e.preventDefault();
    if (loading) return;

    setLoading(true);
    try {
      const newState = await toggleFavori(userId!, ficheId);
      setFavori(newState);
      onToggle?.(newState);
    } catch (err) {
      console.error("Erreur favori:", err);
    } finally {
      setLoading(false);
    }
  }

  const dim = size === "medium" ? 36 : 28;

  return (
    <button
      onClick={handleClick}
      title={favori ? "Retirer des favoris" : "Ajouter aux favoris"}
      style={{
        width: `${dim}px`,
        height: `${dim}px`,
        borderRadius: "50%",
        border: "none",
        background: favori ? "#FCC33E" : "rgba(0,0,0,0.05)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size === "medium" ? "18px" : "14px",
        transition: "all 0.2s",
        flexShrink: 0,
        opacity: loading ? 0.5 : 1,
      }}
    >
      {favori ? "★" : "☆"}
    </button>
  );
}
