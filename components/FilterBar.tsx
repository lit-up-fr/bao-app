"use client";

import { useState } from "react";
import type { Cle } from "@/lib/supabase";

interface FilterBarProps {
  cles: Cle[];
  activeCle: string | null;
  onCleChange: (cleId: string | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function FilterBar({
  cles,
  activeCle,
  onCleChange,
  searchQuery,
  onSearchChange,
}: FilterBarProps) {
  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-litup-dark/40"
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          type="text"
          placeholder="Rechercher un outil..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-litup-dark/15 
                     bg-white text-sm placeholder:text-litup-dark/40
                     focus:border-litup-teal focus:ring-1 focus:ring-litup-teal/30
                     transition-colors"
        />
      </div>

      {/* Clé filters */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCleChange(null)}
          className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all
            ${!activeCle
              ? "bg-litup-teal text-white shadow-sm"
              : "bg-litup-dark/5 text-litup-dark/60 hover:bg-litup-dark/10"
            }`}
        >
          Tous
        </button>
        {cles.map((cle) => (
          <button
            key={cle.id}
            onClick={() => onCleChange(cle.id === activeCle ? null : cle.id)}
            className={`text-xs px-3 py-1.5 rounded-full font-semibold transition-all
              ${cle.id === activeCle
                ? "bg-litup-teal text-white shadow-sm"
                : "bg-litup-dark/5 text-litup-dark/60 hover:bg-litup-dark/10"
              }`}
          >
            {cle.nom}
          </button>
        ))}
      </div>
    </div>
  );
}
