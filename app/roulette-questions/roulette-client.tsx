"use client";

import { useEffect, useRef, useState } from "react";

const DEFIS = [
  "Trouvez-vous un point commun improbable en 60 secondes, chrono en main.",
  "Devinez chacun le talent caché de l'autre. Puis vérifiez.",
  "Échangez un conseil que vous auriez aimé recevoir à 15 ans.",
  "Prenez une photo ensemble et affichez-la sur la Place du village.",
  "Fais un compliment sincère à la personne scannée. Elle t'en fait un en retour.",
  "Allez saluer ensemble une personne qu'aucun de vous deux ne connaît vraiment.",
  "Allez dessiner ensemble une île sur la carte de la Salle des cartes 2031.",
  "Montrez-vous une des dernières photos de votre téléphone (celle que vous osez montrer !) et racontez-la.",
  "Racontez-vous chacun un endroit où vous vous sentez vraiment bien.",
  "Si vous partiez demain en voyage ensemble, ce serait où ? Mettez-vous d'accord en 60 secondes.",
  "Racontez-vous chacun une personne qui vous a inspiré·e dans votre vie.",
];

// Cadence de la roulette : intervalles croissants (décélération), total ~1,5 s
const SPIN_STEPS = [0, 80, 160, 245, 335, 435, 545, 670, 815, 985, 1185, 1500];

type Phase = "idle" | "spinning" | "result";

export default function RouletteClient() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [displayed, setDisplayed] = useState<string>("");
  const lastIndex = useRef<number>(-1);
  const timeouts = useRef<number[]>([]);

  useEffect(() => {
    const pending = timeouts.current;
    return () => pending.forEach((id) => clearTimeout(id));
  }, []);

  const tirer = () => {
    if (phase === "spinning") return;
    timeouts.current.forEach((id) => clearTimeout(id));
    timeouts.current = [];
    setPhase("spinning");

    let final: number;
    do {
      final = Math.floor(Math.random() * DEFIS.length);
    } while (final === lastIndex.current);

    let shown = final;
    SPIN_STEPS.forEach((delay, i) => {
      const id = window.setTimeout(() => {
        if (i === SPIN_STEPS.length - 1) {
          lastIndex.current = final;
          setDisplayed(DEFIS[final]);
          setPhase("result");
        } else {
          shown = (shown + 1 + Math.floor(Math.random() * (DEFIS.length - 2))) % DEFIS.length;
          setDisplayed(DEFIS[shown]);
        }
      }, delay);
      timeouts.current.push(id);
    });
  };

  return (
    <main className="rd-page">
      <style>{`
        .rd-page {
          min-height: 100dvh;
          background: #FBF6EA;
          background-image:
            radial-gradient(circle at 85% 12%, rgba(252, 195, 62, 0.18), transparent 42%),
            radial-gradient(circle at 10% 90%, rgba(0, 152, 157, 0.10), transparent 45%);
          color: #2B3442;
          font-family: "Source Sans 3", "Source Sans Pro", system-ui, sans-serif;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 32px 20px 40px;
          text-align: center;
          overflow: hidden;
          position: relative;
        }
        .rd-inner {
          width: 100%;
          max-width: 420px;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          z-index: 1;
        }
        .rd-lantern {
          margin-bottom: 10px;
          animation: rd-float 3.4s ease-in-out infinite;
        }
        .rd-lantern .rd-halo {
          animation: rd-glow 2.2s ease-in-out infinite;
          transform-origin: center;
        }
        .rd-firefly {
          position: absolute;
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #FCC33E;
          box-shadow: 0 0 10px 3px rgba(252, 195, 62, 0.65);
          opacity: 0;
          pointer-events: none;
        }
        .rd-firefly-1 { top: 14%; left: 12%; animation: rd-firefly 5.5s ease-in-out infinite; }
        .rd-firefly-2 { top: 24%; right: 10%; animation: rd-firefly 7s ease-in-out 1.8s infinite; }
        .rd-firefly-3 { bottom: 12%; right: 22%; animation: rd-firefly 6.2s ease-in-out 3.1s infinite; }
        .rd-title {
          font-size: clamp(1.9rem, 8vw, 2.4rem);
          font-weight: 800;
          line-height: 1.15;
          margin: 0;
        }
        .rd-title em {
          font-style: normal;
          color: #00989D;
          box-shadow: inset 0 -0.32em 0 rgba(252, 195, 62, 0.45);
        }
        .rd-subtitle {
          font-style: italic;
          font-weight: 600;
          color: #6B2468;
          margin: 10px 0 26px;
          font-size: 1.06rem;
        }
        .rd-card {
          width: 100%;
          min-height: 240px;
          background: #FFFDF6;
          border: 2px dashed #00989D;
          border-radius: 18px;
          box-shadow: 0 8px 24px rgba(43, 52, 66, 0.10);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 26px 22px;
          position: relative;
        }
        .rd-card::before,
        .rd-card::after {
          content: "\\2716";
          position: absolute;
          font-size: 0.85rem;
          color: rgba(252, 195, 62, 0.9);
          font-weight: 700;
        }
        .rd-card::before { top: 10px; left: 14px; }
        .rd-card::after { bottom: 10px; right: 14px; }
        .rd-question-mark {
          font-size: 4.6rem;
          font-weight: 800;
          color: #FCC33E;
          text-shadow: 0 3px 0 rgba(0, 152, 157, 0.25);
        }
        .rd-idle-hint {
          font-size: 1rem;
          color: #2B3442;
          opacity: 0.65;
          margin-top: 6px;
        }
        .rd-defi {
          font-size: clamp(1.25rem, 5.4vw, 1.5rem);
          font-weight: 700;
          line-height: 1.35;
          margin: 0;
        }
        .rd-defi.rd-spinning {
          filter: blur(1.5px);
          opacity: 0.55;
          font-size: 1.05rem;
          font-weight: 600;
        }
        .rd-defi.rd-final {
          animation: rd-pop 0.35s ease-out;
        }
        .rd-footnote {
          font-size: 0.86rem;
          color: #6B2468;
          margin: 14px 0 0;
          opacity: 0.9;
        }
        .rd-button {
          margin-top: 26px;
          width: 100%;
          border: none;
          border-radius: 999px;
          background: #00989D;
          color: #FFFFFF;
          font-family: inherit;
          font-size: 1.25rem;
          font-weight: 700;
          padding: 18px 24px;
          cursor: pointer;
          box-shadow: 0 6px 0 #007A7E, 0 10px 22px rgba(0, 152, 157, 0.35);
          transition: transform 0.12s ease, box-shadow 0.12s ease, opacity 0.2s ease;
          touch-action: manipulation;
        }
        .rd-button:active {
          transform: translateY(4px);
          box-shadow: 0 2px 0 #007A7E, 0 6px 14px rgba(0, 152, 157, 0.3);
        }
        .rd-button:disabled {
          opacity: 0.6;
          cursor: wait;
        }
        @keyframes rd-float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-7px); }
        }
        @keyframes rd-glow {
          0%, 100% { opacity: 0.35; transform: scale(1); }
          50% { opacity: 0.75; transform: scale(1.18); }
        }
        @keyframes rd-firefly {
          0%, 100% { opacity: 0; transform: translate(0, 0); }
          25% { opacity: 0.9; }
          50% { opacity: 0.4; transform: translate(9px, -14px); }
          75% { opacity: 0.85; transform: translate(-6px, -6px); }
        }
        @keyframes rd-pop {
          0% { transform: scale(0.85); opacity: 0; }
          60% { transform: scale(1.05); }
          100% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          .rd-lantern, .rd-lantern .rd-halo, .rd-firefly { animation: none; }
          .rd-defi.rd-final { animation: none; }
        }
      `}</style>

      <span className="rd-firefly rd-firefly-1" aria-hidden="true" />
      <span className="rd-firefly rd-firefly-2" aria-hidden="true" />
      <span className="rd-firefly rd-firefly-3" aria-hidden="true" />

      <div className="rd-inner">
        <svg
          className="rd-lantern"
          width="64"
          height="72"
          viewBox="0 0 64 72"
          aria-hidden="true"
        >
          <circle className="rd-halo" cx="32" cy="42" r="20" fill="#FCC33E" opacity="0.4" />
          <path d="M32 4 v8" stroke="#2B3442" strokeWidth="2.5" strokeLinecap="round" />
          <path
            d="M22 16 a10 4 0 0 1 20 0"
            fill="none"
            stroke="#2B3442"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <rect x="24" y="14" width="16" height="5" rx="2.5" fill="#00989D" />
          <path
            d="M21 22 h22 l3 18 a14 14 0 0 1 -28 0 z"
            fill="#FFFDF6"
            stroke="#00989D"
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <circle cx="32" cy="38" r="6" fill="#FCC33E" />
          <rect x="27" y="58" width="10" height="5" rx="2.5" fill="#00989D" />
        </svg>

        <h1 className="rd-title">
          La roulette des <em>défis</em>
        </h1>
        <p className="rd-subtitle">Scanner, c&apos;était accepter 😏</p>

        <div className="rd-card" aria-live="polite">
          {phase === "idle" ? (
            <div>
              <div className="rd-question-mark">?</div>
              <p className="rd-idle-hint">Un défi vous attend…</p>
            </div>
          ) : (
            <p className={`rd-defi ${phase === "spinning" ? "rd-spinning" : "rd-final"}`}>
              {displayed}
            </p>
          )}
        </div>

        <p className="rd-footnote">
          À réaliser avec la personne que tu viens de scanner. Bonne chance.
        </p>

        <button
          type="button"
          className="rd-button"
          onClick={tirer}
          disabled={phase === "spinning"}
        >
          {phase === "result" ? "Retirer" : "Tirer un défi"}
        </button>
      </div>
    </main>
  );
}
