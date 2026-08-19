import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Boîte à Outils Lit uP",
    short_name: "BAO Lit uP",
    description:
      "Des outils qui donnent le pouvoir d'agir, aux jeunes comme aux équipes. Ressources pédagogiques pour l'accompagnement des jeunes 14-25 ans.",
    lang: "fr",
    start_url: "/",
    display: "standalone",
    background_color: "#F6F6F8",
    theme_color: "#00989D",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
