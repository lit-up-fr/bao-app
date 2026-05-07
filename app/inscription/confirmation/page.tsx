"use client";

import Link from "next/link";

export default function ConfirmationPage() {
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
        {/* Icône check */}
        <div
          style={{
            width: "72px",
            height: "72px",
            borderRadius: "50%",
            background: "#f0fdfa",
            border: "3px solid #00989D",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 24px",
            fontSize: "32px",
          }}
        >
          ✓
        </div>

        <h1
          style={{
            fontSize: "24px",
            fontWeight: 700,
            color: "#2B3442",
            marginBottom: "12px",
          }}
        >
          Demande envoyée !
        </h1>

        <p
          style={{
            fontSize: "16px",
            color: "#6b7280",
            lineHeight: "1.6",
            marginBottom: "8px",
          }}
        >
          Votre demande d'accès à la Boîte à Outils Lit uP a bien été enregistrée.
        </p>

        <p
          style={{
            fontSize: "15px",
            color: "#374151",
            lineHeight: "1.6",
            marginBottom: "32px",
          }}
        >
          L'équipe Lit uP va examiner votre profil et valider votre accès.
          Vous recevrez un email de confirmation, généralement sous 48h.
        </p>

        <div
          style={{
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "10px",
            padding: "16px",
            marginBottom: "32px",
          }}
        >
          <p style={{ fontSize: "14px", color: "#92400e", margin: 0 }}>
            <strong>Pensez à vérifier vos spams</strong> si vous ne voyez pas
            notre email dans votre boîte de réception.
          </p>
        </div>

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
              textAlign: "center",
            }}
          >
            Retour à l'accueil
          </Link>
          <Link
            href="/connexion"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              borderRadius: "8px",
              border: "1px solid #d1d5db",
              background: "white",
              color: "#374151",
              fontSize: "15px",
              fontWeight: 600,
              textDecoration: "none",
              textAlign: "center",
            }}
          >
            Se connecter
          </Link>
        </div>
      </div>
    </div>
  );
}
