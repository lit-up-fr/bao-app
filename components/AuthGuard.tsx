"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getProfileByUserId, Profile } from "@/lib/auth";

interface AuthGuardProps {
  children: React.ReactNode;
  requireApproved?: boolean; // true par défaut
}

export default function AuthGuard({ children, requireApproved = true }: AuthGuardProps) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "redirect">("loading");

  useEffect(() => {
    async function check() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.replace("/connexion");
        setStatus("redirect");
        return;
      }

      if (requireApproved) {
        const profile = await getProfileByUserId(session.user.id);

        if (!profile) {
          router.replace("/connexion");
          setStatus("redirect");
          return;
        }

        if (profile.status === "en_attente") {
          router.replace("/connexion/en-attente");
          setStatus("redirect");
          return;
        }

        if (profile.status === "suspended" || profile.status === "refused") {
          router.replace("/connexion");
          setStatus("redirect");
          return;
        }
      }

      setStatus("ok");
    }

    check();
  }, [router, requireApproved]);

  if (status === "loading") {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f8f9fa",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTopColor: "#00989D",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
              margin: "0 auto 16px",
            }}
          />
          <p style={{ color: "#6b7280", fontSize: "14px" }}>Chargement...</p>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  if (status === "redirect") return null;

  return <>{children}</>;
}
