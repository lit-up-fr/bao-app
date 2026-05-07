"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  // Don't protect the login page
  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
      } else if (!isLoginPage) {
        router.push("/admin/login");
      }
      setLoading(false);
    }
    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
        if (!isLoginPage) router.push("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, isLoginPage]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  // Login page: render without layout
  if (isLoginPage) {
    return <>{children}</>;
  }

  // Loading
  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--blanc)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
        Chargement…
      </div>
    );
  }

  // Not authenticated
  if (!user) return null;

  const navItems = [
    { href: "/admin", label: "Tableau de bord", icon: "📊" },
    { href: "/admin/fiches", label: "Fiches", icon: "📝" },
    { href: "/admin/parcours", label: "Parcours", icon: "🗺" },
    { href: "/admin/cles", label: "Clés d'engagement", icon: "🔑" },
    { href: "/admin/etapes", label: "Étapes", icon: "📍" },
  ];

  return (
    <div style={{ minHeight: "100vh", display: "flex", background: "var(--blanc)" }}>
      {/* Sidebar */}
      <aside
        style={{
          width: "260px",
          background: "var(--anthracite)",
          color: "white",
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
        }}
      >
        {/* Logo */}
        <div style={{ padding: "24px 22px", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-litup-white.png"
            alt="Lit uP"
            style={{ height: "28px", width: "auto", display: "block", marginBottom: "8px" }}
          />
          <span style={{ fontSize: "12px", fontWeight: 600, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            Administration
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px" }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  fontSize: "14px",
                  fontWeight: 600,
                  textDecoration: "none",
                  color: isActive ? "white" : "rgba(255,255,255,0.6)",
                  background: isActive ? "rgba(255,255,255,0.12)" : "transparent",
                  transition: "all 0.15s",
                }}
              >
                <span style={{ fontSize: "18px" }}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* User + logout */}
        <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {user.email}
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <Link
              href="/bao"
              style={{
                flex: 1,
                padding: "8px",
                background: "rgba(255,255,255,0.08)",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                textDecoration: "none",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              Voir le site
            </Link>
            <button
              onClick={handleLogout}
              style={{
                flex: 1,
                padding: "8px",
                background: "rgba(255,255,255,0.08)",
                border: "none",
                borderRadius: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: "rgba(255,255,255,0.7)",
                fontFamily: "inherit",
                cursor: "pointer",
              }}
            >
              Déconnexion
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, marginLeft: "260px", padding: "32px 40px" }}>
        {children}
      </main>
    </div>
  );
}
