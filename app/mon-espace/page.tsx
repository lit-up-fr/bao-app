"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import {
  getProfileByUserId,
  getFavoris,
  signOut,
  Profile,
} from "@/lib/auth";
import { getFiches, type Fiche } from "@/lib/supabase";
import AuthGuard from "@/components/AuthGuard";

function DashboardContent() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [favoris, setFavoris] = useState<Fiche[]>([]);
  const [recents, setRecents] = useState<Fiche[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const [prof, allFiches, favIds] = await Promise.all([
          getProfileByUserId(session.user.id),
          getFiches(),
          getFavoris(session.user.id),
        ]);

        setProfile(prof);

        // Fiches favorites
        const favFiches = allFiches.filter((f) => favIds.includes(f.id));
        setFavoris(favFiches);

        // Dernières consultations
        const { data: consultData } = await supabase
          .from("consultations")
          .select("fiche_id, consulted_at")
          .eq("user_id", session.user.id)
          .order("consulted_at", { ascending: false })
          .limit(10);

        if (consultData) {
          // Dédoublonner par fiche_id (garder la plus récente)
          const seen = new Set<string>();
          const uniqueIds: string[] = [];
          for (const c of consultData) {
            if (!seen.has(c.fiche_id)) {
              seen.add(c.fiche_id);
              uniqueIds.push(c.fiche_id);
            }
          }
          const recentFiches = uniqueIds
            .map((id) => allFiches.find((f) => f.id === id))
            .filter(Boolean) as Fiche[];
          setRecents(recentFiches.slice(0, 6));
        }
      } catch (e) {
        console.error("Erreur chargement dashboard:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6b7280" }}>
        Chargement...
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f8f9fa" }}>
      {/* Header */}
      <header
        style={{
          background: "#2B3442",
          padding: "20px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <Link href="/">
            <img src="/logo-litup-white.png" alt="Lit uP" style={{ height: "28px", cursor: "pointer" }} />
          </Link>
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}>|</span>
          <span style={{ color: "white", fontSize: "16px", fontWeight: 600 }}>Mon espace</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/bao"
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
              fontSize: "13px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Boîte à Outils
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "8px 16px",
              borderRadius: "8px",
              background: "rgba(255,255,255,0.1)",
              border: "none",
              color: "rgba(255,255,255,0.8)",
              fontSize: "13px",
              fontWeight: 600,
              fontFamily: "inherit",
              cursor: "pointer",
            }}
          >
            Déconnexion
          </button>
        </div>
      </header>

      <div style={{ maxWidth: "960px", margin: "0 auto", padding: "32px 20px" }}>
        {/* Welcome */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2B3442", marginBottom: "4px" }}>
            Bonjour {profile?.prenom} !
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Retrouvez vos outils favoris et votre activité récente.
          </p>
        </div>

        {/* Quick stats */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px", marginBottom: "36px" }}>
          <StatCard value={favoris.length} label="Outils favoris" color="#00989D" icon="⭐" />
          <StatCard value={recents.length} label="Consultés récemment" color="#FCC33E" icon="👁" />
        </div>

        {/* Favoris */}
        <Section
          title="Mes favoris"
          icon="⭐"
          emptyMessage="Vous n'avez pas encore ajouté d'outils en favoris. Explorez la Boîte à Outils et cliquez sur l'étoile pour en ajouter !"
          fiches={favoris}
          emptyAction={{ label: "Explorer la Boîte à Outils", href: "/bao" }}
        />

        {/* Récents */}
        <Section
          title="Consultés récemment"
          icon="👁"
          emptyMessage="Aucune consultation récente."
          fiches={recents}
        />

        {/* Mon profil */}
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "24px",
            marginTop: "16px",
          }}
        >
          <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#2B3442", marginBottom: "16px" }}>
            Mon profil
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px" }}>
            <ProfileRow label="Nom" value={`${profile?.prenom} ${profile?.nom}`} />
            <ProfileRow label="Email" value={profile?.email} />
            <ProfileRow label="Structure" value={profile?.structure} />
            <ProfileRow label="Poste" value={profile?.poste} />
            <ProfileRow label="Catégorie" value={
              profile?.categorie_pro === "Autre" ? profile?.categorie_pro_autre : profile?.categorie_pro
            } />
            <ProfileRow label="Région" value={profile?.region} />
            <ProfileRow label="Public accompagné" value={profile?.public_accompagne} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ value, label, color, icon }: { value: number; label: string; color: string; icon: string }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "12px",
        border: "1px solid #e5e7eb",
        padding: "20px",
        display: "flex",
        alignItems: "center",
        gap: "14px",
      }}
    >
      <div
        style={{
          width: "44px",
          height: "44px",
          borderRadius: "10px",
          background: `${color}15`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "20px",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "24px", fontWeight: 700, color: "#2B3442" }}>{value}</div>
        <div style={{ fontSize: "13px", color: "#6b7280" }}>{label}</div>
      </div>
    </div>
  );
}

function Section({
  title,
  icon,
  emptyMessage,
  fiches,
  emptyAction,
}: {
  title: string;
  icon: string;
  emptyMessage: string;
  fiches: Fiche[];
  emptyAction?: { label: string; href: string };
}) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <h2 style={{ fontSize: "18px", fontWeight: 700, color: "#2B3442", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
        <span>{icon}</span> {title}
      </h2>
      {fiches.length === 0 ? (
        <div
          style={{
            background: "white",
            borderRadius: "12px",
            border: "1px solid #e5e7eb",
            padding: "32px",
            textAlign: "center",
          }}
        >
          <p style={{ color: "#9ca3af", fontSize: "14px", marginBottom: emptyAction ? "16px" : "0" }}>
            {emptyMessage}
          </p>
          {emptyAction && (
            <Link
              href={emptyAction.href}
              style={{
                display: "inline-block",
                padding: "10px 24px",
                borderRadius: "8px",
                background: "#00989D",
                color: "white",
                fontSize: "14px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              {emptyAction.label}
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {fiches.map((f) => (
            <Link
              key={f.id}
              href={`/bao/${f.slug || f.id}`}
              style={{ textDecoration: "none" }}
            >
              <div
                style={{
                  background: "white",
                  borderRadius: "12px",
                  border: "1px solid #e5e7eb",
                  padding: "18px",
                  transition: "box-shadow 0.15s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = "0 2px 12px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div style={{ fontSize: "15px", fontWeight: 600, color: "#2B3442", marginBottom: "6px" }}>
                  {f.nom}
                </div>
                {f.intention && (
                  <p style={{ fontSize: "13px", color: "#6b7280", lineHeight: "1.4", margin: 0 }}>
                    {f.intention.slice(0, 100)}{f.intention.length > 100 ? "…" : ""}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function ProfileRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={{ fontSize: "12px", color: "#9ca3af", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.3px" }}>
        {label}
      </div>
      <div style={{ color: value ? "#2B3442" : "#d1d5db", marginTop: "2px" }}>
        {value || "Non renseigné"}
      </div>
    </div>
  );
}

export default function MonEspacePage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
