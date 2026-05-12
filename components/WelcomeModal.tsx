"use client";

import { useState } from "react";

interface WelcomeModalProps {
  onClose: () => void;
}

export default function WelcomeModal({ onClose }: WelcomeModalProps) {
  const [step, setStep] = useState(0);

  const slides = [
    // Slide 1 : Introduction
    <div key="intro" style={{ textAlign: "center", padding: "10px 0" }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: "var(--canard)", marginBottom: "8px" }}>
        01 — Comment utiliser cette boîte ?
      </div>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", lineHeight: 1.2, marginBottom: "16px" }}>
        30 outils, organisés selon{" "}
        <span style={{ color: "var(--canard)" }}>deux logiques complémentaires</span>.
      </h2>
      <p style={{ fontSize: "15px", color: "var(--anthracite)", lineHeight: 1.6, marginBottom: "24px" }}>
        Vous allez pouvoir chercher un outil de deux façons :
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", textAlign: "left" }}>
        <div style={{ background: "#e0f3f4", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--canard-dark)", marginBottom: "8px" }}>
            ① Par étape du parcours
          </div>
          <p style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.5, margin: 0 }}>
            Où en êtes-vous avec votre groupe ? Vous <strong>démarrez</strong> ? Vous êtes <strong>en phase d'idéation</strong> ? Vous <strong>débriefez</strong> ?
          </p>
        </div>
        <div style={{ background: "#fff7df", borderRadius: "14px", padding: "20px" }}>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "var(--jaune-accent)", marginBottom: "8px" }}>
            ② Par clé d'engagement
          </div>
          <p style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.5, margin: 0 }}>
            Qu'est-ce que vous cherchez à activer chez les jeunes ? Le <strong>sens</strong>, le <strong>plaisir</strong>, la <strong>sécurité</strong>, le <strong>pouvoir d'agir</strong>… ?
          </p>
        </div>
      </div>
      <p style={{ fontSize: "14px", color: "var(--muted)", marginTop: "20px" }}>
        On vous explique les deux logiques juste après.
      </p>
    </div>,

    // Slide 2 : Les étapes du parcours
    <div key="etapes" style={{ padding: "10px 0" }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: "var(--canard)", marginBottom: "8px" }}>
        02 — Logique n°1
      </div>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", lineHeight: 1.2, marginBottom: "12px" }}>
        Les 10 étapes{" "}
        <span style={{ color: "var(--canard)" }}>du travail collaboratif</span>
      </h2>
      <p style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.6, marginBottom: "20px" }}>
        Tout accompagnement collectif suit un cycle : on commence par <strong>accueillir et créer la confiance</strong>, on <strong>explore le sujet</strong> en plusieurs phases, puis on <strong>prend du recul ensemble</strong> pour apprendre de l'expérience.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {[
          { code: "A", nom: "Cadrage / Connexion", desc: "Créer le cadre du travail ensemble et permettre aux participant·es de se connecter les un·es aux autres.", color: "#00989D" },
          { code: "B1", nom: "Analyse", desc: "Analyser une situation, un problème, un contexte pour le comprendre en profondeur.", color: "#2B3442" },
          { code: "B2", nom: "Problématisation", desc: "Formuler le bon problème à résoudre.", color: "#6B2468" },
          { code: "B3", nom: "Idéation", desc: "Générer un maximum d'idées, sans filtre, pour ouvrir le champ des possibles.", color: "#E67E22" },
          { code: "B4", nom: "Priorisation", desc: "Trier les idées pour en retenir quelques-unes sur lesquelles avancer.", color: "#00989D" },
          { code: "B5", nom: "Construction", desc: "Construire, prototyper, donner forme à une idée retenue.", color: "#6B2468" },
          { code: "B6", nom: "Test", desc: "Tester, expérimenter pour valider ou ajuster.", color: "#2B3442" },
          { code: "B7", nom: "Évaluation", desc: "Mesurer les résultats, tirer des enseignements.", color: "#2B3442" },
          { code: "C", nom: "Débriefing", desc: "Prendre du recul sur ce qui vient d'être vécu.", color: "#00989D" },
        ].map((e) => (
          <div key={e.code} style={{ display: "flex", alignItems: "center", gap: "12px", background: "#f8f9fa", borderRadius: "10px", padding: "10px 14px" }}>
            <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: e.color, color: "white", fontWeight: 800, fontSize: "12px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {e.code}
            </span>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--anthracite)" }}>{e.nom}</span>
              <span style={{ fontSize: "13px", color: "var(--muted)", marginLeft: "8px" }}>{e.desc}</span>
            </div>
          </div>
        ))}
      </div>
    </div>,

    // Slide 3 : Les clés d'engagement
    <div key="cles" style={{ padding: "10px 0" }}>
      <div style={{ fontFamily: "'Caveat', cursive", fontSize: "18px", color: "var(--canard)", marginBottom: "8px" }}>
        03 — Logique n°2
      </div>
      <h2 style={{ fontSize: "28px", fontWeight: 800, color: "var(--anthracite)", lineHeight: 1.2, marginBottom: "12px" }}>
        Les 9 clés{" "}
        <span style={{ color: "var(--canard)" }}>de l'engagement</span>
      </h2>
      <p style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.6, marginBottom: "24px" }}>
        L'engagement repose sur la satisfaction de <strong>3 besoins psychologiques fondamentaux</strong>. Chaque besoin se décline en 3 clés concrètes à activer.
      </p>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
        {/* Autonomie */}
        <div style={{ borderRadius: "14px", border: "2px solid #E67E22", overflow: "hidden" }}>
          <div style={{ height: "4px", background: "#E67E22" }} />
          <div style={{ padding: "16px" }}>
            <h3 style={{ fontSize: "16px", fontWeight: 800, color: "var(--anthracite)", marginBottom: "6px" }}>Autonomie</h3>
            <p style={{ fontSize: "12px", color: "var(--muted)", marginBottom: "14px", lineHeight: 1.4 }}>Le besoin de se sentir à l'origine de ses choix</p>
            {[
              { nom: "Sens", desc: "Comprendre pourquoi on fait ce qu'on fait." },
              { nom: "Liberté", desc: "Avoir le choix, pouvoir décider." },
              { nom: "Plaisir", desc: "Prendre plaisir à apprendre, à être ensemble." },
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
              { nom: "Action", desc: "Apprendre en faisant, en expérimentant." },
              { nom: "Progression", desc: "Voir qu'on avance, qu'on progresse." },
              { nom: "Utilité", desc: "Se sentir utile, contribuer au collectif." },
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
              { nom: "Sécurité", desc: "Se sentir en sécurité pour oser." },
              { nom: "Considération", desc: "Être reconnu·e dans son unicité." },
              { nom: "Confiance", desc: "Faire partie d'un collectif, partager des objectifs communs." },
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
          <div className={step === 2 ? "welcome-grid-3" : step === 0 ? "welcome-grid-2" : ""}>
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
