"use client";

import { useEffect, useState } from "react";
import { getFiches, getCles, getClesByFiche, type Fiche, type Cle } from "@/lib/supabase";
import FicheCard from "@/components/FicheCard";
import FilterBar from "@/components/FilterBar";

interface FicheWithCles extends Fiche {
  fichesCles: Cle[];
}

export default function BaoPage() {
  const [fiches, setFiches] = useState<FicheWithCles[]>([]);
  const [cles, setCles] = useState<Cle[]>([]);
  const [activeCle, setActiveCle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [fichesData, clesData] = await Promise.all([getFiches(), getCles()]);
        const fichesWithCles = await Promise.all(
          fichesData.map(async (f) => {
            const ficheCles = await getClesByFiche(f.id);
            return { ...f, fichesCles: ficheCles };
          })
        );
        setFiches(fichesWithCles);
        setCles(clesData);
      } catch (err) {
        console.error("Erreur chargement données:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filtered = fiches.filter((f) => {
    const matchSearch = !searchQuery ||
      f.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.intention || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.pourquoi || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchCle = !activeCle || f.fichesCles.some((c) => c.id === activeCle);
    return matchSearch && matchCle;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold" style={{ color: "#2B3442" }}>La boîte à outils</h1>
        <p className="mt-2" style={{ color: "rgba(43,52,66,0.55)" }}>
          {fiches.length} outils pour animer, libérer la parole et accompagner les jeunes.
        </p>
      </div>

      <FilterBar cles={cles} activeCle={activeCle} onCleChange={setActiveCle}
        searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <p className="text-sm mt-6 mb-4" style={{ color: "rgba(43,52,66,0.45)" }}>
        {filtered.length} outil{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
      </p>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-5 animate-pulse" style={{ borderColor: "rgba(43,52,66,0.1)" }}>
              <div className="h-1 bg-gray-200 rounded mb-4" />
              <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-1/2 mb-4" />
              <div className="h-3 bg-gray-100 rounded w-full mb-1" />
              <div className="h-3 bg-gray-100 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(43,52,66,0.35)" }}>
          <p className="text-lg">Aucun outil trouvé.</p>
          <p className="text-sm mt-1">Essayez un autre mot-clé ou changez de filtre.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((fiche) => (
            <FicheCard key={fiche.id} fiche={fiche} cles={fiche.fichesCles} />
          ))}
        </div>
      )}
    </div>
  );
}
