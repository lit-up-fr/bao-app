"use client";

import { useState } from "react";
import Link from "next/link";

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);

  const slides = [
    // Slide 0 : Philosophie BAO
    <div key="philo" style={{ textAlign: "center", padding: "10px 0" }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: "var(--canard)", marginBottom: "8px" }}>
        Bienvenue !
      </div>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", lineHeight: 1.2, marginBottom: "16px" }}>
        La Boîte à Outils{" "}
        <span style={{ color: "var(--canard)" }}>Lit uP</span>
      </h2>
      <div style={{ textAlign: "left", fontSize: "15px", color: "var(--anthracite)", lineHeight: 1.7, marginBottom: "20px" }}>
        <p style={{ marginBottom: "12px" }}>
          🚀 L'objectif de cette BAO est de diffuser largement des outils pédagogiques (créés par Lit uP ou identifiés comme pertinents) et de permettre aux professionnels de l'éducation et de l'insertion de partager entre eux des ressources efficaces pour engager les jeunes dans leurs parcours, développer leur confiance en eux et en leur capacité à réussir.
        </p>
        <p style={{ marginBottom: "12px" }}>
          Nous sommes persuadés que la force de notre communauté éducative réside à la fois dans l'engagement de chacun, et dans l'échange et la mutualisation de nos idées et ressources.
        </p>
        <p style={{ marginBottom: "12px" }}>
          💸 L'accès à la BAO est <strong>gratuit</strong>, illimité dans le temps, partageable à tout acteur de l'éducation intéressé, et nous souhaitons que cela reste ainsi !
        </p>
      </div>
      <div style={{ background: "#e0f3f4", borderRadius: "14px", padding: "18px 20px", textAlign: "left" }}>
        <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--canard-dark)", marginBottom: "10px" }}>
          🙌 Nous comptons sur vous pour contribuer !
        </div>
        <div style={{ fontSize: "13px", color: "var(--anthracite)", lineHeight: 1.6 }}>
          <div style={{ marginBottom: "4px" }}>1. Envoyez vos commentaires à la lecture des déroulés</div>
          <div style={{ marginBottom: "4px" }}>2. Partagez vos retours d'expérience après utilisation</div>
          <div style={{ marginBottom: "4px" }}>3. Proposez des outils qui vous semblent pertinents</div>
          <div>4. Partagez la BAO à vos collègues</div>
        </div>
      </div>
    </div>,

    // Slide 1 : Comment utiliser la BAO
    <div key="intro" style={{ textAlign: "center", padding: "10px 0" }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: "var(--canard)", marginBottom: "8px" }}>
        01 — Comment utiliser cette boîte ?
      </div>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", lineHeight: 1.2, marginBottom: "16px" }}>
        40 outils, organisés selon{" "}
        <span style={{ color: "var(--canard)" }}>deux logiques complémentaires</span>.
      </h2>
      <p style={{ fontSize: "15px", color: "var(--anthracite)", lineHeight: 1.6, marginBottom: "24px" }}>
        Vous pouvez chercher un outil de deux façons :
      </p>
      <div className="welcome-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", textAlign: "left" }}>
        <div style={{ background: "#e0f3f4", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--canard-dark)", marginBottom: "8px" }}>
            ① Par objectif
          </div>
          <p style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.5, margin: 0 }}>
            Que souhaitez-vous faire ? <strong>Cadrer</strong> votre groupe, renforcer la <strong>cohésion</strong>, favoriser l'<strong>expression</strong>, travailler la <strong>connaissance de soi</strong>, lancer des <strong>projets</strong>, faire un <strong>bilan</strong>…
          </p>
        </div>
        <div style={{ background: "#fff7df", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--jaune-accent)", marginBottom: "8px" }}>
            ② Par clé de motivation
          </div>
          <p style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.5, margin: 0 }}>
            Qu'est-ce que vous cherchez à activer chez les jeunes ? Le <strong>sens</strong>, le <strong>plaisir</strong>, la <strong>sécurité</strong>, le <strong>pouvoir d'agir</strong>… ?
          </p>
        </div>
      </div>
      <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "20px" }}>
        Vous pouvez aussi utiliser le <strong>diagnostic</strong> pour identifier les leviers de motivation de votre groupe et trouver les outils adaptés.
      </p>
    </div>,

    // Slide 2 : Les 9 clés d'engagement
    <div key="cles" style={{ padding: "10px 0" }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: "var(--canard)", marginBottom: "8px" }}>
        02 — Le cadre scientifique
      </div>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", lineHeight: 1.2, marginBottom: "12px" }}>
        Les 9 clés{" "}
        <span style={{ color: "var(--canard)" }}>de la motivation</span>
      </h2>
      <p style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.6, marginBottom: "24px" }}>
        La motivation repose sur la satisfaction de <strong>3 besoins psychologiques fondamentaux</strong> (théorie de l'autodétermination, Deci &amp; Ryan). Chaque besoin se décline en 3 clés concrètes à activer.
      </p>
      <div className="welcome-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        {/* Autonomie */}
        <div style={{ borderRadius: "14px", border: "2px solid #E67E22", overflow: "hidden" }}>
          <div style={{ height: "4px", background: "#E67E22" }} />
          <div style={{ padding: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--anthracite)", marginBottom: "6px" }}>Autonomie</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px", lineHeight: 1.4 }}>Le besoin de se sentir à l'origine de ses choix</p>
            {[
              { nom: "🧭 Sens", desc: "Comprendre pourquoi on fait ce qu'on fait." },
              { nom: "🕊️ Liberté", desc: "Avoir le choix, pouvoir décider." },
              { nom: "🎉 Plaisir", desc: "Prendre plaisir à apprendre, à être ensemble." },
            ].map((c) => (
              <div key={c.nom} style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#E67E22" }}>{c.nom}</div>
                <div style={{ fontSize: "12px", color: "var(--anthracite)", lineHeight: 1.4 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Compétence */}
        <div style={{ borderRadius: "14px", border: "2px solid #00989D", overflow: "hidden" }}>
          <div style={{ height: "4px", background: "#00989D" }} />
          <div style={{ padding: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--anthracite)", marginBottom: "6px" }}>Compétence</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px", lineHeight: 1.4 }}>Le besoin de se sentir capable, de progresser</p>
            {[
              { nom: "⚡ Action", desc: "Apprendre en faisant, en expérimentant." },
              { nom: "📈 Progression", desc: "Voir qu'on avance, qu'on progresse." },
              { nom: "🎯 Utilité", desc: "Se sentir utile, contribuer au collectif." },
            ].map((c) => (
              <div key={c.nom} style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#00989D" }}>{c.nom}</div>
                <div style={{ fontSize: "12px", color: "var(--anthracite)", lineHeight: 1.4 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Appartenance */}
        <div style={{ borderRadius: "14px", border: "2px solid #6B2468", overflow: "hidden" }}>
          <div style={{ height: "4px", background: "#6B2468" }} />
          <div style={{ padding: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--anthracite)", marginBottom: "6px" }}>Appartenance</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px", lineHeight: 1.4 }}>Le besoin de faire partie d'un groupe, en sécurité</p>
            {[
              { nom: "🌿 Sécurité", desc: "Se sentir en sécurité pour oser." },
              { nom: "💎 Considération", desc: "Être reconnu·e dans son unicité." },
              { nom: "🤝 Confiance", desc: "Faire partie d'un collectif, partager des objectifs communs." },
            ].map((c) => (
              <div key={c.nom} style={{ marginBottom: "10px" }}>
                <div style={{ fontSize: "14px", fontWeight: 700, color: "#6B2468" }}>{c.nom}</div>
                <div style={{ fontSize: "12px", color: "var(--anthracite)", lineHeight: 1.4 }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,

    // Slide 3 : Le diagnostic
    <div key="diagnostic" style={{ textAlign: "center", padding: "10px 0" }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: "var(--canard)", marginBottom: "8px" }}>
        03 — Le diagnostic
      </div>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", lineHeight: 1.2, marginBottom: "16px" }}>
        Diagnostiquer la motivation{" "}
        <span style={{ color: "var(--canard)" }}>de votre groupe</span>
      </h2>
      <p style={{ fontSize: "15px", color: "var(--anthracite)", lineHeight: 1.6, marginBottom: "24px" }}>
        Utilisez le bouton 🔍 <strong>Diagnostic</strong> en haut de la BAO pour accéder à 3 outils complémentaires :
      </p>
      <div className="welcome-grid-3" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px", textAlign: "left" }}>
        <div style={{ background: "#f8f9fa", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "10px" }}>🧭</span>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--anthracite)", marginBottom: "6px" }}>Faire le diagnostic</div>
          <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.4, margin: 0 }}>
            Utilisez un outil (jetons, gommettes, questionnaire) pour recueillir l'avis des jeunes sur chaque clé
          </p>
        </div>
        <div style={{ background: "#f8f9fa", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "10px" }}>📊</span>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--anthracite)", marginBottom: "6px" }}>Analyser les résultats</div>
          <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.4, margin: 0 }}>
            Saisissez vos données et obtenez un radar, des alertes et une synthèse automatique
          </p>
        </div>
        <div style={{ background: "#f8f9fa", borderRadius: "14px", padding: "20px", textAlign: "center" }}>
          <span style={{ fontSize: "32px", display: "block", marginBottom: "10px" }}>🔑</span>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--anthracite)", marginBottom: "6px" }}>Trouver les bons outils</div>
          <p style={{ fontSize: "13px", color: "var(--muted)", lineHeight: 1.4, margin: 0 }}>
            La BAO filtre automatiquement les outils adaptés aux clés à renforcer
          </p>
        </div>
      </div>
      <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "20px" }}>
        Vos analyses sont sauvegardées dans <strong>Mon espace</strong> pour suivre l'évolution de vos groupes dans le temps.
      </p>
    </div>,
  ];

  return (
    <>
      <style>{`
        @keyframes welcomeIn {
          from { opacity: 0; transform: scale(0.95) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @media (max-width: 768px) {
          .welcome-modal-content {
            padding: 24px 20px !important;
            max-height: 90vh !important;
            margin: 16px !important;
          }
          .welcome-modal-content h2 {
            font-size: 22px !important;
          }
          .welcome-grid-3 {
            grid-template-columns: 1fr !important;
          }
          .welcome-grid-2 {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(43, 52, 66, 0.6)",
          zIndex: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "20px",
        }}
      >
        <div
          className="welcome-modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: "white",
            maxWidth: "820px",
            width: "100%",
            maxHeight: "85vh",
            overflowY: "auto",
            borderRadius: "20px",
            padding: "36px 40px",
            animation: "welcomeIn 0.3s ease",
            position: "relative",
          }}
        >
          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "16px",
              right: "16px",
              background: "var(--blanc)",
              border: "none",
              fontSize: "20px",
              cursor: "pointer",
              color: "var(--anthracite)",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ✕
          </button>

          {/* Content */}
          <div className={step === 2 ? "welcome-grid-3" : step === 1 ? "welcome-grid-2" : ""}>
            {slides[step]}
          </div>

          {/* Footer */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "28px", paddingTop: "20px", borderTop: "1px solid var(--line)" }}>
            <button
              onClick={onClose}
              style={{
                background: "none",
                border: "none",
                fontSize: "13px",
                color: "var(--muted)",
                cursor: "pointer",
                fontFamily: "inherit",
                fontWeight: 600,
              }}
            >
              Passer l'introduction
            </button>

            {/* Dots */}
            <div style={{ display: "flex", gap: "6px" }}>
              {slides.map((_, i) => (
                <div
                  key={i}
                  style={{
                    width: i === step ? "20px" : "8px",
                    height: "8px",
                    borderRadius: "4px",
                    background: i === step ? "var(--canard)" : "var(--line-strong)",
                    transition: "all 0.2s",
                    cursor: "pointer",
                  }}
                  onClick={() => setStep(i)}
                />
              ))}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", gap: "10px" }}>
              {step > 0 && (
                <button
                  onClick={() => setStep(step - 1)}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "24px",
                    border: "2px solid var(--line-strong)",
                    background: "white",
                    color: "var(--anthracite)",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  ← Précédent
                </button>
              )}
              {step < slides.length - 1 ? (
                <button
                  onClick={() => setStep(step + 1)}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "24px",
                    border: "none",
                    background: "var(--canard)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  Suivant →
                </button>
              ) : (
                <button
                  onClick={onClose}
                  style={{
                    padding: "10px 22px",
                    borderRadius: "24px",
                    border: "none",
                    background: "var(--canard)",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  C'est parti →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
