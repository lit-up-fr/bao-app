"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { getProfileByUserId, Profile } from "@/lib/auth";
import type { User } from "@supabase/supabase-js";
import {
  LayoutDashboard,
  FileText,
  Target,
  Key,
  Users,
  Lightbulb,
  Bot,
  TrendingUp,
  Map,
  MapPin,
  type LucideIcon,
} from "lucide-react";

// Définition des rôles et permissions
type AdminRole = "super_admin" | "editor" | "moderator" | "analyst" | "pedagogical_reviewer";

const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  editor: "Éditeur",
  moderator: "Modérateur",
  analyst: "Analyste",
  pedagogical_reviewer: "Responsable validation pédago",
};

interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  roles: AdminRole[];
  deprecated?: boolean;
}

const ALL_NAV_ITEMS: NavItem[] = [
  // Tableau de bord accessible à tous les admins
  { href: "/admin", label: "Tableau de bord", icon: LayoutDashboard, roles: ["super_admin", "editor", "moderator", "analyst", "pedagogical_reviewer"] },
  // Contenu de la BAO (Editor)
  { href: "/admin/fiches", label: "Fiches", icon: FileText, roles: ["super_admin", "editor"] },
  { href: "/admin/objectifs", label: "Objectifs", icon: Target, roles: ["super_admin", "editor"] },
  { href: "/admin/cles", label: "Clés d'engagement", icon: Key, roles: ["super_admin", "editor"] },
  // Gestion des utilisateurs (Modérateur)
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: Users, roles: ["super_admin", "moderator"] },
  // Validation pédagogique : Propositions + Analyses IA (Responsable validation pédago)
  { href: "/admin/propositions", label: "Propositions", icon: Lightbulb, roles: ["super_admin", "pedagogical_reviewer"] },
  { href: "/admin/analyses-ia", label: "Analyses IA", icon: Bot, roles: ["super_admin", "pedagogical_reviewer"] },
  // Analytics (Analyste)
  { href: "/admin/analytics", label: "Analytics", icon: TrendingUp, roles: ["super_admin", "analyst"] },
  // Pages dépréciées (ancien modèle)
  { href: "/admin/parcours", label: "Parcours", icon: Map, roles: ["super_admin", "editor"], deprecated: true },
  { href: "/admin/etapes", label: "Étapes", icon: MapPin, roles: ["super_admin", "editor"], deprecated: true },
];

// 🆕 hasAccess et canAccessPath travaillent maintenant avec un tableau de rôles.
// L'utilisateur a accès s'il possède AU MOINS UN des rôles autorisés (ou est super_admin).
function hasAccess(roles: AdminRole[] | null, allowedRoles: AdminRole[]): boolean {
  if (!roles || roles.length === 0) return false;
  if (roles.includes("super_admin")) return true;
  return roles.some((r) => allowedRoles.includes(r));
}

function canAccessPath(roles: AdminRole[] | null, pathname: string): boolean {
  if (!roles || roles.length === 0) return false;
  if (roles.includes("super_admin")) return true;

  // Tableau de bord accessible à tous les admins
  if (pathname === "/admin") return true;

  // Vérifier chaque nav item
  const matchingItem = ALL_NAV_ITEMS.find(
    (item) => item.href !== "/admin" && pathname.startsWith(item.href)
  );
  if (matchingItem) return hasAccess(roles, matchingItem.roles);

  // Par défaut, refuser
  return false;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  // 🆕 On lit admin_roles (tableau) en priorité.
  // Fallbacks pour compat : admin_role (ancien text), puis is_admin → super_admin.
  const adminRoles: AdminRole[] | null = (() => {
    if (!profile) return null;
    const rolesArray = (profile as any).admin_roles as string[] | undefined;
    if (rolesArray && rolesArray.length > 0) {
      return rolesArray.filter((r) => r) as AdminRole[];
    }
    if (profile.admin_role) {
      return [profile.admin_role as AdminRole];
    }
    if (profile.is_admin) {
      return ["super_admin"];
    }
    return null;
  })();

  useEffect(() => {
    async function checkAuth() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        const prof = await getProfileByUserId(session.user.id);
        setProfile(prof);

        // Vérifier que l'utilisateur est bien admin
        if (!prof?.is_admin) {
          router.push("/bao");
          return;
        }
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
        setProfile(null);
        if (!isLoginPage) router.push("/admin/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [router, isLoginPage]);

  // Vérifier l'accès à la page courante
  useEffect(() => {
    if (!loading && profile && adminRoles && !isLoginPage) {
      if (!canAccessPath(adminRoles, pathname)) {
        router.push("/admin");
      }
    }
  }, [pathname, adminRoles, loading, profile, router, isLoginPage]);

  // Fermer le menu quand on change de page
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  if (isLoginPage) return <>{children}</>;

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "var(--blanc)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
        Chargement…
      </div>
    );
  }

  if (!user || !profile) return null;

  // Filtrer les items de navigation selon le rôle
  const navItems = ALL_NAV_ITEMS.filter((item) => hasAccess(adminRoles, item.roles));

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            width: 280px !important;
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            margin-left: 0 !important;
            padding: 16px !important;
            padding-top: 72px !important;
          }
          .admin-overlay {
            display: block !important;
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.4);
            z-index: 40;
          }
          .admin-mobile-header {
            display: flex !important;
          }
          .admin-table-responsive {
            overflow-x: auto;
          }
        }
        @media (min-width: 769px) {
          .admin-sidebar {
            transform: translateX(0) !important;
          }
          .admin-overlay {
            display: none !important;
          }
          .admin-mobile-header {
            display: none !important;
          }
        }
      `}</style>

      <div style={{ minHeight: "100vh", display: "flex", background: "var(--blanc)" }}>
        {/* Mobile header bar */}
        <div
          className="admin-mobile-header"
          style={{
            display: "none",
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: "56px",
            background: "var(--anthracite)",
            zIndex: 45,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 16px",
          }}
        >
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              color: "white",
              fontSize: "24px",
              cursor: "pointer",
              padding: "4px 8px",
            }}
          >
            {menuOpen ? "✕" : "☰"}
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-litup-white.png"
            alt="Lit uP"
            style={{ height: "24px" }}
          />
          <div style={{ width: "40px" }} />
        </div>

        {/* Overlay mobile */}
        {menuOpen && (
          <div
            className="admin-overlay"
            style={{ display: "none" }}
            onClick={() => setMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`admin-sidebar${menuOpen ? " open" : ""}`}
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
          <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
            {navItems.filter((item) => !item.deprecated).map((item) => {
              const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
              const Icon = item.icon;
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
                  <Icon size={18} strokeWidth={2} />
                  {item.label}
                </Link>
              );
            })}

            {/* Deprecated items */}
            {navItems.filter((item) => item.deprecated).length > 0 && (
              <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
                <div style={{ fontSize: "10px", fontWeight: 600, color: "rgba(255,255,255,0.25)", textTransform: "uppercase", letterSpacing: "0.06em", padding: "4px 14px 8px", }}>
                  Ancien modèle
                </div>
                {navItems.filter((item) => item.deprecated).map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                        padding: "8px 14px",
                        borderRadius: "10px",
                        fontSize: "13px",
                        fontWeight: 600,
                        textDecoration: "none",
                        color: isActive ? "rgba(255,255,255,0.5)" : "rgba(255,255,255,0.25)",
                        background: isActive ? "rgba(255,255,255,0.06)" : "transparent",
                        transition: "all 0.15s",
                      }}
                    >
                      <Icon size={16} strokeWidth={2} style={{ opacity: 0.5 }} />
                      {item.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </nav>

          {/* User + role + logout */}
          <div style={{ padding: "16px 14px", borderTop: "1px solid rgba(255,255,255,0.1)" }}>
            <div style={{ fontSize: "12px", color: "rgba(255,255,255,0.5)", marginBottom: "2px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {user.email}
            </div>
            {adminRoles && adminRoles.length > 0 && (
              <div style={{
                fontSize: "10px",
                fontWeight: 700,
                color: adminRoles.includes("super_admin") ? "#FCC33E" : "rgba(255,255,255,0.4)",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                marginBottom: "8px",
                lineHeight: 1.4,
              }}>
                {adminRoles.map((r) => ROLE_LABELS[r] || r).join(" · ")}
              </div>
            )}
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
        <main className="admin-main" style={{ flex: 1, marginLeft: "260px", padding: "32px 40px" }}>
          {children}
        </main>
      </div>
    </>
  );
}
