"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getProfileByUserId } from "@/lib/auth";

interface AppHeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenGuide?: () => void;
}

export default function AppHeader({ searchQuery, onSearchChange, onOpenGuide }: AppHeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initials, setInitials] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setIsLoggedIn(true);
        const profile = await getProfileByUserId(session.user.id);
        if (profile?.is_admin) setIsAdmin(true);
        if (profile) {
          setAvatarUrl((profile as any).avatar_url || null);
          const first = profile.prenom?.[0]?.toUpperCase() || "";
          const last = profile.nom?.[0]?.toUpperCase() || "";
          setInitials(first + last || "?");
        }
      }
    }
    checkUser();
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
          {/* Left: logo + back (desktop) */}
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
            <div style={{ display: "flex", gap: "10px", marginLeft: "auto", alignItems: "center" }}>
              <Link
                href="/proposer"
                style={{
                  color: "var(--canard-dark)",
                  textDecoration: "none",
                  background: "var(--canard-light)",
                  padding: "4px 10px",
                  borderRadius: "14px",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                +
              </Link>
              {/* Avatar mobile */}
              {isLoggedIn ? (
                <Link href="/mon-espace" style={{ textDecoration: "none" }}>
                  <div style={{
                    width: "30px", height: "30px", borderRadius: "50%", overflow: "hidden",
                    background: avatarUrl ? "transparent" : "var(--canard-dark)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: "2px solid var(--canard)",
                  }}>
                    {avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="white" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="white" opacity="0.6" /></svg>
                    )}
                  </div>
                </Link>
              ) : (
                <Link href="/mon-espace" style={{
                  color: "white", textDecoration: "none", background: "var(--canard-dark)",
                  padding: "4px 10px", borderRadius: "14px", fontSize: "12px", fontWeight: 600,
                }}>⭐</Link>
              )}
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
          <nav className="app-header-nav-desktop" style={{ gap: "12px", fontSize: "14px", fontWeight: 600, alignItems: "center" }}>
            {onOpenGuide && (
              <button
                onClick={onOpenGuide}
                style={{
                  background: "var(--blanc)",
                  border: "2px solid var(--line-strong)",
                  color: "var(--canard-dark)",
                  padding: "5px 14px",
                  borderRadius: "18px",
                  fontSize: "12px",
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  whiteSpace: "nowrap",
                }}
              >
                Comprendre la BAO
              </button>
            )}
            <Link
              href="/proposer"
              style={{
                color: "var(--canard-dark)",
                textDecoration: "none",
                background: "var(--canard-light)",
                padding: "6px 14px",
                borderRadius: "18px",
                fontSize: "13px",
                fontWeight: 700,
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                whiteSpace: "nowrap",
              }}
            >
              + Proposer un outil
            </Link>
            {/* Avatar desktop */}
            <Link href="/mon-espace" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{
                width: "34px", height: "34px", borderRadius: "50%", overflow: "hidden",
                background: avatarUrl ? "transparent" : "var(--canard-dark)",
                display: "flex", alignItems: "center", justifyContent: "center",
                border: "2.5px solid var(--canard)",
                transition: "border-color 0.2s",
              }}>
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" fill="white" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="white" opacity="0.6" /></svg>
                )}
              </div>
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
