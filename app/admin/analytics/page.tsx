"use client";

import { useEffect, useState, useMemo } from "react";
import { supabase } from "@/lib/supabase";

interface Consultation {
  user_id: string;
  fiche_id: string;
  consulted_at: string;
}

interface Favori {
  user_id: string;
  fiche_id: string;
}

interface RetourRow {
  fiche_id: string;
  note: number | null;
}

interface FicheRow {
  id: string;
  nom: string;
  format: string | null;
  etape_id: string | null;
}

interface ProfileRow {
  id: string;
  prenom: string;
  nom: string;
  email: string;
  region: string | null;
  categorie_pro: string | null;
  structure: string | null;
  public_accompagne: string | null;
  tranche_age: string | null;
  status: string;
  is_admin: boolean;
  last_seen_at: string | null;
  created_at: string;
}

interface GlobalStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  totalConsultations: number;
  totalFavoris: number;
  totalRetours: number;
  totalPropositions: number;
}

type Tab = "outils" | "utilisateurs" | "repartition";

export default function AdminAnalyticsPage() {
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [favoris, setFavoris] = useState<Favori[]>([]);
  const [retours, setRetours] = useState<RetourRow[]>([]);
  const [fiches, setFiches] = useState<FicheRow[]>([]);
  const [global, setGlobal] = useState<GlobalStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("outils");

  // Filtres
  const [filterRegion, setFilterRegion] = useState<string>("all");
  const [filterCategorie, setFilterCategorie] = useState<string>("all");
  const [filterPublic, setFilterPublic] = useState<string>("all");
  const [filterAge, setFilterAge] = useState<string>("all");

  useEffect(() => {
    async function load() {
      try {
        const [
          { count: totalUsers },
          { count: activeUsers },
          { count: pendingUsers },
          { count: totalConsultations },
          { count: totalFavoris },
          { count: totalRetours },
          { count: totalPropositions },
        ] = await Promise.all([
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false).eq("status", "active"),
          supabase.from("profiles").select("*", { count: "exact", head: true }).eq("status", "en_attente"),
          supabase.from("consultations").select("*", { count: "exact", head: true }),
          supabase.from("favoris").select("*", { count: "exact", head: true }),
          supabase.from("retours").select("*", { count: "exact", head: true }),
          supabase.from("propositions").select("*", { count: "exact", head: true }),
        ]);

        setGlobal({
          totalUsers: totalUsers || 0,
          activeUsers: activeUsers || 0,
          pendingUsers: pendingUsers || 0,
          totalConsultations: totalConsultations || 0,
          totalFavoris: totalFavoris || 0,
          totalRetours: totalRetours || 0,
          totalPropositions: totalPropositions || 0,
        });

        const [profilesRes, consultRes, favorisRes, retoursRes, fichesRes] = await Promise.all([
          supabase.from("profiles").select("id, prenom, nom, email, region, categorie_pro, structure, public_accompagne, tranche_age, status, is_admin, last_seen_at, created_at").eq("is_admin", false),
          supabase.from("consultations").select("user_id, fiche_id, consulted_at"),
          supabase.from("favoris").select("user_id, fiche_id"),
          supabase.from("retours").select("fiche_id, note"),
          supabase.from("fiches").select("id, nom, format, etape_id").eq("publie", true),
        ]);

        setProfiles((profilesRes.data as ProfileRow[]) || []);
        setConsultations((consultRes.data as Consultation[]) || []);
        setFavoris((favorisRes.data as Favori[]) || []);
        setRetours((retoursRes.data as RetourRow[]) || []);
        setFiches((fichesRes.data as FicheRow[]) || []);
      } catch (e) {
        console.error("Erreur analytics:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Options de filtres (valeurs uniques)
  const regions = useMemo(() => [...new Set(profiles.map((p) => p.region).filter(Boolean))].sort() as string[], [profiles]);
  const categories = useMemo(() => [...new Set(profiles.map((p) => p.categorie_pro).filter(Boolean))].sort() as string[], [profiles]);
  const publics = useMemo(() => {
    const all = new Set<string>();
    profiles.forEach((p) => {
      if (p.public_accompagne) {
        p.public_accompagne.split(", ").forEach((v) => { if (v.trim()) all.add(v.trim()); });
      }
    });
    return [...all].sort();
  }, [profiles]);
  const ages = useMemo(() => [...new Set(profiles.map((p) => p.tranche_age).filter(Boolean))].sort() as string[], [profiles]);

  // Filtrer les user_ids selon les filtres
  const filteredUserIds = useMemo(() => {
    return new Set(
      profiles
        .filter((p) => {
          if (filterRegion !== "all" && p.region !== filterRegion) return false;
          if (filterCategorie !== "all" && p.categorie_pro !== filterCategorie) return false;
          if (filterPublic !== "all" && !(p.public_accompagne || "").includes(filterPublic)) return false;
          if (filterAge !== "all" && p.tranche_age !== filterAge) return false;
          return true;
        })
        .map((p) => p.id)
    );
  }, [profiles, filterRegion, filterCategorie, filterPublic, filterAge]);

  const hasFilters = filterRegion !== "all" || filterCategorie !== "all" || filterPublic !== "all" || filterAge !== "all";

  // Stats outils filtrées
  const ficheStats = useMemo(() => {
    const filteredConsultations = consultations.filter((c) => filteredUserIds.has(c.user_id));
    const filteredFavoris = favoris.filter((f) => filteredUserIds.has(f.user_id));

    return fiches.map((f) => {
      const fConsult = filteredConsultations.filter((c) => c.fiche_id === f.id);
      const fFav = filteredFavoris.filter((fv) => fv.fiche_id === f.id);
      const fRet = retours.filter((r) => r.fiche_id === f.id);
      const notes = fRet.filter((r) => r.note !== null).map((r) => r.note as number);
      return {
        ...f,
        nb_consultations: fConsult.length,
        nb_consultants: new Set(fConsult.map((c) => c.user_id)).size,
        nb_favoris: fFav.length,
        nb_retours: fRet.length,
        note_moyenne: notes.length > 0 ? Math.round((notes.reduce((a, b) => a + b, 0) / notes.length) * 10) / 10 : null,
      };
    });
  }, [fiches, consultations, favoris, retours, filteredUserIds]);

  // Niveaux d'activité utilisateurs
  const userActivity = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return profiles.map((p) => {
      const userConsult = consultations.filter((c) => c.user_id === p.id);
      const recentConsult = userConsult.filter((c) => new Date(c.consulted_at) > thirtyDaysAgo);
      const userFav = favoris.filter((f) => f.user_id === p.id);

      let level: "frequent" | "regular" | "occasional" | "inactive";
      if (recentConsult.length >= 10) level = "frequent";
      else if (recentConsult.length >= 3) level = "regular";
      else if (userConsult.length > 0) level = "occasional";
      else level = "inactive";

      return {
        ...p,
        total_consultations: userConsult.length,
        recent_consultations: recentConsult.length,
        nb_favoris: userFav.length,
        level,
      };
    });
  }, [profiles, consultations, favoris]);

  const levelCounts = useMemo(() => ({
    frequent: userActivity.filter((u) => u.level === "frequent").length,
    regular: userActivity.filter((u) => u.level === "regular").length,
    occasional: userActivity.filter((u) => u.level === "occasional").length,
    inactive: userActivity.filter((u) => u.level === "inactive").length,
  }), [userActivity]);

  const [activityFilter, setActivityFilter] = useState<"all" | "frequent" | "regular" | "occasional" | "inactive">("all");

  const filteredActivity = useMemo(() => {
    const list = activityFilter === "all" ? userActivity : userActivity.filter((u) => u.level === activityFilter);
    return [...list].sort((a, b) => b.total_consultations - a.total_consultations);
  }, [userActivity, activityFilter]);

  // Répartition
  const regionStats = useMemo(() => {
    const map: Record<string, { total: number; actifs: number }> = {};
    profiles.forEach((p) => {
      const key = p.region || "Non renseigné";
      if (!map[key]) map[key] = { total: 0, actifs: 0 };
      map[key].total++;
      if (p.status === "active") map[key].actifs++;
    });
    return Object.entries(map).map(([region, v]) => ({ region, ...v })).sort((a, b) => b.total - a.total);
  }, [profiles]);

  const categorieStats = useMemo(() => {
    const map: Record<string, { total: number; actifs: number }> = {};
    profiles.forEach((p) => {
      const key = p.categorie_pro || "Non renseigné";
      if (!map[key]) map[key] = { total: 0, actifs: 0 };
      map[key].total++;
      if (p.status === "active") map[key].actifs++;
    });
    return Object.entries(map).map(([cat, v]) => ({ categorie: cat, ...v })).sort((a, b) => b.total - a.total);
  }, [profiles]);

  if (loading) {
    return <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>Chargement des analytics...</div>;
  }

  const topConsulted = [...ficheStats].sort((a, b) => b.nb_consultations - a.nb_consultations).slice(0, 10);
  const topFavoris = [...ficheStats].sort((a, b) => b.nb_favoris - a.nb_favoris).slice(0, 10);
  const topNotes = [...ficheStats].filter((f) => f.note_moyenne).sort((a, b) => (b.note_moyenne || 0) - (a.note_moyenne || 0)).slice(0, 10);

  const selectStyle: React.CSSProperties = {
    padding: "7px 12px",
    borderRadius: "8px",
    border: "1.5px solid #d1d5db",
    fontSize: "12px",
    fontFamily: "inherit",
    color: "#2B3442",
    cursor: "pointer",
    background: "white",
    fontWeight: 600,
  };

  const levelColors = {
    frequent: { bg: "#d1fae5", text: "#065f46", label: "Fréquent (10+ /mois)" },
    regular: { bg: "#dbeafe", text: "#1e40af", label: "Régulier (3-9 /mois)" },
    occasional: { bg: "#fef3c7", text: "#92400e", label: "Occasionnel" },
    inactive: { bg: "#fee2e2", text: "#991b1b", label: "Inactif" },
  };

  return (
    <div>
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2B3442", marginBottom: "4px" }}>Analytics</h1>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>Vue d'ensemble de l'activité de la Boîte à Outils</p>
      </div>

      {/* Global stats */}
      {global && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: "12px", marginBottom: "28px" }}>
          <StatCard value={global.totalUsers} label="Utilisateurs" color="#2B3442" />
          <StatCard value={global.activeUsers} label="Actifs" color="#10b981" />
          <StatCard value={global.pendingUsers} label="En attente" color="#f59e0b" />
          <StatCard value={global.totalConsultations} label="Consultations" color="#00989D" />
          <StatCard value={global.totalFavoris} label="Favoris" color="#FCC33E" />
          <StatCard value={global.totalRetours} label="Retours" color="#6B2468" />
          <StatCard value={global.totalPropositions} label="Propositions" color="#6366f1" />
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: "4px", marginBottom: "20px", background: "#f3f4f6", borderRadius: "12px", padding: "4px" }}>
        {([
          { key: "outils" as Tab, label: "Classement outils" },
          { key: "utilisateurs" as Tab, label: "Activité utilisateurs" },
          { key: "repartition" as Tab, label: "Répartition" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1,
              padding: "10px 16px",
              borderRadius: "10px",
              border: "none",
              background: tab === t.key ? "white" : "transparent",
              color: tab === t.key ? "#2B3442" : "#6b7280",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
              boxShadow: tab === t.key ? "0 1px 3px rgba(0,0,0,0.1)" : "none",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB : Outils ═══ */}
      {tab === "outils" && (
        <>
          {/* Filtres */}
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "16px 20px", marginBottom: "20px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
              <span style={{ fontSize: "13px", fontWeight: 700, color: "#2B3442" }}>Filtrer par profil :</span>

              <select style={selectStyle} value={filterRegion} onChange={(e) => setFilterRegion(e.target.value)}>
                <option value="all">Toutes régions</option>
                {regions.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>

              <select style={selectStyle} value={filterCategorie} onChange={(e) => setFilterCategorie(e.target.value)}>
                <option value="all">Toutes catégories</option>
                {categories.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>

              <select style={selectStyle} value={filterPublic} onChange={(e) => setFilterPublic(e.target.value)}>
                <option value="all">Tous publics</option>
                {publics.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>

              <select style={selectStyle} value={filterAge} onChange={(e) => setFilterAge(e.target.value)}>
                <option value="all">Toutes tranches d'âge</option>
                {ages.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>

              {hasFilters && (
                <button
                  onClick={() => { setFilterRegion("all"); setFilterCategorie("all"); setFilterPublic("all"); setFilterAge("all"); }}
                  style={{ padding: "7px 14px", borderRadius: "8px", border: "1px dashed #d1d5db", background: "transparent", fontSize: "12px", fontWeight: 600, cursor: "pointer", color: "#6b7280", fontFamily: "inherit" }}
                >
                  ↺ Réinitialiser
                </button>
              )}
            </div>
            {hasFilters && (
              <div style={{ marginTop: "8px", fontSize: "12px", color: "#00989D", fontWeight: 600 }}>
                {filteredUserIds.size} utilisateur{filteredUserIds.size > 1 ? "s" : ""} correspondent aux filtres
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2B3442", marginBottom: "16px" }}>🔥 Les plus consultés</h3>
              {topConsulted.filter((f) => f.nb_consultations > 0).map((f, i) => (
                <RankRow key={f.id} rank={i + 1} label={f.nom} value={f.nb_consultations} suffix="consult." maxValue={topConsulted[0]?.nb_consultations || 1} color="#00989D" />
              ))}
              {topConsulted.filter((f) => f.nb_consultations > 0).length === 0 && <EmptyState />}
            </div>

            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2B3442", marginBottom: "16px" }}>⭐ Les plus mis en favoris</h3>
              {topFavoris.filter((f) => f.nb_favoris > 0).map((f, i) => (
                <RankRow key={f.id} rank={i + 1} label={f.nom} value={f.nb_favoris} suffix="favoris" maxValue={topFavoris[0]?.nb_favoris || 1} color="#FCC33E" />
              ))}
              {topFavoris.filter((f) => f.nb_favoris > 0).length === 0 && <EmptyState />}
            </div>

            <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "20px", gridColumn: "1 / -1" }}>
              <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2B3442", marginBottom: "16px" }}>🏆 Les mieux notés</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                {topNotes.map((f, i) => (
                  <div key={f.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px 12px", borderRadius: "8px", background: "#f9fafb" }}>
                    <span style={{ fontSize: "12px", fontWeight: 700, color: "#9ca3af", width: "20px" }}>#{i + 1}</span>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "#2B3442", flex: 1 }}>{f.nom}</span>
                    <span style={{ fontSize: "14px", color: "#FCC33E" }}>{"★".repeat(Math.round(f.note_moyenne || 0))}</span>
                    <span style={{ fontSize: "12px", color: "#6b7280" }}>{f.note_moyenne}/5</span>
                    <span style={{ fontSize: "11px", color: "#9ca3af" }}>({f.nb_retours})</span>
                  </div>
                ))}
              </div>
              {topNotes.length === 0 && <EmptyState />}
            </div>
          </div>
        </>
      )}

      {/* ═══ TAB : Utilisateurs ═══ */}
      {tab === "utilisateurs" && (
        <>
          {/* Level cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px", marginBottom: "20px" }}>
            {(["frequent", "regular", "occasional", "inactive"] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => setActivityFilter(activityFilter === lvl ? "all" : lvl)}
                style={{
                  padding: "16px",
                  borderRadius: "12px",
                  border: activityFilter === lvl ? `2px solid ${levelColors[lvl].text}` : "1px solid #e5e7eb",
                  background: activityFilter === lvl ? levelColors[lvl].bg : "white",
                  cursor: "pointer",
                  textAlign: "left",
                  fontFamily: "inherit",
                }}
              >
                <div style={{ fontSize: "28px", fontWeight: 800, color: levelColors[lvl].text }}>{levelCounts[lvl]}</div>
                <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>{levelColors[lvl].label}</div>
              </button>
            ))}
          </div>

          {/* Table */}
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={thStyle}>Nom</th>
                  <th style={thStyle}>Structure</th>
                  <th style={thStyle}>Région</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Consultations</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>30 derniers j.</th>
                  <th style={{ ...thStyle, textAlign: "center" }}>Favoris</th>
                  <th style={thStyle}>Niveau</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivity.slice(0, 50).map((u) => {
                  const lc = levelColors[u.level];
                  return (
                    <tr key={u.id} style={{ borderTop: "1px solid #f3f4f6" }}>
                      <td style={tdStyle}>
                        <div style={{ fontWeight: 600, color: "#2B3442", fontSize: "13px" }}>{u.prenom} {u.nom}</div>
                        <div style={{ fontSize: "11px", color: "#9ca3af" }}>{u.email}</div>
                      </td>
                      <td style={{ ...tdStyle, fontSize: "13px" }}>{u.structure || "—"}</td>
                      <td style={{ ...tdStyle, fontSize: "13px" }}>{u.region || "—"}</td>
                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: 700, color: "#2B3442" }}>{u.total_consultations}</td>
                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, color: "#00989D" }}>{u.recent_consultations}</td>
                      <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, color: "#FCC33E" }}>{u.nb_favoris}</td>
                      <td style={tdStyle}>
                        <span style={{ fontSize: "11px", fontWeight: 600, padding: "3px 10px", borderRadius: "12px", background: lc.bg, color: lc.text }}>
                          {lc.label.split(" (")[0]}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filteredActivity.length === 0 && (
              <div style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>Aucun utilisateur</div>
            )}
            {filteredActivity.length > 50 && (
              <div style={{ padding: "12px", textAlign: "center", color: "#9ca3af", fontSize: "13px", borderTop: "1px solid #f3f4f6" }}>
                Affichage des 50 premiers sur {filteredActivity.length}
              </div>
            )}
          </div>
        </>
      )}

      {/* ═══ TAB : Répartition ═══ */}
      {tab === "repartition" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2B3442", marginBottom: "20px" }}>Par catégorie professionnelle</h3>
            {categorieStats.map((c) => (
              <BarRow key={c.categorie} label={c.categorie} value={c.total} activeValue={c.actifs} maxValue={categorieStats[0]?.total || 1} color="#00989D" />
            ))}
            {categorieStats.length === 0 && <EmptyState />}
          </div>

          <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "24px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "#2B3442", marginBottom: "20px" }}>Par région</h3>
            {regionStats.map((r) => (
              <BarRow key={r.region} label={r.region} value={r.total} activeValue={r.actifs} maxValue={regionStats[0]?.total || 1} color="#6B2468" />
            ))}
            {regionStats.length === 0 && <EmptyState />}
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  fontSize: "12px",
  fontWeight: 600,
  color: "#6b7280",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 14px",
  fontSize: "14px",
  color: "#374151",
};

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "16px", textAlign: "center" }}>
      <div style={{ fontSize: "26px", fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px", fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function RankRow({ rank, label, value, suffix, maxValue, color }: { rank: number; label: string; value: number; suffix: string; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div style={{ marginBottom: "10px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
        <span style={{ fontSize: "11px", fontWeight: 700, color: "#9ca3af", width: "20px" }}>#{rank}</span>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#2B3442", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
        <span style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", whiteSpace: "nowrap" }}>{value} {suffix}</span>
      </div>
      <div style={{ height: "6px", background: "#f3f4f6", borderRadius: "3px", marginLeft: "28px" }}>
        <div style={{ height: "100%", background: color, borderRadius: "3px", width: `${pct}%`, transition: "width 0.5s ease" }} />
      </div>
    </div>
  );
}

function BarRow({ label, value, activeValue, maxValue, color }: { label: string; value: number; activeValue: number; maxValue: number; color: string }) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div style={{ marginBottom: "14px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "4px" }}>
        <span style={{ fontSize: "13px", fontWeight: 600, color: "#2B3442" }}>{label}</span>
        <span style={{ fontSize: "12px", color: "#6b7280" }}>
          {value} · <span style={{ color: "#10b981", fontWeight: 600 }}>{activeValue} actifs</span>
        </span>
      </div>
      <div style={{ height: "8px", background: "#f3f4f6", borderRadius: "4px" }}>
        <div style={{ height: "100%", background: color, borderRadius: "4px", width: `${pct}%`, transition: "width 0.5s ease", opacity: 0.7 }} />
      </div>
    </div>
  );
}

function EmptyState() {
  return <div style={{ padding: "20px", textAlign: "center", color: "#9ca3af", fontSize: "13px" }}>Pas encore de données</div>;
}
