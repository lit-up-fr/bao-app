"use client";

import FicheForm from "@/components/FicheForm";

export default function EditFichePage({ params }: { params: { id: string } }) {
  return <FicheForm ficheId={params.id} />;
}
