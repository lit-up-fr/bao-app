"use client";

import type { Cle } from "@/lib/supabase";

interface FilterBarProps {
  cles: Cle[];
  activeCle: string | null;
  onCleChange: (cleId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FilterBar({ cles, activeCle, onCleChange, searchQuery, onSearchChange }: FilterBarProps) {
  return (
    <div className="space-y-4">
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "rgba(43,52,66,0.35)" }}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
        </svg>
        <input type="text" placeholder="Rechercher un outil..."
          value={searchQuery} onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border bg-white text-sm transition-colors focus:outline-none focus:ring-2"
          style={{ borderColor: "rgba(43,52,66,0.12)", color: "#2B3442" }}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => onCleChange(null)}
          className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
          style={{
            backgroundColor: !activeCle ? "#00989D" : "rgba(43,52,66,0.06)",
            color: !activeCle ? "white" : "rgba(43,52,66,0.55)",
          }}>
          Tous
        </button>
        {cles.map((cle) => (
          <button key={cle.id} onClick={() => onCleChange(cle.id === activeCle ? null : cle.id)}
            className="text-xs px-3 py-1.5 rounded-full font-semibold transition-all"
            style={{
              backgroundColor: cle.id === activeCle ? (cle.couleur_hex || "#00989D") : "rgba(43,52,66,0.06)",
              color: cle.id === activeCle ? "white" : "rgba(43,52,66,0.55)",
            }}>
            {cle.nom}
          </button>
        ))}
      </div>
    </div>
  );
}
