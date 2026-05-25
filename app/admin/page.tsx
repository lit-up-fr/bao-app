"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import { FileText, ClipboardList, Key, MapPin, Map, type LucideIcon } from "lucide-react";

interface Stats {
  totalFiches: number;
  publishedFiches: number;
  draftFiches: number;
  totalCles: number;
  totalEtapes: number;
  totalParcours: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    async function loadStats() {
      const [
        { count: totalFiches },
        { count: publishedFiches },
        { count: totalCles },
        { count: totalEtapes },
        { count: totalParcours },
      ] = await Promise.all([
        supabase.from("fiches").select("*", { count: "exact", head: true }),
        supabase.from("fiches").select("*", { count: "exact", head: true }).eq("publie", true),
        supabase.from("cles").select("*", { count: "exact", head: true }),
        supabase.from("etapes_parcours").select("*", { count: "exact", head: true }),
        supabase.from("parcours_guides").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalFiches: totalFiches || 0,
        publishedFiches: publishedFiches || 0,
        draftFiches: (totalFiches || 0) - (publishedFiches || 0),
        totalCles: totalCles || 0,
        totalEtapes: totalEtapes || 0,
        totalParcours: totalParcours || 0,
      });
    }
    loadStats();
  }, []);

  const cards: Array<{ label: string; value: number; color: string; href: string; icon: LucideIcon }> = stats
    ? [
        { label: "Fiches publiées", value: stats.publishedFiches, color: "var(--canard)", href: "/admin/fiches", icon: FileText },
        { label: "Brouillons", value: stats.draftFiches, color: "var(--jaune-accent)", href: "/admin/fiches", icon: ClipboardList },
        { label: "Clés d'engagement", value: stats.totalCles, color: "var(--prune)", href: "/admin/cles", icon: Key },
        { label: "Étapes de parcours", value: stats.totalEtapes, color: "var(--anthracite)", href: "/admin/etapes", icon: MapPin },
        { label: "Parcours guidés", value: stats.totalParcours, color: "var(--canard-dark)", href: "/admin/parcours", icon: Map },
      ]
    : [];

  return (
    <div>
      <div style={{ marginBottom: "36px" }}>
        <h1 style={{ fontSize: "30px", fontWeight: 800, color: "var(--anthracite)", letterSpacing: "-0.02em" }}>
          Tableau de bord
        </h1>
        <p style={{ fontSize: "15px", color: "var(--muted)", marginTop: "4px" }}>
          Vue d&apos;ensemble de la boîte à outils Lit uP
        </p>
      </div>

      {!stats ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} style={{ background: "white", border: "2px solid var(--line)", borderRadius: "16px", padding: "24px", height: "120px" }} />
          ))}
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.href}
                style={{
                  background: "white",
                  border: "2px solid var(--line)",
                  borderRadius: "16px",
                  padding: "24px",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "transform 0.2s, box-shadow 0.2s, border-color 0.2s",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(43,52,66,0.08)";
                  e.currentTarget.style.borderColor = card.color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--line)";
                }}
              >
                <Icon size={28} strokeWidth={2} color={card.color} />
                <span style={{ fontSize: "36px", fontWeight: 800, color: card.color, lineHeight: 1 }}>
                  {card.value}
                </span>
                <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--muted)" }}>
                  {card.label}
                </span>
              </Link>
            );
          })}
        </div>
      )}

      {/* Quick actions */}
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--anthracite)", marginBottom: "16px" }}>
          Actions rapides
        </h2>
        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <Link
            href="/admin/fiches/new"
            style={{
              padding: "12px 20px",
              background: "var(--canard)",
              color: "white",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            + Nouvelle fiche
          </Link>
          <Link
            href="/bao"
            style={{
              padding: "12px 20px",
              background: "white",
              color: "var(--anthracite)",
              border: "2px solid var(--line-strong)",
              borderRadius: "12px",
              fontSize: "14px",
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            Voir le site public
          </Link>
        </div>
      </div>
    </div>
  );
}
