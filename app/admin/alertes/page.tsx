"use client";

import { useEffect, useState } from "react";
import {
  getAuthErrorLogs,
  markAuthErrorSeen,
  markAllAuthErrorsSeen,
  deleteAuthErrorLog,
  AuthErrorLog,
} from "@/lib/auth";
import { AlertTriangle, LogIn, UserPlus, Check, Trash2 } from "lucide-react";

type Filter = "alertes" | "all";

export default function AdminAlertesPage() {
  const [logs, setLogs] = useState<AuthErrorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("alertes");
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const data = await getAuthErrorLogs(300);
    setLogs(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  async function handleSeen(id: string, seen: boolean) {
    setBusy(id);
    try {
      await markAuthErrorSeen(id, seen);
      setLogs((prev) => prev.map((l) => (l.id === id ? { ...l, seen } : l)));
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleDelete(id: string) {
    setBusy(id);
    try {
      await deleteAuthErrorLog(id);
      setLogs((prev) => prev.filter((l) => l.id !== id));
    } catch (e) {
      console.error(e);
    } finally {
      setBusy(null);
    }
  }

  async function handleMarkAll() {
    try {
      await markAllAuthErrorsSeen();
      setLogs((prev) => prev.map((l) => ({ ...l, seen: true })));
    } catch (e) {
      console.error(e);
    }
  }

  const filtered = logs.filter((l) => (filter === "alertes" ? l.is_system : true));

  const counts = {
    alertes: logs.filter((l) => l.is_system).length,
    all: logs.length,
  };
  const unseenSystem = logs.filter((l) => l.is_system && !l.seen).length;

  function formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return iso;
    }
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
        Chargement des alertes…
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", flexWrap: "wrap" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2B3442", marginBottom: "4px" }}>
            Alertes connexion / inscription
          </h1>
          <p style={{ fontSize: "14px", color: "#6b7280" }}>
            Erreurs survenues lorsqu&apos;une personne tente de s&apos;inscrire ou de se connecter.
          </p>
        </div>
        {unseenSystem > 0 && (
          <button
            onClick={handleMarkAll}
            style={{
              padding: "10px 16px",
              borderRadius: "10px",
              border: "1px solid var(--line-strong, #d1d5db)",
              background: "white",
              color: "#2B3442",
              fontSize: "13px",
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "inherit",
            }}
          >
            Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "24px", flexWrap: "wrap" }}>
        {(["alertes", "all"] as Filter[]).map((f) => {
          const labels: Record<Filter, string> = {
            alertes: "Alertes système",
            all: "Tout l'historique",
          };
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: filter === f ? "2px solid #2B3442" : "2px solid #e5e7eb",
                background: filter === f ? "#2B3442" : "white",
                color: filter === f ? "white" : "#6b7280",
                fontSize: "13px",
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              {labels[f]} ({counts[f]})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: "white", borderRadius: "12px", border: "1px solid #e5e7eb", padding: "48px", textAlign: "center", color: "#9ca3af" }}>
          {filter === "alertes"
            ? "Aucune alerte système. Tout va bien. 🎉"
            : "Aucune erreur enregistrée."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {filtered.map((l) => {
            const isSignup = l.kind === "signup";
            return (
              <div
                key={l.id}
                style={{
                  background: l.is_system && !l.seen ? "#fef2f2" : "white",
                  borderRadius: "12px",
                  border: l.is_system && !l.seen ? "1px solid #fecaca" : "1px solid #e5e7eb",
                  padding: "16px 18px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                  opacity: l.seen ? 0.7 : 1,
                }}
              >
                <div style={{ marginTop: "2px", flexShrink: 0 }}>
                  {l.is_system ? (
                    <AlertTriangle size={20} color="#dc2626" />
                  ) : isSignup ? (
                    <UserPlus size={20} color="#6b7280" />
                  ) : (
                    <LogIn size={20} color="#6b7280" />
                  )}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        textTransform: "uppercase",
                        letterSpacing: "0.04em",
                        padding: "2px 8px",
                        borderRadius: "6px",
                        background: isSignup ? "#e0e7ff" : "#f3f4f6",
                        color: isSignup ? "#3730a3" : "#374151",
                      }}
                    >
                      {isSignup ? "Inscription" : "Connexion"}
                    </span>
                    {l.is_system && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          textTransform: "uppercase",
                          letterSpacing: "0.04em",
                          padding: "2px 8px",
                          borderRadius: "6px",
                          background: "#fee2e2",
                          color: "#991b1b",
                        }}
                      >
                        Alerte système
                      </span>
                    )}
                    <span style={{ fontSize: "12px", color: "#9ca3af", marginLeft: "auto" }}>
                      {formatDate(l.created_at)}
                    </span>
                  </div>

                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#2B3442", wordBreak: "break-all" }}>
                    {l.email || "(email inconnu)"}
                  </div>
                  {l.message && (
                    <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "4px", wordBreak: "break-word" }}>
                      {l.message}
                    </div>
                  )}
                </div>

                <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                  <button
                    title={l.seen ? "Marquer comme non lu" : "Marquer comme lu"}
                    disabled={busy === l.id}
                    onClick={() => handleSeen(l.id, !l.seen)}
                    style={{
                      padding: "6px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      background: l.seen ? "#f3f4f6" : "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Check size={16} color={l.seen ? "#16a34a" : "#9ca3af"} />
                  </button>
                  <button
                    title="Supprimer"
                    disabled={busy === l.id}
                    onClick={() => handleDelete(l.id)}
                    style={{
                      padding: "6px",
                      borderRadius: "8px",
                      border: "1px solid #e5e7eb",
                      background: "white",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Trash2 size={16} color="#9ca3af" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
