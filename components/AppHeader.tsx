"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileByUserId } from "@/lib/auth";

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function AppHeader({ searchQuery, onSearchChange }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await getProfileByUserId(session.user.id);
        if (profile?.is_admin) setIsAdmin(true);
      }
    }
    checkAdmin();
  }, []);

  return (
    <>
      <style>{`
        .app-header-desktop-left { display: flex; }
        .app-header-search-desktop { display: block; }
        .app-header-nav-desktop { display: flex; }
        .app-header-mobile-icons { display: none; }
        .app-header-search-mobile { display: none; }

        @media (max-width: 768px) {
          .app-header-desktop-left { display: none !important; }
          .app-header-search-desktop { display: none !important; }
          .app-header-nav-desktop { display: none !important; }
          .app-header-mobile-icons { display: flex !important; }
          .app-header-search-mobile { display: ${searchOpen ? "block" : "none"} !important; }
        }
      `}</style>

      <header
        style={{
          position: "sticky",
          top: 0,
          background: "white",
          borderBottom: "2px solid var(--line)",
          zIndex: 50,
        }}
      >
        {/* Main bar */}
        <div
          style={{
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          {/* Left: logo + back + badge (desktop) */}
          <div className="app-header-desktop-left" style={{ alignItems: "center", gap: "18px" }}>
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
                whiteSpace: "nowrap",
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
                whiteSpace: "nowrap",
              }}
            >
              Tous publics
            </span>
          </div>

          {/* Mobile: logo only */}
          <div className="app-header-mobile-icons" style={{ alignItems: "center", gap: "12px", flex: 1 }}>
            <Link href="/" style={{ display: "flex", alignItems: "center" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-litup.png"
                alt="Lit uP"
                style={{ height: "24px", width: "auto" }}
              />
            </Link>

            {/* Mobile nav links */}
            <div style={{ display: "flex", gap: "12px", marginLeft: "auto", alignItems: "center" }}>
              <Link
                href="/bao"
                style={{ color: "var(--canard)", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}
              >
                Outils
              </Link>
              <Link
                href="/parcours"
                style={{ color: "var(--anthracite)", textDecoration: "none", fontSize: "14px", fontWeight: 600 }}
              >
                Parcours
              </Link>
              <Link
                href="/mon-espace"
                style={{
                  color: "white",
                  textDecoration: "none",
                  background: "var(--canard-dark)",
                  padding: "4px 10px",
                  borderRadius: "14px",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                ⭐
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  style={{
                    color: "white",
                    textDecoration: "none",
                    background: "var(--anthracite)",
                    padding: "4px 10px",
                    borderRadius: "14px",
                    fontSize: "12px",
                    fontWeight: 600,
                  }}
                >
                  ⚙
                </Link>
              )}
              <button
                onClick={() => setSearchOpen(!searchOpen)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "4px",
                  color: "var(--anthracite)",
                }}
                aria-label="Rechercher"
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <circle cx="11" cy="11" r="8" />
                  <path d="m21 21-4.3-4.3" />
                </svg>
              </button>
            </div>
          </div>

          {/* Search (desktop) */}
          <div className="app-header-search-desktop" style={{ flexGrow: 1, maxWidth: "440px", position: "relative" }}>
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
            />
          </div>

          {/* Right nav (desktop) */}
          <nav className="app-header-nav-desktop" style={{ gap: "16px", fontSize: "14px", fontWeight: 600, alignItems: "center" }}>
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
            <Link
              href="/proposer"
              style={{ color: "var(--anthracite)", textDecoration: "none" }}
            >
              Proposer
            </Link>
            <Link
              href="/mon-espace"
              style={{
                color: "white",
                textDecoration: "none",
                background: "var(--canard-dark)",
                padding: "6px 14px",
                borderRadius: "18px",
                fontSize: "13px",
              }}
            >
              Mon espace
            </Link>
            {isAdmin && (
              <Link
                href="/admin"
                style={{
                  color: "white",
                  textDecoration: "none",
                  background: "var(--anthracite)",
                  padding: "6px 14px",
                  borderRadius: "18px",
                  fontSize: "13px",
                }}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        {/* Search bar mobile (slide down) */}
        <div
          className="app-header-search-mobile"
          style={{
            padding: "0 16px 12px",
            position: "relative",
          }}
        >
          <svg
            style={{
              position: "absolute",
              left: "30px",
              top: "50%",
              transform: "translateY(-75%)",
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
            placeholder="Rechercher un outil…"
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
            }}
            autoFocus
          />
        </div>
      </header>
    </>
  );
}
