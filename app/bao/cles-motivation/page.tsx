"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { getCles, type Cle } from "@/lib/supabase";
import AppHeader from "@/components/AppHeader";

const BESOINS = [
  {
    nom: "Autonomie",
    couleur: "#00989D",
    description: "Le besoin d'autonomie correspond au sentiment d'être à l'origine de ses propres actions, de pouvoir faire des choix et d'agir en cohérence avec ses valeurs. Il ne s'agit pas d'indépendance, mais du sentiment d'agir librement, sans pression extérieure excessive.",
    cles: ["Sens", "Liberté", "Plaisir"],
  },
  {
    nom: "Compétence",
    couleur: "#FCC33E",
    description: "Le besoin de compétence renvoie au sentiment d'être efficace dans ses interactions avec l'environnement, de progresser et de relever des défis adaptés à son niveau. Il se nourrit d'expériences de réussite et de retours positifs sur ses apprentissages.",
    cles: ["Action", "Progression", "Utilité"],
  },
  {
    nom: "Appartenance",
    couleur: "#6B2468",
    description: "Le besoin d'appartenance (ou de proximité sociale) correspond au besoin de se sentir connecté aux autres, accepté et considéré au sein d'un groupe. Il se développe dans un cadre où chacun peut être soi-même, en confiance et en sécurité émotionnelle.",
    cles: ["Sécurité", "Considération", "Confiance"],
  },
];

const CLES_DETAIL: Record<string, { hashtags: string; items: string[] }> = {
  Sens: {
    hashtags: "#UtilitéDesApprentissages #Transposition #Objectifs",
    items: [
      "Comprendre les attentes et les objectifs de chacun",
      "Aider à la définition d'objectifs",
      "Accompagner à faire des liens entre les objectifs et les étapes pour les atteindre",
      "Faire des liens entre les apprentissages, les expériences et les compétences",
      "Transposer les compétences dans d'autres environnements (situer les apprentissages dans la vie quotidienne et l'avenir du jeune)",
      "Encourager la réflexivité sur les apprentissages",
    ],
  },
  Liberté: {
    hashtags: "#Choix #SentimentdAutonomie #Décision",
    items: [
      "Ne pas contraindre ou demander à tous la même chose, mais demander à chacun de faire un pas en fonction de là où il en est",
      "Solliciter régulièrement l'avis, les idées et en tenir compte",
      "Écouter et considérer l'opinion des élèves",
      "Offrir des choix",
      "Permettre de prendre des décisions individuelles et collectives",
      "Réagir et répondre aux demandes et envies exprimées",
    ],
  },
  Plaisir: {
    hashtags: "#Plaisirdêtreensemble #PlaisirdApprendre #Joie #Surprise",
    items: [
      "Surprendre (absurde, matériel insolite, sortie du cadre, extérieur, etc.)",
      "Susciter la créativité",
      "Illustrer et décorer, favoriser l'esthétique et les couleurs",
      "Favoriser ce qui est qualitatif et esthétique (cadre, matériel, support, etc.)",
      "Jouer, challenger",
      "Promouvoir le plaisir d'apprendre et de développer des connaissances",
      "Valoriser l'amélioration et l'effort, plutôt que le rendement",
    ],
  },
  Action: {
    hashtags: "#Expérimentation #DépassementDeSoi #Découverte #ConnaissanceDeSoi #Apprentissage",
    items: [
      "Associer l'apprentissage théorique à la pratique",
      "Favoriser les actions permettant des prises de conscience, au-delà de l'apprentissage académique",
      "Changer le sens entre théorie et pratique (commencer par la pratique, puis la théorie, ou fonctionner en classe inversée)",
      "Permettre la mise en application pratique rapide dans différents contextes",
      "Accompagner vers la zone proximale de développement",
      "Encourager le dépassement de soi",
      "Créer des occasions de mobiliser les compétences dans la vie réelle, en sécurité",
      "Vivre des expériences de réussite, avec un bon équilibre entre sécurité et dépassement de soi",
    ],
  },
  Progression: {
    hashtags: "#ApprocheParCompétences #Évaluation #Réflexivité #Valorisation",
    items: [
      "Donner des feedbacks collectifs et individuels",
      "Favoriser les temps de réflexivité sur le chemin parcouru et les apprentissages",
      "Identifier les leviers d'apprentissage et de réussite",
      "Souligner les réussites, la progression et l'effort",
      "Rendre visible la progression",
      "Varier les modalités d'évaluation (auto-évaluation, pair-à-pair, évaluations croisées…)",
      "Valoriser la progression et les échecs, pas uniquement l'atteinte ou non d'un objectif",
      "Valoriser les petits pas, les sorties de zone de confort",
      "Désacraliser l'échec, en faire une source d'apprentissage",
      "Célébrer les réussites",
    ],
  },
  Utilité: {
    hashtags: "#SentimentDeCompétences #Action #Contribution #MobilisationDesCompétences",
    items: [
      "Permettre de co-construire (solutions, projets, programme, etc.)",
      "Favoriser le travail collaboratif (outils de communication, espaces physiques, temps…)",
      "Développer la coopération, l'entraide, les échanges de pratique, le pair-à-pair, le tutorat",
      "Attribuer des rôles et des places distinctes en fonction des forces ou objectifs",
      "Proposer et donner des responsabilités",
      "Permettre aux plus anciens d'accompagner les plus jeunes",
      "Donner des rôles tournants ou en fonction d'une progression",
    ],
  },
  Sécurité: {
    hashtags: "#Physique #Émotionnelle #Psychologique #Authenticité #Expression",
    items: [
      "Donner du crédit aux émotions et ressentis",
      "Permettre à chacun de connaître et prendre en compte les besoins des autres",
      "Gérer les batteries (mentales, physiques, émotionnelles)",
      "Permettre à chacun de mieux se connaître personnellement",
      "Accepter les erreurs, la stagnation, les temporalités différentes",
      "Favoriser l'expression des idées et des valeurs",
      "Permettre l'informel",
      "Soutenir chacun dans ses demandes et besoins",
      "Montrer l'exemple",
      "Assurer la mise en place d'un cadre sécurisé pour tous, basé sur le non-jugement",
      "S'accorder sur des règles du groupe, les co-construire",
      "Mettre en place des rituels (entrée, sortie, progressions, célébration, routine du quotidien, rites de passage…)",
    ],
  },
  Considération: {
    hashtags: "#Acceptation #Unicité #Valorisation #Différenciation #IntelligencesMultiples #Écoute",
    items: [
      "Connaître l'autre, prendre de ses nouvelles, reconnaître ses besoins, accepter les particularités",
      "Comprendre dans quel état d'esprit chacun se trouve, donner du crédit à son histoire",
      "Proposer des défis personnalisés, adaptés à chacun",
      "Reconnaître les forces, compétences et difficultés de chacun",
      "Différencier les approches (illustrer, mobiliser le mouvement, l'art, manipuler des objets, aménager l'espace et les temps)",
      "Proposer des tâches adaptées aux habiletés de chacun",
      "Respecter le rythme de chacun",
      "Valoriser chacun pour ce qu'il est et apporte au groupe",
      "Permettre l'expression de chacun",
      "Favoriser la reconnaissance par les pairs (attribution de rôles, cartes de feedback pairs à pairs, etc.)",
      "Être accueilli, « intronisé » (fête, parrainage entre pairs…)",
    ],
  },
  Confiance: {
    hashtags: "#Communs #SentimentdAppartenance #ObjectifCollectif",
    items: [
      "Donner l'occasion de demander ou proposer de l'aide",
      "Favoriser les échanges de pratiques, d'expériences, témoignages de parcours",
      "Définir et poursuivre des objectifs communs",
      "Mettre en place des activités de cohésion",
      "Développer des relations significatives avec les adultes",
      "Développer des relations significatives entre les pairs",
    ],
  },
};

export default function ClesMotivationPage() {
  const [cles, setCles] = useState<Cle[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    getCles().then(setCles);
  }, []);

  function getCleData(nom: string): Cle | undefined {
    return cles.find((c) => c.nom.toLowerCase().includes(nom.toLowerCase()));
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--blanc)" }}>
      <AppHeader searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div style={{ maxWidth: "820px", margin: "0 auto", padding: "40px 28px 80px" }}>
        {/* Back */}
        <Link href="/bao" style={{ color: "var(--canard)", textDecoration: "none", fontSize: "14px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "4px", marginBottom: "28px" }}>
          ← Retour aux outils
        </Link>

        {/* Title */}
        <div style={{ marginBottom: "32px" }}>
          <h1 style={{ fontSize: "36px", fontWeight: 800, letterSpacing: "-0.025em", lineHeight: 1.1, color: "var(--anthracite)", margin: "0 0 12px" }}>
            🔑 Les 9 clés de la motivation et de l'engagement
          </h1>
          <p style={{ fontSize: "17px", lineHeight: 1.6, color: "var(--anthracite)", margin: 0 }}>
            Comprendre ce qui motive un jeune à s'engager, c'est pouvoir adapter sa posture et ses outils pour créer les conditions de la réussite. Lit uP s'appuie sur un cadre scientifique solide pour identifier 9 leviers concrets d'action.
          </p>
        </div>

        {/* Théorie SDT */}
        <div style={{ padding: "24px 28px", borderRadius: "14px", background: "#e0f3f4", marginBottom: "32px", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: "10px", bottom: "10px", width: "4px", borderRadius: "2px", background: "var(--canard)" }} />
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--canard-dark)", margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            La théorie de l'auto-détermination
          </h2>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--anthracite)", margin: "0 0 12px" }}>
            Les 9 clés de la motivation s'appuient sur la <strong>théorie de l'auto-détermination</strong> (Self-Determination Theory), développée par les psychologues <strong>Edward L. Deci</strong> et <strong>Richard M. Ryan</strong> à partir des années 1980. Cette théorie, aujourd'hui l'une des plus validées en psychologie de la motivation, postule que tout être humain a trois <strong>besoins psychologiques fondamentaux</strong> dont la satisfaction est essentielle au bien-être, à la motivation intrinsèque et à l'engagement.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--anthracite)", margin: "0 0 12px" }}>
            Lorsque ces trois besoins sont satisfaits, la personne développe une <strong>motivation autodéterminée</strong> : elle agit par choix, par intérêt et avec un sentiment de cohérence interne. À l'inverse, lorsque ces besoins sont frustrés, la motivation décline, le désengagement s'installe et le risque de décrochage augmente.
          </p>
          <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--muted)", margin: 0, fontStyle: "italic" }}>
            Sources : Deci, E.L. & Ryan, R.M. (1985). <em>Intrinsic Motivation and Self-Determination in Human Behavior</em>. Plenum Press. — Ryan, R.M. & Deci, E.L. (2000). Self-Determination Theory and the Facilitation of Intrinsic Motivation, Social Development, and Well-Being. <em>American Psychologist</em>, 55(1), 68-78. — Ryan, R.M. & Deci, E.L. (2017). <em>Self-Determination Theory: Basic Psychological Needs in Motivation, Development, and Wellness</em>. Guilford Press.
          </p>
        </div>

        {/* Les 3 besoins */}
        <h2 style={{ fontSize: "22px", fontWeight: 800, color: "var(--anthracite)", margin: "0 0 8px", letterSpacing: "-0.01em" }}>
          Les 3 besoins psychologiques fondamentaux
        </h2>
        <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--anthracite)", margin: "0 0 24px" }}>
          Chaque besoin se décline en 3 clés concrètes que les professionnels peuvent activer dans leurs pratiques d'accompagnement.
        </p>

        {BESOINS.map((besoin, bi) => (
          <div key={bi} style={{ marginBottom: "40px" }}>
            {/* Besoin header */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "12px", borderBottom: `3px solid ${besoin.couleur}` }}>
              <span style={{ fontSize: "14px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: besoin.couleur }}>
                Besoin d'{besoin.nom.toLowerCase() === "appartenance" ? "appartenance" : besoin.nom.toLowerCase()}
              </span>
            </div>
            <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--anthracite)", margin: "0 0 20px" }}>
              {besoin.description}
            </p>

            {/* Les 3 clés du besoin */}
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {besoin.cles.map((cleNom) => {
                const cleData = getCleData(cleNom);
                const detail = CLES_DETAIL[cleNom];
                if (!detail) return null;
                return (
                  <div
                    key={cleNom}
                    style={{
                      background: "white",
                      border: "2px solid var(--line)",
                      borderRadius: "14px",
                      padding: "20px 24px",
                      borderLeft: `4px solid ${cleData?.couleur_hex || besoin.couleur}`,
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                      <span style={{ fontSize: "24px" }}>{cleData?.emoji || "🔑"}</span>
                      <span style={{ fontSize: "18px", fontWeight: 800, color: "var(--anthracite)" }}>{cleNom}</span>
                    </div>
                    <div style={{ fontSize: "13px", color: "var(--muted)", fontStyle: "italic", marginBottom: "12px" }}>
                      {detail.hashtags}
                    </div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {detail.items.map((item, j) => (
                        <li key={j} style={{ fontSize: "14px", color: "var(--anthracite)", lineHeight: 1.5, padding: "4px 0 4px 20px", position: "relative" }}>
                          <span style={{ position: "absolute", left: "4px", top: "12px", width: "5px", height: "5px", borderRadius: "50%", background: cleData?.couleur_hex || besoin.couleur }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Application pratique */}
        <div style={{ padding: "24px 28px", borderRadius: "14px", background: "#fff7df", marginBottom: "32px", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, top: "10px", bottom: "10px", width: "4px", borderRadius: "2px", background: "var(--jaune-dark)" }} />
          <h2 style={{ fontSize: "20px", fontWeight: 800, color: "var(--jaune-accent)", margin: "0 0 12px" }}>
            Comment utiliser ces clés ?
          </h2>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--anthracite)", margin: "0 0 12px" }}>
            Les 9 clés sont un outil de lecture et d'action. Elles permettent de diagnostiquer les leviers et freins de motivation d'un groupe ou d'un jeune, puis de choisir les outils pédagogiques les plus adaptés pour y répondre.
          </p>
          <p style={{ fontSize: "15px", lineHeight: 1.6, color: "var(--anthracite)", margin: "0 0 16px" }}>
            Concrètement, les professionnels peuvent utiliser le <strong>questionnaire de diagnostic</strong> disponible dans la Boîte à Outils pour identifier les clés prioritaires, puis naviguer vers les outils classés par clé de motivation.
          </p>
          <Link
            href="/bao?mode=cles"
            style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "11px 20px", background: "var(--canard)", color: "white",
              borderRadius: "24px", fontSize: "13px", fontWeight: 700,
              textDecoration: "none", letterSpacing: "0.02em",
            }}
          >
            → Explorer les outils par clé de motivation
          </Link>
        </div>

        {/* Crédit */}
        <div style={{ paddingTop: "20px", borderTop: "1px dashed var(--line-strong)", fontSize: "13px", color: "var(--muted)", lineHeight: 1.5 }}>
          <strong>Cadre théorique :</strong> Théorie de l'auto-détermination (Deci & Ryan, 1985, 2000, 2017). Adaptation par Lit uP pour l'accompagnement éducatif des jeunes.
        </div>
      </div>
    </div>
  );
}
