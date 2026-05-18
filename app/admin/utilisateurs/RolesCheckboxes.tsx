"use client";

// app/admin/utilisateurs/RolesCheckboxes.tsx
// Composant à utiliser dans la page admin/utilisateurs/page.tsx
// pour permettre la sélection multiple de rôles admin.
//
// Usage :
//   <RolesCheckboxes
//     selectedRoles={profile.admin_roles || []}
//     onChange={(roles) => updateProfileRoles(profile.id, roles.length > 0, roles)}
//     disabled={actionLoading === profile.id}
//   />

import { useState } from "react";

const ALL_ROLES = [
  { value: "super_admin", label: "Super Admin", desc: "Tous les droits", color: "#FCC33E" },
  { value: "editor", label: "Éditeur", desc: "Gestion fiches, objectifs, clés", color: "#00989D" },
  { value: "moderator", label: "Modérateur", desc: "Gestion utilisateurs", color: "#0891b2" },
  { value: "pedagogical_reviewer", label: "Responsable validation pédago", desc: "Validation propositions et analyses IA", color: "#16a34a" },
  { value: "analyst", label: "Analyste", desc: "Lecture analytics", color: "#6B2468" },
];

export default function RolesCheckboxes({
  selectedRoles,
  onChange,
  disabled,
  inline,
}: {
  selectedRoles: string[];
  onChange: (newRoles: string[]) => void;
  disabled?: boolean;
  inline?: boolean; // true = layout horizontal compact (pour table), false = vertical (pour modal)
}) {
  const [pending, setPending] = useState(false);

  function handleToggle(roleValue: string) {
    if (disabled || pending) return;
    setPending(true);

    let newRoles: string[];
    if (selectedRoles.includes(roleValue)) {
      // Retirer le rôle
      newRoles = selectedRoles.filter((r) => r !== roleValue);
    } else {
      // Ajouter le rôle
      newRoles = [...selectedRoles, roleValue];
    }

    // Note : si on coche super_admin, on garde les autres (super_admin override déjà côté layout.tsx)
    onChange(newRoles);
    setTimeout(() => setPending(false), 300);
  }

  if (inline) {
    // Layout compact pour intégration dans la table
    return (
      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
        {ALL_ROLES.map((role) => {
          const isSelected = selectedRoles.includes(role.value);
          return (
            <button
              key={role.value}
              onClick={() => handleToggle(role.value)}
              disabled={disabled || pending}
              title={role.desc}
              style={{
                background: isSelected ? role.color : "white",
                color: isSelected ? "white" : "#374151",
                border: `1.5px solid ${isSelected ? role.color : "#e5e7eb"}`,
                borderRadius: "8px",
                padding: "4px 10px",
                fontSize: "11px",
                fontWeight: 700,
                cursor: disabled || pending ? "not-allowed" : "pointer",
                fontFamily: "inherit",
                opacity: disabled ? 0.5 : 1,
                transition: "all 0.15s",
              }}
            >
              {isSelected ? "✓ " : ""}{role.label}
            </button>
          );
        })}
      </div>
    );
  }

  // Layout vertical (modal)
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <div style={{ fontSize: "13px", fontWeight: 700, color: "#2B3442", marginBottom: "4px" }}>
        Rôles administrateur
      </div>
      <div style={{ fontSize: "12px", color: "#6b7280", marginBottom: "10px" }}>
        Un admin peut cumuler plusieurs rôles. Super Admin donne tous les droits.
      </div>
      {ALL_ROLES.map((role) => {
        const isSelected = selectedRoles.includes(role.value);
        return (
          <label
            key={role.value}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "10px 14px",
              background: isSelected ? `${role.color}10` : "white",
              border: `2px solid ${isSelected ? role.color : "#e5e7eb"}`,
              borderRadius: "10px",
              cursor: disabled || pending ? "not-allowed" : "pointer",
              transition: "all 0.15s",
              opacity: disabled ? 0.6 : 1,
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => handleToggle(role.value)}
              disabled={disabled || pending}
              style={{
                width: "18px",
                height: "18px",
                accentColor: role.color,
                cursor: disabled || pending ? "not-allowed" : "pointer",
              }}
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: "14px", fontWeight: 700, color: isSelected ? role.color : "#2B3442" }}>
                {role.label}
              </div>
              <div style={{ fontSize: "12px", color: "#6b7280", marginTop: "2px" }}>
                {role.desc}
              </div>
            </div>
          </label>
        );
      })}
    </div>
  );
}
