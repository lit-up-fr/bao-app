export async function generateFichePdf(fiche: any, cles?: { nom: string; emoji?: string }[]) {
  // @ts-ignore
  console.log("PDF generation started", fiche.nom);
  const html2pdf = (await import("html2pdf.js")).default;
  console.log("html2pdf loaded", html2pdf);

  const duree = fiche.duree_libre || (fiche.duree_min && fiche.duree_max && fiche.duree_min !== fiche.duree_max
    ? `${fiche.duree_min} min – ${fiche.duree_max} min`
    : fiche.duree_min ? `${fiche.duree_min} min` : "");

  const deroule = Array.isArray(fiche.deroule) ? fiche.deroule : [];
  const conseils = Array.isArray(fiche.conseils) ? fiche.conseils : [];
  const variantes = Array.isArray(fiche.variantes) ? fiche.variantes : [];
  const materielListe = Array.isArray(fiche.materiel_liste) ? fiche.materiel_liste : [];

  function strip(html: string): string {
    if (!html) return "";
    return html
      .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2 ($1)')
      .replace(/<br\s*\/?>/gi, "<br>")
      .replace(/<\/p>/gi, "<br>")
      .replace(/<\/li>/gi, "</li>")
      .replace(/<(?!br|strong|em|\/strong|\/em|\/li|li|ul|\/ul|ol|\/ol)[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();
  }

  const infos = [
    duree ? `<div class="info-item"><span class="info-label">DURÉE</span><span class="info-value">${duree}</span></div>` : "",
    fiche.format ? `<div class="info-item"><span class="info-label">FORMAT</span><span class="info-value">${fiche.format}</span></div>` : "",
    fiche.participants ? `<div class="info-item"><span class="info-label">PARTICIPANTS</span><span class="info-value">${fiche.participants}</span></div>` : "",
    fiche.materiel ? `<div class="info-item"><span class="info-label">MATÉRIEL</span><span class="info-value">${fiche.materiel}</span></div>` : "",
    fiche.public_pro_pair ? `<div class="info-item"><span class="info-label">PUBLIC</span><span class="info-value">${fiche.public_pro_pair}</span></div>` : "",
    fiche.source ? `<div class="info-item"><span class="info-label">SOURCE</span><span class="info-value">${fiche.source}</span></div>` : "",
  ].filter(Boolean).join("\n");

  const clesHtml = (cles || []).map(c =>
    `<span class="cle-badge">${c.emoji || ""} ${c.nom}</span>`
  ).join(" ");

  const derouleHtml = deroule.map((s: any, i: number) => {
    const titre = s.titre || s.title || `Étape ${i + 1}`;
    const dureeS = s.duree || s.durée || "";
    const actions = Array.isArray(s.actions) ? s.actions : [];
    const actionsHtml = actions.map((a: any) => {
      const text = typeof a === "string" ? a : (a.text || "");
      return text ? `<li>${strip(text)}</li>` : "";
    }).filter(Boolean).join("\n");

    return `
      <div class="step">
        <div class="step-header">
          <span class="step-num">${i + 1}</span>
          <span class="step-title">${strip(titre)}</span>
          ${dureeS ? `<span class="step-duree">(${dureeS})</span>` : ""}
        </div>
        ${actionsHtml ? `<ul class="step-actions">${actionsHtml}</ul>` : ""}
      </div>`;
  }).join("\n");

  const conseilsHtml = conseils.map((c: any) => {
    const text = typeof c === "string" ? c : (c.text || c.conseil || "");
    return text ? `<li>${strip(text)}</li>` : "";
  }).filter(Boolean).join("\n");

  const variantesHtml = variantes.map((v: any) => {
    const text = typeof v === "string" ? v : (v.text || v.variante || "");
    return text ? `<li>${strip(text)}</li>` : "";
  }).filter(Boolean).join("\n");

  const materielHtml = materielListe.map((m: any) => {
    const text = typeof m === "string" ? m : (m.item || m.titre || "");
    return text ? `<li>${strip(text)}</li>` : "";
  }).filter(Boolean).join("\n");

  const html = `
    <div id="pdf-fiche" style="font-family: 'Source Sans 3', 'Source Sans Pro', 'Segoe UI', Arial, sans-serif; color: #2B3442; line-height: 1.5; max-width: 700px;">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Source+Sans+3:wght@400;600;700;800&display=swap');
        .pdf-header {
          background: linear-gradient(135deg, #00989D 0%, #007479 100%);
          color: white;
          padding: 28px 30px 22px;
          border-radius: 0;
          margin: 0; margin-left: -10px; margin-right: -10px; margin-top: -10px;
        }
        .pdf-header h1 {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 6px;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }
        .pdf-header .subtitle {
          font-size: 11px;
          opacity: 0.75;
          margin: 0;
        }
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 8px;
          background: #F6F6F8;
          padding: 14px 16px;
          margin: 0 -10px;
          border-bottom: 2px solid #e5e7eb;
        }
        .info-item { }
        .info-label {
          display: block;
          font-size: 8px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.06em;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 11px;
          font-weight: 600;
          color: #2B3442;
        }
        .cles-section {
          padding: 10px 0 6px;
        }
        .cles-label {
          font-size: 8px;
          font-weight: 700;
          color: #6b7280;
          letter-spacing: 0.06em;
          margin-bottom: 6px;
        }
        .cle-badge {
          display: inline-block;
          background: #00989D;
          color: white;
          font-size: 9px;
          font-weight: 700;
          padding: 3px 9px;
          border-radius: 10px;
          margin: 0 3px 3px 0;
        }
        .intention-box {
          background: #f0fafa;
          border-left: 4px solid #00989D;
          padding: 12px 16px;
          margin: 16px 0;
          border-radius: 0 8px 8px 0;
        }
        .intention-box p {
          font-size: 12px;
          font-style: italic;
          color: #2B3442;
          margin: 0;
          line-height: 1.6;
        }
        .section-title {
          font-size: 15px;
          font-weight: 800;
          color: #00989D;
          margin: 20px 0 10px;
          padding-bottom: 4px;
          border-bottom: 2px solid #e5e7eb;
        }
        .section-title.prune { color: #6B2468; }
        .body-text {
          font-size: 11px;
          line-height: 1.6;
          color: #2B3442;
          margin: 0 0 10px;
        }
        .step {
          margin-bottom: 14px;
          page-break-inside: avoid;
        }
        .step-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 6px;
        }
        .step-num {
          display: inline-block;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #00989D;
          color: white;
          font-size: 11px;
          font-weight: 800;
          text-align: center;
          line-height: 22px;
          flex-shrink: 0;
        }
        .step-title {
          font-size: 13px;
          font-weight: 700;
          color: #2B3442;
        }
        .step-duree {
          font-size: 10px;
          color: #6b7280;
          font-weight: 400;
        }
        .step-actions {
          margin: 0 0 0 30px;
          padding: 0;
          list-style: none;
        }
        .step-actions li {
          font-size: 10.5px;
          line-height: 1.5;
          color: #2B3442;
          padding: 1.5px 0;
          padding-left: 12px;
          position: relative;
        }
        .step-actions li::before {
          content: "–";
          position: absolute;
          left: 0;
          color: #00989D;
          font-weight: 700;
        }
        ul.conseil-list, ul.variante-list, ul.materiel-list {
          margin: 0;
          padding: 0 0 0 16px;
          list-style: none;
        }
        ul.conseil-list li, ul.variante-list li, ul.materiel-list li {
          font-size: 10.5px;
          line-height: 1.6;
          padding: 3px 0;
          padding-left: 12px;
          position: relative;
        }
        ul.conseil-list li::before { content: "💡"; position: absolute; left: -4px; }
        ul.variante-list li::before { content: "→"; position: absolute; left: 0; color: #6B2468; font-weight: 700; }
        ul.materiel-list li::before { content: "•"; position: absolute; left: 0; color: #00989D; font-weight: 700; }
        .footer {
          margin-top: 24px;
          padding-top: 10px;
          border-top: 2px solid #e5e7eb;
          text-align: center;
          font-size: 9px;
          color: #9ca3af;
        }
      </style>

      <div class="pdf-header">
        <h1>${fiche.emoji || ""} ${fiche.nom}</h1>
        <p class="subtitle">Boîte à Outils Pédagogique Lit uP</p>
      </div>

      <div class="info-grid">
        ${infos}
      </div>

      ${clesHtml ? `
        <div class="cles-section">
          <div class="cles-label">CLÉS DE MOTIVATION</div>
          ${clesHtml}
        </div>
      ` : ""}

      ${fiche.intention ? `
        <div class="intention-box">
          <p>${strip(fiche.intention)}</p>
        </div>
      ` : ""}

      ${fiche.pourquoi ? `
        <div class="section-title">Pourquoi cet outil fonctionne</div>
        <p class="body-text">${strip(fiche.pourquoi)}</p>
      ` : ""}

      ${materielHtml ? `
        <div class="section-title">Matériel nécessaire</div>
        <ul class="materiel-list">${materielHtml}</ul>
      ` : ""}

      ${derouleHtml ? `
        <div class="section-title">Déroulé</div>
        ${derouleHtml}
      ` : ""}

      ${conseilsHtml ? `
        <div class="section-title">Conseils pour bien animer</div>
        <ul class="conseil-list">${conseilsHtml}</ul>
      ` : ""}

      ${variantesHtml ? `
        <div class="section-title prune">Variantes possibles</div>
        <ul class="variante-list">${variantesHtml}</ul>
      ` : ""}

      <div class="footer">
        Lit uP – Boîte à Outils Pédagogique – bao.lit-up.fr
      </div>
    </div>
  `;

  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "absolute";
  container.style.left = "-9999px";
  container.style.top = "0";
  document.body.appendChild(container);

  const element = container.querySelector("#pdf-fiche") as HTMLElement;
  const fileName = fiche.nom.replace(/[^a-zA-Z0-9\u00e0-\u00ff\s-]/g, "").replace(/\s+/g, "-").toLowerCase();

  try {
    await html2pdf().set({
      margin: [2, 10, 15, 10],
      filename: `${fileName}.pdf`,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true, letterRendering: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      // @ts-ignore
      pagebreak: { mode: ["avoid-all", "css", "legacy"] },
    }).from(element).save();
  } finally {
    document.body.removeChild(container);
  }
}
