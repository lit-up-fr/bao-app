"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getParcours, slugify, type Parcours } from "@/lib/supabase";

export default function ParcoursListPage() {
  const [parcours, setParcours] = useState<Parcours[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getParcours().then((data) => { setParcours(data); setLoading(false); });
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold" style={{ color: "#2B3442" }}>Parcours guidés</h1>
        <p className="mt-3 text-lg" style={{ color: "rgba(43,52,66,0.55)" }}>
          Des séquences d&apos;outils pensées pour accompagner pas à pas,
          de la première rencontre à l&apos;autonomie du groupe.
        </p>
      </div>

      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border p-6 animate-pulse" style={{ borderColor: "rgba(43,52,66,0.08)" }}>
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-100 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : parcours.length === 0 ? (
        <div className="text-center py-16" style={{ color: "rgba(43,52,66,0.35)" }}>
          <p className="text-lg">Aucun parcours disponible pour le moment.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {parcours.map((p, i) => (
            <Link key={p.id} href={`/parcours/${slugify(p.titre)}`}
              className="group block bg-white rounded-xl border overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
              style={{ borderColor: "rgba(43,52,66,0.08)" }}>
              <div className="flex items-stretch">
                <div className="flex items-center justify-center w-20 shrink-0 text-2xl"
                  style={{ backgroundColor: p.couleur_hex || "#00989D", color: "white" }}>
                  <span className="font-bold">{p.emoji || String(i + 1).padStart(2, "0")}</span>
                </div>
                <div className="p-5 flex-1 min-w-0">
                  <h2 className="text-lg font-bold transition-colors" style={{ color: "#2B3442" }}>
                    {p.titre}
                  </h2>
                  {p.description && (
                    <p className="text-sm mt-1 line-clamp-2" style={{ color: "rgba(43,52,66,0.55)" }}>
                      {p.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center pr-5 transition-colors" style={{ color: "rgba(43,52,66,0.2)" }}>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
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
