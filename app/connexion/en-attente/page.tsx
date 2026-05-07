"use client";

import Link from "next/link";
import { signOut } from "@/lib/auth";
import { useRouter } from "next/navigation";

export default function EnAttentePage() {
  const router = useRouter();

  async function handleLogout() {
    await signOut();
    router.push("/");
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f0fdfa 0%, #f0f4ff 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 16px",
      }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: "480px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          padding: "48px 32px",
          textAlign: "center",
        }}
      >
        {/* Icône horloge */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#fffbeb",
            border: "3px solid #FCC33E",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "32px",
          }}
        >
          ⏳
        </div>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#2B3442",
            marginBottom: "12px",
          }}
        >
          Accès en cours de validation
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#6b7280",
            lineHeight: "1.6",
            marginBottom: "32px",
          }}
        >
          Votre compte a bien été créé, mais votre accès à la Boîte à Outils
          est en attente de validation par l'équipe Lit uP. Vous recevrez un
          email dès que votre accès sera activé.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            href="/"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              borderRadius: "8px",
              background: "#2B3442",
              color: "white",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Retour à l'accueil
          </Link>
          <button
            onClick={handleLogout}
            style={{
              padding: "12px 32px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontSize: "15px",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}
