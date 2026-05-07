"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getParcours, getFichesByParcours, slugify, type Parcours } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

export default function ParcoursListPage() {
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [countMap, setCountMap] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function load() {
      const data = await getParcours();
      setParcours(data);
      const counts: Record<string, number> = {};
      await Promise.all(
        data.map(async (p) => {
          const f = await getFichesByParcours(p.id);
          counts[p.id] = f.length;
        })
      );
      setCountMap(counts);
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "var(--blanc)" }}>
      <AppHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div style={{ maxWidth: "1100px", margin: "0 auto", padding: "48px 28px 80px" }}>
        {/* Heading */}
        <div style={{ marginBottom: "40px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, color: "var(--anthracite)", letterSpacing: "-0.02em" }}>
            Parcours guidés
          </h1>
          <p style={{ fontSize: "17px", color: "var(--muted)", marginTop: "8px", maxWidth: "600px", lineHeight: 1.55 }}>
            Des séquences d&apos;outils pensées pour accompagner pas à pas, de la première rencontre à l&apos;autonomie du groupe.
          </p>
        </div>

        {/* Grid */}
        {loading ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} style={{ background: "white", border: "2px solid var(--line)", borderRadius: "16px", padding: "28px", minHeight: "200px" }}>
                <div style={{ height: "32px", width: "32px", background: "#e0e0e0", borderRadius: "8px", marginBottom: "16px" }} />
                <div style={{ height: "20px", background: "#e0e0e0", borderRadius: "4px", width: "70%", marginBottom: "8px" }} />
                <div style={{ height: "14px", background: "#f0f0f0", borderRadius: "4px", width: "90%" }} />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "16px" }}>
            {parcours.map((p) => (
              <Link
                key={p.id}
                href={`/parcours/${slugify(p.titre)}`}
                style={{
                  background: "white",
                  border: "2px solid var(--line)",
                  borderRadius: "16px",
                  padding: "28px",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "transform 0.25s ease, box-shadow 0.25s ease, border-color 0.2s",
                  position: "relative",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 10px 28px rgba(43, 52, 66, 0.08)";
                  e.currentTarget.style.borderColor = p.couleur_hex || "var(--canard)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.borderColor = "var(--line)";
                }}
              >
                {/* Compteur */}
                {countMap[p.id] !== undefined && (
                  <span style={{
                    position: "absolute", top: "16px", right: "16px",
                    background: p.couleur_hex || "var(--canard)", color: "white",
                    fontSize: "12px", fontWeight: 700,
                    width: "26px", height: "26px", borderRadius: "50%",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    {countMap[p.id]}
                  </span>
                )}

                {/* Emoji */}
                <span style={{ fontSize: "36px" }}>{p.emoji || "📋"}</span>

                {/* Titre */}
                <h2 style={{ fontSize: "20px", fontWeight: 700, color: "var(--anthracite)", lineHeight: 1.2 }}>
                  {p.titre}
                </h2>

                {/* Description */}
                {p.description && (
                  <p style={{ fontSize: "14px", color: "var(--muted)", lineHeight: 1.5, flexGrow: 1 }}>
                    {p.description}
                  </p>
                )}

                {/* CTA */}
                <span style={{ fontSize: "13px", fontWeight: 700, color: p.couleur_hex || "var(--canard)", marginTop: "4px" }}>
                  Voir le parcours →
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
