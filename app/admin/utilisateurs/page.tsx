"use client";

import { useEffect, useState } from "react";
import { getAllProfiles, updateProfileStatus, updateProfileRole, updateProfileRoles, updateProfileInfo, deleteUserCompletely, Profile, ProfileEditableInfo } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { getProfileByUserId } from "@/lib/auth";
import RolesCheckboxes from "./RolesCheckboxes";

type StatusFilter = "all" | "en_attente" | "active" | "suspended" | "refused";

export default function AdminUtilisateursPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  // Édition des infos d'un profil
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<ProfileEditableInfo>({});
  const [savingEdit, setSavingEdit] = useState(false);

  // On quitte le mode édition dès qu'on change de profil sélectionné.
  useEffect(() => {
    setEditing(false);
  }, [selectedProfile?.id]);

  const isSuperAdmin = currentUserRole === "super_admin";
  // Un admin simple ne peut éditer que les non-admins ; le super-admin édite tout.
  const canEditSelected =
    !!selectedProfile && (isSuperAdmin || !selectedProfile.is_admin);

  function startEditing() {
    if (!selectedProfile) return;
    setEditForm({
      prenom: selectedProfile.prenom || "",
      nom: selectedProfile.nom || "",
      telephone: selectedProfile.telephone || "",
      structure: selectedProfile.structure || "",
      poste: selectedProfile.poste || "",
      code_postal: selectedProfile.code_postal || "",
      categorie_pro: selectedProfile.categorie_pro || "",
      categorie_pro_autre: selectedProfile.categorie_pro_autre || "",
      region: selectedProfile.region || "",
      tranche_age: selectedProfile.tranche_age || "",
      public_accompagne: selectedProfile.public_accompagne || "",
    });
    setEditing(true);
  }

  async function handleSaveInfo() {
    if (!selectedProfile) return;
    setSavingEdit(true);
    try {
      // Chaînes vides -> null pour les champs optionnels ; on garde une chaîne
      // pour prénom/nom/catégorie (champs requis à l'inscription).
      const payload: ProfileEditableInfo = {
        prenom: (editForm.prenom || "").trim(),
        nom: (editForm.nom || "").trim(),
        telephone: (editForm.telephone || "").trim() || null,
        structure: (editForm.structure || "").trim() || null,
        poste: (editForm.poste || "").trim() || null,
        code_postal: (editForm.code_postal || "").trim() || null,
        categorie_pro: (editForm.categorie_pro || "").trim(),
        categorie_pro_autre: (editForm.categorie_pro_autre || "").trim() || null,
        region: (editForm.region || "").trim() || null,
        tranche_age: (editForm.tranche_age || "").trim() || null,
        public_accompagne: (editForm.public_accompagne || "").trim() || null,
      };
      await updateProfileInfo(selectedProfile.id, payload);
      setProfiles((prev) =>
        prev.map((p) => (p.id === selectedProfile.id ? { ...p, ...payload } as Profile : p))
      );
      setSelectedProfile((prev) => (prev ? ({ ...prev, ...payload } as Profile) : null));
      setEditing(false);
    } catch (e) {
      console.error("Erreur mise à jour infos:", e);
      alert(
        "Erreur lors de l'enregistrement. Un administrateur ne peut pas modifier un autre administrateur (réservé au super-admin)."
      );
    } finally {
      setSavingEdit(false);
    }
  }

  async function loadProfiles() {
    try {
      const data = await getAllProfiles();
      setProfiles(data);
    } catch (e) {
      console.error("Erreur chargement profils:", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadProfiles();
    // Charger le rôle de l'utilisateur courant
    async function loadCurrentRole() {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const prof = await getProfileByUserId(session.user.id);
        // Lire admin_roles[] en priorité, sinon fallback sur admin_role (legacy)
        const rolesArray = (prof as any)?.admin_roles as string[] | undefined;
        if (rolesArray && rolesArray.length > 0) {
          setCurrentUserRole(rolesArray.includes("super_admin") ? "super_admin" : rolesArray[0]);
        } else {
          setCurrentUserRole(prof?.admin_role || (prof?.is_admin ? "super_admin" : null));
        }
      }
    }
    loadCurrentRole();
  }, []);

  async function handleStatusChange(userId: string, newStatus: Profile["status"]) {
    setActionLoading(userId);
    try {
      await updateProfileStatus(userId, newStatus);
      setProfiles((prev) =>
        prev.map((p) => (p.id === userId ? { ...p, status: newStatus } : p))
      );
      if (selectedProfile?.id === userId) {
        setSelectedProfile((prev) => (prev ? { ...prev, status: newStatus } : null));
      }

      // Envoyer l'email de bienvenue automatiquement quand on approuve
      if (newStatus === "active") {
        const user = profiles.find((p) => p.id === userId);
        if (user && !user.is_admin) {
          try {
            // On passe par le client Supabase (functions.invoke) plut\u00f4t que par
            // un fetch brut : il joint automatiquement le JWT de l'admin connect\u00e9
            // et la cl\u00e9 apikey, ce qui satisfait verify_jwt = true sur la fonction.
            const { data: emailData, error: emailError } =
              await supabase.functions.invoke("send-welcome-email", {
                body: { email: user.email, prenom: user.prenom, userId: user.id },
              });
            if (!emailError) {
              alert("Email de bienvenue envoy\u00e9 \u00e0 " + user.email + " !");
            } else {
              console.error("Erreur envoi email:", emailError, emailData);
              alert("Utilisateur approuv\u00e9, mais l'email n'a pas pu \u00eatre envoy\u00e9. Vous pouvez le contacter manuellement.");
            }
          } catch (emailErr) {
            console.error("Erreur envoi email:", emailErr);
            alert("Utilisateur approuv\u00e9, mais l'email n'a pas pu \u00eatre envoy\u00e9.");
          }
        }
      }
    } catch (e) {
      console.error("Erreur mise à jour statut:", e);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRoleChange(userId: string, role: string) {
    setActionLoading(userId);
    try {
      const isAdmin = role !== "none";
      const adminRole = role === "none" ? null : role;
      await updateProfileRole(userId, isAdmin, adminRole);
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId ? { ...p, is_admin: isAdmin, admin_role: adminRole } : p
        )
      );
      if (selectedProfile?.id === userId) {
        setSelectedProfile((prev) =>
          prev ? { ...prev, is_admin: isAdmin, admin_role: adminRole } : null
        );
      }
    } catch (e) {
      console.error("Erreur mise à jour rôle:", e);
    } finally {
      setActionLoading(null);
    }
  }

  // 🆕 Nouvelle fonction : update plusieurs rôles à la fois (tableau)
  async function handleRolesChange(userId: string, newRoles: string[]) {
    setActionLoading(userId);
    try {
      const isAdmin = newRoles.length > 0;
      await updateProfileRoles(userId, isAdmin, newRoles);
      // Pour rétrocompat, on met aussi à jour admin_role = 1er rôle
      const legacyRole = newRoles.length > 0 ? newRoles[0] : null;
      setProfiles((prev) =>
        prev.map((p) =>
          p.id === userId
            ? { ...p, is_admin: isAdmin, admin_role: legacyRole, admin_roles: newRoles }
            : p
        )
      );
      if (selectedProfile?.id === userId) {
        setSelectedProfile((prev) =>
          prev ? { ...prev, is_admin: isAdmin, admin_role: legacyRole, admin_roles: newRoles } : null
        );
      }
    } catch (e) {
      console.error("Erreur mise à jour rôles:", e);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleDelete(userId: string, userName: string) {
    if (!confirm(`Supprimer définitivement ${userName} ? Cette action est irréversible (profil, favoris, consultations, retours seront supprimés).`)) return;
    if (!confirm(`Confirmez-vous la suppression définitive de ${userName} ?`)) return;

    setActionLoading(userId);
    try {
      await deleteUserCompletely(userId);
      setProfiles((prev) => prev.filter((p) => p.id !== userId));
      if (selectedProfile?.id === userId) setSelectedProfile(null);
    } catch (e) {
      console.error("Erreur suppression:", e);
      alert("Erreur lors de la suppression. Vérifiez que vous avez les droits nécessaires.");
    } finally {
      setActionLoading(null);
    }
  }

  const filtered = profiles.filter((p) => {
    if (filter !== "all" && p.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        p.prenom?.toLowerCase().includes(q) ||
        p.nom?.toLowerCase().includes(q) ||
        p.email?.toLowerCase().includes(q) ||
        p.structure?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const counts = {
    all: profiles.length,
    en_attente: profiles.filter((p) => p.status === "en_attente").length,
    active: profiles.filter((p) => p.status === "active").length,
    suspended: profiles.filter((p) => p.status === "suspended").length,
    refused: profiles.filter((p) => p.status === "refused").length,
  };

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    en_attente: { bg: "#fef3c7", text: "#92400e", label: "En attente" },
    active: { bg: "#d1fae5", text: "#065f46", label: "Actif" },
    suspended: { bg: "#fee2e2", text: "#991b1b", label: "Suspendu" },
    refused: { bg: "#f3f4f6", text: "#6b7280", label: "Refusé" },
  };

  function StatusBadge({ status }: { status: string }) {
    const s = statusColors[status] || statusColors.refused;
    return (
      <span
        style={{
          display: "inline-block",
          padding: "3px 10px",
          borderRadius: "12px",
          fontSize: "12px",
          fontWeight: 600,
          background: s.bg,
          color: s.text,
        }}
      >
        {s.label}
      </span>
    );
  }

  if (loading) {
    return (
      <div style={{ padding: "40px", textAlign: "center", color: "#6b7280" }}>
        Chargement des utilisateurs...
      </div>
    );
  }

  return (
    <div style={{ padding: "0" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "#2B3442", marginBottom: "4px" }}>
          Utilisateurs
        </h1>
        <p style={{ fontSize: "14px", color: "#6b7280" }}>
          Gérer les demandes d'accès et les comptes utilisateurs
        </p>
      </div>

      {/* Stats cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "12px", marginBottom: "24px" }}>
        {(["all", "en_attente", "active", "suspended", "refused"] as StatusFilter[]).map((s) => {
          const labels: Record<StatusFilter, string> = {
            all: "Tous",
            en_attente: "En attente",
            active: "Actifs",
            suspended: "Suspendus",
            refused: "Refusés",
          };
          const colors: Record<StatusFilter, string> = {
            all: "#2B3442",
            en_attente: "#f59e0b",
            active: "#10b981",
            suspended: "#ef4444",
            refused: "#6b7280",
          };
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "14px 16px",
                borderRadius: "10px",
                border: filter === s ? `2px solid ${colors[s]}` : "2px solid #e5e7eb",
                background: filter === s ? `${colors[s]}10` : "white",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <div style={{ fontSize: "24px", fontWeight: 700, color: colors[s] }}>
                {counts[s]}
              </div>
              <div style={{ fontSize: "13px", color: "#6b7280", marginTop: "2px" }}>
                {labels[s]}
              </div>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ marginBottom: "16px" }}>
        <input
          type="text"
          placeholder="Rechercher par nom, email, structure..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: "400px",
            padding: "10px 14px",
            border: "1px solid #d1d5db",
            borderRadius: "8px",
            fontSize: "14px",
            outline: "none",
          }}
        />
      </div>

      {/* Table */}
      <div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              background: "white",
              borderRadius: "12px",
              border: "1px solid #e5e7eb",
              overflow: "hidden",
            }}
          >
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9fafb" }}>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                    Nom
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                    Structure
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                    Statut
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                    Inscription
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "left", fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                    Dernière connexion
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "center", fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                    Connexions
                  </th>
                  <th style={{ padding: "12px 16px", textAlign: "right", fontSize: "13px", fontWeight: 600, color: "#6b7280" }}>
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#9ca3af" }}>
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProfile(p)}
                      style={{
                        borderTop: "1px solid #f3f4f6",
                        cursor: "pointer",
                        background: selectedProfile?.id === p.id ? "#f0fdfa" : "transparent",
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        if (selectedProfile?.id !== p.id) e.currentTarget.style.background = "#f9fafb";
                      }}
                      onMouseLeave={(e) => {
                        if (selectedProfile?.id !== p.id) e.currentTarget.style.background = "transparent";
                      }}
                    >
                      <td style={{ padding: "12px 16px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 600, color: "#2B3442" }}>
                          {p.prenom} {p.nom}
                        </div>
                        <div style={{ fontSize: "12px", color: "#9ca3af" }}>{p.email}</div>
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "14px", color: "#374151" }}>
                        {p.structure || "—"}
                      </td>
                      <td style={{ padding: "12px 16px" }}>
                        <StatusBadge status={p.status} />
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>
                        {p.created_at
                          ? new Date(p.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>
                      <td style={{ padding: "12px 16px", fontSize: "13px", color: "#6b7280" }}>
                        {p.last_seen_at
                          ? new Date(p.last_seen_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "Jamais"}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "center", fontSize: "14px", fontWeight: 600, color: "#2B3442" }}>
                        {p.login_count ?? 0}
                      </td>
                      <td style={{ padding: "12px 16px", textAlign: "right" }}>
                        <div style={{ display: "flex", gap: "6px", justifyContent: "flex-end" }}>
                          {p.status === "en_attente" && (
                            <>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(p.id, "active");
                                }}
                                disabled={actionLoading === p.id}
                                style={{
                                  padding: "5px 12px",
                                  borderRadius: "6px",
                                  border: "none",
                                  background: "#10b981",
                                  color: "white",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Approuver
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(p.id, "refused");
                                }}
                                disabled={actionLoading === p.id}
                                style={{
                                  padding: "5px 12px",
                                  borderRadius: "6px",
                                  border: "1px solid #d1d5db",
                                  background: "white",
                                  color: "#6b7280",
                                  fontSize: "12px",
                                  fontWeight: 600,
                                  cursor: "pointer",
                                }}
                              >
                                Refuser
                              </button>
                            </>
                          )}
                          {p.status === "active" && !p.is_admin && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(p.id, "suspended");
                              }}
                              disabled={actionLoading === p.id}
                              style={{
                                padding: "5px 12px",
                                borderRadius: "6px",
                                border: "1px solid #fecaca",
                                background: "#fef2f2",
                                color: "#dc2626",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Suspendre
                            </button>
                          )}
                          {(p.status === "suspended" || p.status === "refused") && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleStatusChange(p.id, "active");
                              }}
                              disabled={actionLoading === p.id}
                              style={{
                                padding: "5px 12px",
                                borderRadius: "6px",
                                border: "none",
                                background: "#10b981",
                                color: "white",
                                fontSize: "12px",
                                fontWeight: 600,
                                cursor: "pointer",
                              }}
                            >
                              Réactiver
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail modal */}
        {selectedProfile && (
          <div
            onClick={() => setSelectedProfile(null)}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(43, 52, 66, 0.6)",
              zIndex: 100,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: "24px",
            }}
          >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%",
              maxWidth: "440px",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "white",
              borderRadius: "16px",
              border: "1px solid #e5e7eb",
              padding: "24px",
              animation: "modalIn 0.3s ease",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "#2B3442", margin: 0 }}>
                Profil
              </h3>
              <button
                onClick={() => setSelectedProfile(null)}
                style={{
                  background: "none",
                  border: "none",
                  fontSize: "18px",
                  cursor: "pointer",
                  color: "#9ca3af",
                }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                <div>
                  <div style={{ fontSize: "20px", fontWeight: 700, color: "#2B3442" }}>
                    {selectedProfile.prenom} {selectedProfile.nom}
                  </div>
                  <StatusBadge status={selectedProfile.status} />
                </div>
                {canEditSelected && !editing && (
                  <button
                    onClick={startEditing}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      color: "#2B3442",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                      whiteSpace: "nowrap",
                      fontFamily: "inherit",
                    }}
                  >
                    ✎ Modifier
                  </button>
                )}
              </div>

              {editing ? (
                <>
                  <EditRow label="Prénom" value={editForm.prenom || ""} onChange={(v) => setEditForm((f) => ({ ...f, prenom: v }))} />
                  <EditRow label="Nom" value={editForm.nom || ""} onChange={(v) => setEditForm((f) => ({ ...f, nom: v }))} />
                  <DetailRow label="Email (non modifiable ici)" value={selectedProfile.email} />
                  <EditRow label="Téléphone" value={editForm.telephone || ""} onChange={(v) => setEditForm((f) => ({ ...f, telephone: v }))} />
                  <EditRow label="Structure" value={editForm.structure || ""} onChange={(v) => setEditForm((f) => ({ ...f, structure: v }))} />
                  <EditRow label="Poste" value={editForm.poste || ""} onChange={(v) => setEditForm((f) => ({ ...f, poste: v }))} />
                  <EditRow label="Catégorie pro" value={editForm.categorie_pro || ""} onChange={(v) => setEditForm((f) => ({ ...f, categorie_pro: v }))} />
                  {editForm.categorie_pro === "Autre" && (
                    <EditRow label="Catégorie (autre)" value={editForm.categorie_pro_autre || ""} onChange={(v) => setEditForm((f) => ({ ...f, categorie_pro_autre: v }))} />
                  )}
                  <EditRow label="Région" value={editForm.region || ""} onChange={(v) => setEditForm((f) => ({ ...f, region: v }))} />
                  <EditRow label="Code postal" value={editForm.code_postal || ""} onChange={(v) => setEditForm((f) => ({ ...f, code_postal: v }))} />
                  <EditRow label="Tranche d'âge" value={editForm.tranche_age || ""} onChange={(v) => setEditForm((f) => ({ ...f, tranche_age: v }))} />
                  <EditRow label="Public accompagné" value={editForm.public_accompagne || ""} onChange={(v) => setEditForm((f) => ({ ...f, public_accompagne: v }))} />

                  <div style={{ display: "flex", gap: "8px", marginTop: "4px" }}>
                    <button
                      onClick={handleSaveInfo}
                      disabled={savingEdit}
                      style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "none", background: savingEdit ? "#9ca3af" : "#00989D", color: "white", fontSize: "14px", fontWeight: 600, cursor: savingEdit ? "not-allowed" : "pointer", fontFamily: "inherit" }}
                    >
                      {savingEdit ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      disabled={savingEdit}
                      style={{ flex: 1, padding: "10px", borderRadius: "8px", border: "1px solid #d1d5db", background: "white", color: "#6b7280", fontSize: "14px", fontWeight: 600, cursor: "pointer", fontFamily: "inherit" }}
                    >
                      Annuler
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <DetailRow label="Email" value={selectedProfile.email} />
                  <DetailRow label="Téléphone" value={selectedProfile.telephone} />
                  <DetailRow label="Structure" value={selectedProfile.structure} />
                  <DetailRow label="Poste" value={selectedProfile.poste} />
                  <DetailRow label="Catégorie" value={
                    selectedProfile.categorie_pro === "Autre"
                      ? selectedProfile.categorie_pro_autre
                      : selectedProfile.categorie_pro
                  } />
                  <DetailRow label="Région" value={selectedProfile.region} />
                  <DetailRow label="Code postal" value={selectedProfile.code_postal} />
                  <DetailRow label="Tranche d'âge" value={selectedProfile.tranche_age} />
                  <DetailRow label="Public accompagné" value={selectedProfile.public_accompagne} />
                  <DetailRow
                    label="Inscription"
                    value={
                      selectedProfile.created_at
                        ? new Date(selectedProfile.created_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : undefined
                    }
                  />
                  <DetailRow
                    label="Dernière connexion"
                    value={
                      selectedProfile.last_seen_at
                        ? new Date(selectedProfile.last_seen_at).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })
                        : undefined
                    }
                  />
                  <DetailRow
                    label="Nombre de connexions"
                    value={String(selectedProfile.login_count ?? 0)}
                  />
                  <DetailRow
                    label="Newsletter"
                    value={selectedProfile.newsletter_consent ? "Oui" : "Non"}
                  />
                </>
              )}
            </div>

            {/* Rôles admin (super_admin uniquement) - cumulables via checkboxes */}
            {currentUserRole === "super_admin" && (
              <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e5e7eb" }}>
                <RolesCheckboxes
                  selectedRoles={
                    (selectedProfile as any).admin_roles && (selectedProfile as any).admin_roles.length > 0
                      ? (selectedProfile as any).admin_roles
                      : (selectedProfile.admin_role ? [selectedProfile.admin_role] : [])
                  }
                  onChange={(newRoles) => handleRolesChange(selectedProfile.id, newRoles)}
                  disabled={actionLoading === selectedProfile.id}
                />
              </div>
            )}

            {/* Actions */}
            <div style={{ marginTop: "20px", paddingTop: "16px", borderTop: "1px solid #e5e7eb", display: "flex", flexDirection: "column", gap: "8px" }}>
              {selectedProfile.status === "en_attente" && (
                <>
                  <button
                    onClick={() => handleStatusChange(selectedProfile.id, "active")}
                    disabled={actionLoading === selectedProfile.id}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "none",
                      background: "#10b981",
                      color: "white",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Approuver l'accès
                  </button>
                  <button
                    onClick={() => handleStatusChange(selectedProfile.id, "refused")}
                    disabled={actionLoading === selectedProfile.id}
                    style={{
                      padding: "10px",
                      borderRadius: "8px",
                      border: "1px solid #d1d5db",
                      background: "white",
                      color: "#6b7280",
                      fontSize: "14px",
                      fontWeight: 600,
                      cursor: "pointer",
                      width: "100%",
                    }}
                  >
                    Refuser
                  </button>
                </>
              )}
              {selectedProfile.status === "active" && !selectedProfile.is_admin && (
                <button
                  onClick={() => handleStatusChange(selectedProfile.id, "suspended")}
                  disabled={actionLoading === selectedProfile.id}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    background: "#fef2f2",
                    color: "#dc2626",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Suspendre l'accès
                </button>
              )}
              {(selectedProfile.status === "suspended" || selectedProfile.status === "refused") && (
                <button
                  onClick={() => handleStatusChange(selectedProfile.id, "active")}
                  disabled={actionLoading === selectedProfile.id}
                  style={{
                    padding: "10px",
                    borderRadius: "8px",
                    border: "none",
                    background: "#10b981",
                    color: "white",
                    fontSize: "14px",
                    fontWeight: 600,
                    cursor: "pointer",
                    width: "100%",
                  }}
                >
                  Réactiver l'accès
                </button>
              )}
            </div>

            {/* Suppression (super_admin uniquement, pas sur soi-même) */}
            {currentUserRole === "super_admin" && !selectedProfile.is_admin && (
              <div style={{ marginTop: "16px", paddingTop: "16px", borderTop: "1px dashed #fecaca" }}>
                <button
                  onClick={() => handleDelete(selectedProfile.id, `${selectedProfile.prenom} ${selectedProfile.nom}`)}
                  disabled={actionLoading === selectedProfile.id}
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "8px",
                    border: "1px solid #fecaca",
                    background: "white",
                    color: "#dc2626",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    fontFamily: "inherit",
                  }}
                >
                  🗑 Supprimer définitivement
                </button>
              </div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <div style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px" }}>
        {label}
      </div>
      <div style={{ fontSize: "14px", color: value ? "#2B3442" : "#d1d5db", marginTop: "2px" }}>
        {value || "Non renseigné"}
      </div>
    </div>
  );
}

function EditRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <div style={{ fontSize: "11px", fontWeight: 600, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: "4px" }}>
        {label}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "8px 10px",
          border: "1px solid #d1d5db",
          borderRadius: "8px",
          fontSize: "14px",
          outline: "none",
          fontFamily: "inherit",
          color: "#2B3442",
        }}
      />
    </div>
  );
}
