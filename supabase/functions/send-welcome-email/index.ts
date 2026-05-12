import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { email, prenom } = await req.json();

    if (!email || !prenom) {
      return new Response(JSON.stringify({ error: "email et prenom requis" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const htmlContent = [
      '<div style="font-family: Arial, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">',
      '<img src="https://bao.lit-up.fr/logo-litup.png" alt="Lit uP" style="height: 32px; margin-bottom: 24px;" />',
      '<h1 style="font-size: 22px; color: #2B3442; margin-bottom: 16px;">Bonjour ' + prenom + ',</h1>',
      '<p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 16px;">Bonne nouvelle ! Votre acc\u00e8s \u00e0 la <strong>Bo\u00eete \u00e0 Outils Lit uP</strong> a \u00e9t\u00e9 valid\u00e9 par notre \u00e9quipe.</p>',
      '<p style="font-size: 15px; color: #374151; line-height: 1.6; margin-bottom: 24px;">Vous pouvez d\u00e8s maintenant vous connecter et explorer les 30 outils d\'animation \u00e0 votre disposition.</p>',
      '<a href="https://bao.lit-up.fr/connexion" style="display: inline-block; padding: 14px 28px; background: #00989D; color: white; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 15px;">Acc\u00e9der \u00e0 la Bo\u00eete \u00e0 Outils</a>',
      '<p style="font-size: 14px; color: #6b7280; line-height: 1.6; margin-top: 28px;">N\'h\u00e9sitez pas \u00e0 mettre vos outils pr\u00e9f\u00e9r\u00e9s en favoris et \u00e0 partager vos retours d\'exp\u00e9rience directement sur la plateforme.</p>',
      '<hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;" />',
      '<p style="font-size: 12px; color: #9ca3af;">L\'\u00e9quipe Lit uP<br /><a href="https://www.lit-up.fr" style="color: #00989D;">www.lit-up.fr</a></p>',
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
        subject: "Votre acc\u00e8s \u00e0 la Bo\u00eete \u00e0 Outils Lit uP est activ\u00e9 !",
        html: htmlContent,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return new Response(JSON.stringify({ error: data }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, id: data.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
