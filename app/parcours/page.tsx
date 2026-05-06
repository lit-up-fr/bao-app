"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getParcours, slugify, type Parcours } from "@/lib/supabase";

export default function ParcoursListPage() {
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParcours().then((data) => {
      setParcours(data);
      setLoading(false);
    });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-10">
        <h1 className="text-3xl font-bold" style={{ color: "#2B3442" }}>Parcours guidés</h1>
        <p className="mt-2" style={{ color: "#2B344299" }}>
          Des séquences d&apos;outils pensées pour accompagner pas à pas,
          de la première rencontre à l&apos;autonomie du groupe.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse">
              <div className="h-5 bg-gray-200 rounded w-1/3 mb-2" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : parcours.length === 0 ? (
        <p className="text-center py-12" style={{ color: "#2B344266" }}>
          Aucun parcours disponible pour le moment.
        </p>
      ) : (
        <div className="space-y-4">
          {parcours.map((p, i) => (
            <Link
              key={p.id}
              href={`/parcours/${slugify(p.titre)}`}
              className="group block bg-white rounded-xl border border-gray-200
                         hover:shadow-lg transition-all duration-300 overflow-hidden"
            >
              <div className="flex items-stretch">
                <div
                  className="flex items-center justify-center w-16 sm:w-20 
                              text-white text-2xl font-bold shrink-0"
                  style={{ backgroundColor: p.couleur_hex || "#00989D" }}
                >
                  {p.emoji || String(i + 1).padStart(2, "0")}
                </div>
                <div className="p-5 flex-1">
                  <h2 className="text-lg font-bold" style={{ color: "#2B3442" }}>
                    {p.titre}
                  </h2>
                  {p.description && (
                    <p className="text-sm mt-1" style={{ color: "#2B344299" }}>
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center pr-5" style={{ color: "#2B344233" }}>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
