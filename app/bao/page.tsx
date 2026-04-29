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
        const [fichesData, clesData] = await Promise.all([
          getFiches(),
          getCles(),
        ]);

        // Load clés for each fiche
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

  // Filter logic
  const filtered = fiches.filter((f) => {
    const matchSearch =
      !searchQuery ||
      f.nom.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.intention || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.pourquoi || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchCle =
      !activeCle ||
      f.fichesCles.some((c) => c.id === activeCle);

    return matchSearch && matchCle;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-litup-dark">
          La boîte à outils
        </h1>
        <p className="mt-2 text-litup-dark/60">
          {fiches.length} outils pour animer, libérer la parole et accompagner les jeunes.
        </p>
      </div>

      {/* Filters */}
      <FilterBar
        cles={cles}
        activeCle={activeCle}
        onCleChange={setActiveCle}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Results count */}
      <p className="text-sm text-litup-dark/50 mt-6 mb-4">
        {filtered.length} outil{filtered.length !== 1 ? "s" : ""} trouvé{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-litup-dark/10 p-5 animate-pulse"
            >
              <div className="h-1 bg-litup-dark/10 rounded mb-4" />
              <div className="h-5 bg-litup-dark/10 rounded w-3/4 mb-2" />
              <div className="h-4 bg-litup-dark/5 rounded w-1/2 mb-4" />
              <div className="h-3 bg-litup-dark/5 rounded w-full mb-1" />
              <div className="h-3 bg-litup-dark/5 rounded w-5/6" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 text-litup-dark/40">
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
