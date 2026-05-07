"use client";

import Link from "next/link";

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function AppHeader({ searchQuery, onSearchChange }: AppHeaderProps) {
  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        background: "white",
        borderBottom: "2px solid var(--line)",
        zIndex: 50,
        padding: "14px 28px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "20px",
      }}
    >
      {/* Left: logo + back + badge */}
      <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-litup.png"
          alt="Lit uP"
          style={{ height: "26px", width: "auto", display: "block" }}
        />
        <Link
          href="/"
          style={{
            background: "transparent",
            border: "2px solid var(--line-strong)",
            padding: "7px 14px",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
            borderRadius: "20px",
            color: "var(--anthracite)",
            textDecoration: "none",
            transition: "all 0.2s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--anthracite)";
            e.currentTarget.style.color = "white";
            e.currentTarget.style.borderColor = "var(--anthracite)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.color = "var(--anthracite)";
            e.currentTarget.style.borderColor = "var(--line-strong)";
          }}
        >
          ← Accueil
        </Link>
        <span
          style={{
            fontSize: "12px",
            fontWeight: 600,
            padding: "5px 12px",
            borderRadius: "12px",
            background: "var(--canard-light)",
            color: "var(--canard-dark)",
          }}
        >
          Tous publics
        </span>
      </div>

      {/* Search */}
      <div style={{ flexGrow: 1, maxWidth: "440px", position: "relative" }}>
        <svg
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            width: "16px",
            height: "16px",
            color: "var(--muted)",
          }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher un outil, un objectif, une méthode…"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 14px 10px 40px",
            border: "2px solid var(--line-strong)",
            background: "white",
            fontFamily: "inherit",
            fontSize: "14px",
            color: "var(--anthracite)",
            borderRadius: "24px",
            outline: "none",
            transition: "border-color 0.2s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--canard)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--line-strong)";
          }}
        />
      </div>

      {/* Right nav */}
      <nav style={{ display: "flex", gap: "16px", fontSize: "14px", fontWeight: 600 }}>
        <Link
          href="/bao"
          style={{ color: "var(--canard)", textDecoration: "none" }}
        >
          Outils
        </Link>
        <Link
          href="/parcours"
          style={{ color: "var(--anthracite)", textDecoration: "none" }}
        >
          Parcours
        </Link>
      </nav>
    </header>
  );
}
