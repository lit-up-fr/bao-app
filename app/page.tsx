"use client";

import Link from "next/link";

/* ──────────────────────────────────────────────
   LANDING PAGE — V5 fidèle
   ────────────────────────────────────────────── */

export default function Home() {
  return (
    <section
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        position: "relative",
        overflow: "hidden",
        background: "var(--blanc)",
      }}
    >
      {/* ═══ Bandeau supérieur turquoise ═══ */}
      <div
        className="landing-band"
        style={{
          background: "var(--canard-dark)",
          padding: "14px 32px",
          position: "relative",
          zIndex: 3,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-litup-white.png"
            alt="Lit uP"
            style={{
              height: "32px",
              width: "auto",
              display: "block",
            }}
          />
          <span
            style={{
              fontFamily: "'Caveat', cursive",
              color: "white",
              fontSize: "26px",
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            la boîte à outils
          </span>
        </div>
        <span
          className="band-date"
          style={{
            fontSize: "14px",
            color: "white",
            fontWeight: 700,
          }}
        >
          Pour les professionnels de l&apos;accompagnement
        </span>
      </div>

      {/* ═══ Vagues jaunes décoratives ═══ */}
      <svg
        style={{
          position: "absolute",
          top: 0,
          right: "40px",
          zIndex: 2,
          pointerEvents: "none",
        }}
        width="280"
        height="50"
        viewBox="0 0 280 50"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M0 15 Q35 -5, 70 15 T140 15 T210 15 T280 15"
          stroke="#FCC33E"
          strokeWidth="3"
          fill="none"
        />
        <path
          d="M0 32 Q35 12, 70 32 T140 32 T210 32 T280 32"
          stroke="#FCC33E"
          strokeWidth="3"
          fill="none"
        />
      </svg>

      {/* ═══ Hero principal ═══ */}
      <div
        className="fade-in landing-hero"
        style={{
          flexGrow: 1,
          display: "grid",
          gridTemplateColumns: "1.3fr 1fr",
          gap: "60px",
          padding: "60px 5vw",
          alignItems: "center",
          position: "relative",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* ── Colonne gauche : texte ── */}
        <div style={{ position: "relative", zIndex: 2 }}>
          {/* Eyebrow badge */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--jaune-light)",
              color: "var(--anthracite)",
              padding: "6px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: 600,
              marginBottom: "24px",
            }}
          >
            <span
              style={{
                width: "8px",
                height: "8px",
                background: "var(--jaune-dark)",
                borderRadius: "50%",
                display: "inline-block",
              }}
            />
            <span>Ressources pour l&apos;engagement des jeunes</span>
          </div>

          {/* Titre principal */}
          <h1
            style={{
              fontFamily: "'Source Sans 3', sans-serif",
              fontWeight: 800,
              fontSize: "clamp(42px, 6vw, 78px)",
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              color: "var(--anthracite)",
              marginBottom: "28px",
            }}
          >
            Des outils{" "}
            <span
              style={{
                color: "var(--canard)",
                position: "relative",
                display: "inline-block",
              }}
            >
              qui donnent
              {/* Soulignement jaune */}
              <span
                style={{
                  position: "absolute",
                  bottom: "4px",
                  left: 0,
                  right: 0,
                  height: "8px",
                  background: "var(--jaune)",
                  zIndex: -1,
                  opacity: 0.6,
                  borderRadius: "4px",
                }}
              />
            </span>{" "}
            <br />
            le pouvoir d&apos;agir <br />
            <span
              style={{
                fontFamily: "'Caveat', cursive",
                fontWeight: 600,
                color: "var(--canard-dark)",
                fontSize: "0.85em",
                display: "inline-block",
                transform: "rotate(-2deg)",
              }}
            >
              — aux jeunes comme aux équipes.
            </span>
          </h1>

          {/* Lead text */}
          <p
            style={{
              fontSize: "clamp(17px, 1.3vw, 20px)",
              maxWidth: "560px",
              color: "var(--anthracite)",
              lineHeight: 1.55,
              marginBottom: "20px",
            }}
          >
            Bienvenue dans la boîte à outils du{" "}
            <strong>Laboratoire pédagogique Lit uP</strong>. Vous y trouverez
            des méthodes concrètes, testées sur le terrain, pour animer, libérer
            la parole, construire un collectif et accompagner les jeunes dans
            leurs projets.
          </p>

          {/* Signature Caveat */}
          <div
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "22px",
              color: "var(--canard-dark)",
              marginBottom: "48px",
            }}
          >
            Gratuite, ouverte, faite pour être partagée.
          </div>
        </div>

        {/* ── Colonne droite : illustration cercles ── */}
        <div
          className="hero-illus"
          style={{
            position: "relative",
            width: "100%",
            aspectRatio: "1 / 1",
            maxWidth: "460px",
            justifySelf: "center",
          }}
        >
          {/* Hachures jaunes en fond */}
          <div
            style={{
              position: "absolute",
              width: "52%",
              height: "52%",
              bottom: "8%",
              left: 0,
              borderRadius: "50%",
              backgroundImage:
                "repeating-linear-gradient(135deg, var(--jaune) 0px, var(--jaune) 5px, transparent 5px, transparent 14px)",
              zIndex: 0,
            }}
          />
          {/* Grand cercle teal */}
          <div
            style={{
              position: "absolute",
              width: "75%",
              height: "75%",
              top: "10%",
              left: "18%",
              background: "var(--canard)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 60px rgba(0, 152, 157, 0.25)",
              zIndex: 1,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo-litup-white.png"
              alt="Lit uP"
              style={{
                width: "58%",
                height: "auto",
                display: "block",
              }}
            />
          </div>
          {/* Confettis décoratifs */}
          <span
            style={{
              position: "absolute",
              top: "5%",
              right: "8%",
              fontFamily: "'Caveat', cursive",
              color: "var(--prune)",
              fontSize: "36px",
              transform: "rotate(15deg)",
              zIndex: 2,
            }}
          >
            ✦
          </span>
          <span
            style={{
              position: "absolute",
              bottom: "12%",
              right: "6%",
              fontFamily: "'Caveat', cursive",
              color: "var(--jaune-accent)",
              fontSize: "32px",
              transform: "rotate(-8deg)",
              zIndex: 2,
            }}
          >
            ~
          </span>
        </div>
      </div>

      {/* ═══ Section « Par où commencer ? » ═══ */}
      <div
        className="parcours-section-inner"
        style={{
          padding: "80px 5vw 100px",
          background: "white",
          position: "relative",
          maxWidth: "1400px",
          margin: "0 auto",
          width: "100%",
        }}
      >
        {/* Heading */}
        <div style={{ marginBottom: "40px", textAlign: "center" }}>
          <div
            style={{
              fontFamily: "'Caveat', cursive",
              fontSize: "24px",
              color: "var(--jaune-accent)",
              marginBottom: "6px",
              fontWeight: 500,
            }}
          >
            Par où commencer ?
          </div>
          <h2
            style={{
              fontSize: "36px",
              fontWeight: 800,
              color: "var(--anthracite)",
              letterSpacing: "-0.02em",
            }}
          >
            Trois portes d&apos;entrée,{" "}
            <span style={{ color: "var(--canard)" }}>selon votre posture</span>
          </h2>
        </div>

        {/* Grille des 3 cartes parcours */}
        <div
          className="stagger parcours-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
          }}
        >
          {[
            {
              num: "01",
              title: "Vous êtes\nun·e professionnel·le",
              desc: "Enseignant·e, conseiller·ère, éducateur·ice, formateur·ice. Accédez aux outils et ateliers pensés pour l'accompagnement structuré.",
              cta: "Entrer",
              variant: "canard" as const,
            },
            {
              num: "02",
              title: "Vous êtes\npair·e aidant·e",
              desc: "Vous accompagnez vos pairs par l'expérience. Retrouvez les outils simples, éprouvés, pour faciliter la parole et l'action.",
              cta: "Entrer",
              variant: "jaune" as const,
            },
            {
              num: "03",
              title: "Vous préférez\nexplorer librement",
              desc: "Parcourez l'ensemble de la boîte sans filtre préalable. À vous de naviguer par étape, par objectif ou par clé d'engagement.",
              cta: "Explorer",
              variant: "prune" as const,
            },
          ].map((card) => {
            const colors = {
              canard: {
                num: "var(--canard)",
                cta: "var(--canard-dark)",
                bubble: "var(--canard)",
                hoverBorder: "var(--canard)",
              },
              jaune: {
                num: "var(--jaune-accent)",
                cta: "var(--jaune-accent)",
                bubble: "var(--jaune)",
                hoverBorder: "var(--jaune-accent)",
              },
              prune: {
                num: "var(--prune)",
                cta: "var(--prune)",
                bubble: "var(--prune)",
                hoverBorder: "var(--prune)",
              },
            }[card.variant];

            return (
              <Link
                key={card.num}
                href="/bao"
                className="fade-in"
                style={{
                  background: "white",
                  padding: "36px 28px 28px",
                  cursor: "pointer",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  display: "flex",
                  flexDirection: "column",
                  gap: "14px",
                  position: "relative",
                  overflow: "hidden",
                  border: "2px solid var(--line)",
                  textAlign: "left",
                  minHeight: "240px",
                  borderRadius: "20px",
                  textDecoration: "none",
                  color: "inherit",
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(-6px)";
                  el.style.boxShadow =
                    "0 12px 32px rgba(43, 52, 66, 0.12)";
                  el.style.borderColor = colors.hoverBorder;
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget;
                  el.style.transform = "translateY(0)";
                  el.style.boxShadow = "none";
                  el.style.borderColor = "var(--line)";
                }}
              >
                {/* Bulle décorative */}
                <div
                  style={{
                    position: "absolute",
                    top: "-40px",
                    right: "-40px",
                    width: "140px",
                    height: "140px",
                    borderRadius: "50%",
                    opacity: card.variant === "jaune" ? 0.25 : 0.12,
                    background: colors.bubble,
                    transition: "transform 0.4s ease",
                  }}
                />

                <span
                  style={{
                    fontFamily: "'Caveat', cursive",
                    fontSize: "32px",
                    lineHeight: 1,
                    fontWeight: 600,
                    color: colors.num,
                  }}
                >
                  {card.num}
                </span>

                <span
                  style={{
                    fontSize: "26px",
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: "-0.02em",
                    color: "var(--anthracite)",
                    whiteSpace: "pre-line",
                  }}
                >
                  {card.title}
                </span>

                <span
                  style={{
                    fontSize: "15px",
                    color: "var(--anthracite-soft)",
                    lineHeight: 1.55,
                    flexGrow: 1,
                  }}
                >
                  {card.desc}
                </span>

                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    fontSize: "14px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    marginTop: "8px",
                    color: colors.cta,
                  }}
                >
                  {card.cta} <span>→</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ═══ Footer stats ═══ */}
      <footer
        style={{
          background: "var(--anthracite)",
          color: "white",
          padding: "28px 5vw",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
          marginTop: "auto",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "32px",
            flexWrap: "wrap",
            fontSize: "14px",
          }}
        >
          {[
            { value: "30", label: "outils référencés" },
            { value: "9", label: "clés d'engagement" },
            { value: "10", label: "étapes de parcours" },
            { value: "6", label: "parcours guidés" },
          ].map((stat) => (
            <span key={stat.label}>
              <strong
                style={{
                  color: "var(--jaune)",
                  fontWeight: 700,
                  fontSize: "18px",
                  marginRight: "4px",
                }}
              >
                {stat.value}
              </strong>
              {stat.label}
            </span>
          ))}
        </div>
        <div
          style={{
            fontFamily: "'Caveat', cursive",
            fontSize: "20px",
            color: "var(--jaune)",
          }}
        >
          Accès libre · gratuit · à partager
        </div>
      </footer>

    </section>
  );
}
