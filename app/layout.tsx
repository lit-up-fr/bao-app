import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Boîte à Outils — Lit uP",
  description:
    "Des outils qui donnent le pouvoir d'agir — aux jeunes comme aux équipes. Ressources pédagogiques pour l'accompagnement des jeunes 14-25 ans.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,300;0,400;0,600;0,700;0,800;1,400;1,600&family=Caveat:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
