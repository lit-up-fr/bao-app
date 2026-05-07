"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

export default function MotDePasseOubliePage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) {
      setError("Veuillez saisir votre email");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/connexion/nouveau-mot-de-passe`,
      });
      if (error) throw error;
      setSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Une erreur est survenue";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    outline: "none",
  };

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
          maxWidth: "420px",
          background: "white",
          borderRadius: "16px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: "#2B3442",
            padding: "32px 32px 28px",
            textAlign: "center",
          }}
        >
          <Link href="/">
            <img
              src="/logo-litup-white.png"
              alt="Lit uP"
              style={{ height: "40px", marginBottom: "14px", cursor: "pointer" }}
            />
          </Link>
          <h1
            style={{
              color: "white",
              fontSize: "22px",
              fontWeight: 700,
              margin: 0,
            }}
          >
            Mot de passe oublié
          </h1>
          <p
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "14px",
              marginTop: "6px",
            }}
          >
            Recevez un lien de réinitialisation par email
          </p>
        </div>

        <div style={{ padding: "32px" }}>
          {sent ? (
            /* Message de succès */
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "64px",
                  height: "64px",
                  borderRadius: "50%",
                  background: "#f0fdfa",
                  border: "3px solid #00989D",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                  fontSize: "28px",
                }}
              >
                ✉️
              </div>
              <h2
                style={{
                  fontSize: "18px",
                  fontWeight: 700,
                  color: "#2B3442",
                  marginBottom: "12px",
                }}
              >
                Email envoyé !
              </h2>
              <p
                style={{
                  fontSize: "15px",
                  color: "#6b7280",
                  lineHeight: "1.6",
                  marginBottom: "8px",
                }}
              >
                Si un compte existe avec l'adresse <strong>{email}</strong>, vous
                recevrez un lien pour réinitialiser votre mot de passe.
              </p>
              <p
                style={{
                  fontSize: "13px",
                  color: "#9ca3af",
                  marginBottom: "24px",
                }}
              >
                Pensez à vérifier vos spams.
              </p>
              <Link
                href="/connexion"
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
                Retour à la connexion
              </Link>
            </div>
          ) : (
            /* Formulaire */
            <>
              {error && (
                <div
                  style={{
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    padding: "12px 16px",
                    color: "#dc2626",
                    fontSize: "14px",
                    marginBottom: "20px",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div>
                  <label
                    style={{
                      display: "block",
                      fontSize: "14px",
                      fontWeight: 600,
                      color: "#2B3442",
                      marginBottom: "6px",
                    }}
                  >
                    Adresse email
                  </label>
                  <input
                    type="email"
                    style={inputStyle}
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setError("");
                    }}
                    placeholder="votre@email.fr"
                    onKeyDown={(e) => e.key === "Enter" && handleSubmit(e)}
                  />
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  style={{
                    width: "100%",
                    padding: "12px",
                    borderRadius: "8px",
                    border: "none",
                    background: loading ? "#9ca3af" : "#00989D",
                    color: "white",
                    fontSize: "16px",
                    fontWeight: 600,
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Envoi en cours..." : "Envoyer le lien"}
                </button>
              </div>

              <p
                style={{
                  textAlign: "center",
                  marginTop: "24px",
                  fontSize: "14px",
                  color: "#6b7280",
                }}
              >
                <Link
                  href="/connexion"
                  style={{ color: "#00989D", fontWeight: 600, textDecoration: "none" }}
                >
                  Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
