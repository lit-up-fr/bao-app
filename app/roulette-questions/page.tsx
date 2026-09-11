import type { Metadata } from "next";
import RouletteClient from "./roulette-client";

export const metadata: Metadata = {
  title: "La roulette des défis",
  description: "Scanner, c'était accepter 😏",
  robots: { index: false, follow: false },
};

export default function RouletteQuestionsPage() {
  return <RouletteClient />;
}
