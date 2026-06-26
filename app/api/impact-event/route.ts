import { NextResponse } from "next/server";

// Relais des événements d'impact de la BAO vers Make (puis Airtable).
// L'URL du webhook Make est gardée côté serveur (MAKE_IMPACT_WEBHOOK_URL).
// Tant qu'elle n'est pas configurée, la route ne fait rien (no-op) : on peut
// déployer le code sans rien casser, et activer la synchro plus tard.
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Validation minimale : un type d'événement et un email de rattachement.
    if (!body || typeof body.event !== "string" || typeof body.email !== "string") {
      return NextResponse.json({ ok: false, error: "payload invalide" }, { status: 400 });
    }

    const url = process.env.MAKE_IMPACT_WEBHOOK_URL;
    if (!url) {
      // Synchro pas encore branchée : on ignore proprement.
      return NextResponse.json({ ok: true, skipped: true });
    }

    await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("impact-event route:", e);
    // Best-effort : on ne renvoie jamais d'erreur bloquante au navigateur.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
