import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
// Clé service-role : permet de confirmer l'email d'un utilisateur côté Auth
// (admin.updateUserById). Sans elle, un compte validé par l'admin reste bloqué
// à la connexion tant qu'il n'a pas cliqué le lien de confirmation reçu à
// l'inscription. La validation admin fait office de vérification équivalente.
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

// Origines autorisées à appeler la fonction depuis le navigateur.
const ALLOWED_ORIGINS = ["https://bao.lit-up.fr", "http://localhost:3000"];

function corsHeaders(origin: string | null) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

// Échappement HTML : empêche toute injection de balises/liens via `prenom`.
function escapeHtml(value: string): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

serve(async (req) => {
  const cors = corsHeaders(req.headers.get("Origin"));
  const jsonHeaders = { ...cors, "Content-Type": "application/json" };

  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: cors });
  }

  try {
    // ─── Réservé aux administrateurs ───
    // verify_jwt = true garantit un JWT valide, mais PAS le rôle. Sans ce
    // contrôle, n'importe quel utilisateur connecté pourrait envoyer un mail
    // « accès validé » (depuis noreply@lit-up.fr) à une adresse arbitraire.
    const authHeader = req.headers.get("Authorization") || "";
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Authentification requise" }), {
        status: 401,
        headers: jsonHeaders,
      });
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", user.id)
      .maybeSingle();
    if (!profile?.is_admin) {
      return new Response(JSON.stringify({ error: "Action réservée aux administrateurs" }), {
        status: 403,
        headers: jsonHeaders,
      });
    }

    const { email, prenom, userId } = await req.json();

    if (!email || !prenom) {
      return new Response(JSON.stringify({ error: "email et prenom requis" }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    // ─── Confirmer l'email côté Auth ───
    // L'approbation admin vaut vérification : on confirme donc l'email pour que
    // l'utilisateur puisse se connecter immédiatement, sans avoir à cliquer le
    // lien de confirmation envoyé à l'inscription (souvent perdu / dans les spams).
    // Idempotent : confirmer un email déjà confirmé ne pose pas de problème.
    let emailConfirmed = false;
    if (SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
          auth: { persistSession: false, autoRefreshToken: false },
        });

        // On a besoin de l'id Auth. Si l'appelant ne l'a pas fourni, on le
        // retrouve à partir de l'email.
        let targetId: string | null = userId || null;
        if (!targetId) {
          // listUsers est paginé : on parcourt jusqu'à trouver l'email.
          for (let page = 1; page <= 20 && !targetId; page++) {
            const { data: list, error: listErr } =
              await admin.auth.admin.listUsers({ page, perPage: 200 });
            if (listErr || !list?.users?.length) break;
            const match = list.users.find(
              (u) => (u.email || "").toLowerCase() === email.toLowerCase()
            );
            if (match) targetId = match.id;
            if (list.users.length < 200) break; // dernière page
          }
        }

        if (targetId) {
          const { error: confirmErr } = await admin.auth.admin.updateUserById(
            targetId,
            { email_confirm: true }
          );
          if (confirmErr) {
            console.error("Erreur confirmation email:", confirmErr.message);
          } else {
            emailConfirmed = true;
          }
        } else {
          console.error("Utilisateur Auth introuvable pour:", email);
        }
      } catch (confirmCatch) {
        console.error("Exception confirmation email:", confirmCatch);
      }
    } else {
      console.warn(
        "SUPABASE_SERVICE_ROLE_KEY absente : email non confirmé automatiquement."
      );
    }

    const safePrenom = escapeHtml(prenom);

    const htmlContent = [
      '<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">',
      '<img src="https://bao.lit-up.fr/logo-litup.png" alt="Lit uP" style="height: 32px; margin-bottom: 24px;" />',
      '<h1 style="font-size: 22px; color: #2B3442; margin-bottom: 16px;">Bonjour ' + safePrenom + ',</h1>',
      '<p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 16px;">Bonne nouvelle ! Votre accès à la <strong>Boîte à Outils Lit uP</strong> a été validé par notre équipe.</p>',
      '<p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px;">Vous pouvez dès maintenant vous connecter et explorer les 30 outils d\'animation à votre disposition.</p>',
      '<a href="https://bao.lit-up.fr/connexion" style="display: inline-block; padding: 14px 28px; background: #00989D; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">Accéder à la Boîte à Outils</a>',
      '<p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 28px;">N\'hésitez pas à mettre vos outils préférés en favoris et à partager vos retours d\'expérience directement sur la plateforme.</p>',
      '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />',
      '<p style="font-size: 12px; color: #9ca3af;">L\'équipe Lit uP<br /><a href="https://www.lit-up.fr" style="color: #00989D;">www.lit-up.fr</a></p>',
      '</div>',
    ].join("");

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: "Lit uP <noreply@lit-up.fr>",
        to: [email],
        subject: "Votre accès à la Boîte à Outils Lit uP est activé !",
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 400,
        headers: jsonHeaders,
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id, emailConfirmed }), {
      status: 200,
      headers: jsonHeaders,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: jsonHeaders,
    });
  }
});
