export async function generateFichePdf(fiche: any, cles?: { nom: string; emoji?: string }[]) {
  console.log("PDF generation started", fiche.nom);

  const duree = fiche.duree_libre || (fiche.duree_min && fiche.duree_max && fiche.duree_min !== fiche.duree_max
    ? `${fiche.duree_min} – ${fiche.duree_max} min`
    : fiche.duree_min ? `${fiche.duree_min} min` : "");

  const deroule = Array.isArray(fiche.deroule) ? fiche.deroule : [];
  const conseils = Array.isArray(fiche.conseils) ? fiche.conseils : [];
  const variantes = Array.isArray(fiche.variantes) ? fiche.variantes : [];
  const materielListe = Array.isArray(fiche.materiel_liste) ? fiche.materiel_liste : [];
  const objectifs = Array.isArray(fiche.objectifs) ? fiche.objectifs : [];

  function strip(html: string): string {
    if (!html) return "";
    return html
      .replace(/<a\s+[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '$2')
      .replace(/<br\s*\/?>/gi, "<br>")
      .replace(/<\/p>/gi, "<br>")
      .replace(/<\/li>/gi, "</li>")
      .replace(/<(?!br|strong|em|\/strong|\/em|\/li|li|ul|\/ul|ol|\/ol)[^>]*>/g, "")
      .replace(/&nbsp;/g, " ")
      .replace(/—/g, " :")
      .trim();
  }

  // === DATA PREP ===
  const infoItems: any[] = [];
  if (duree) infoItems.push({ label: "DURÉE", value: duree });
  if (fiche.format) infoItems.push({ label: "FORMAT", value: fiche.format });
  if (fiche.participants) infoItems.push({ label: "PARTICIPANTS", value: fiche.participants });
  if (fiche.materiel_niveau) infoItems.push({ label: "MATÉRIEL", value: fiche.materiel_niveau });

  const infoGridHtml = infoItems.length ? infoItems.map((item: any) => `
    <td class="info-cell" valign="middle">
      <div class="info-label">${item.label}</div>
      <div class="info-value">${item.value}</div>
    </td>
  `).join("") : "";

  const metaParts: string[] = [];
  if (fiche.public_cible) metaParts.push(`<span class="meta-label">POUR QUI ?</span> ${fiche.public_cible}`);
  if (fiche.source) metaParts.push(`<span class="meta-label">SOURCE</span> ${fiche.source}`);
  const metaRow = metaParts.join("&nbsp;&nbsp;&nbsp;");

  const clesHtml = (cles && cles.length) ? cles.map((c: any) => `<span class="cle-badge">${c.emoji || "🔑"} ${c.nom}</span>`).join("") : "";

  const objectifsHtml = objectifs.map((obj: any) => {
    const titre = typeof obj === "string" ? obj : (obj.titre || obj.text || "");
    const detail = typeof obj === "string" ? "" : (obj.detail || obj.description || "");
    return titre ? `
      <div class="objectif-item">
        <div class="objectif-title">→ <strong>${strip(titre)}</strong></div>
        ${detail ? `<div class="objectif-detail">${strip(detail)}</div>` : ""}
      </div>` : "";
  }).filter(Boolean).join("\n");

  const derouleHtml = deroule.map((s: any, i: number) => {
    const titre = s.titre || s.title || `Étape ${i + 1}`;
    const dureeS = s.duree || s.durée || "";
    const actions = Array.isArray(s.actions) ? s.actions : [];
    const actionsHtml = actions.map((a: any) => {
      const text = typeof a === "string" ? a : (a.text || "");
      return text ? `<li>${strip(text)}</li>` : "";
    }).filter(Boolean).join("\n");

    return `
      <div class="etape-card">
        <div class="etape-header">
          <div class="etape-num">${i + 1}</div>
          <div class="etape-title">${strip(titre)}</div>
          ${dureeS ? `<div class="etape-duree">${dureeS}</div>` : ""}
        </div>
        ${actionsHtml ? `<ul class="etape-actions">${actionsHtml}</ul>` : ""}
      </div>`;
  }).join("\n");

  const conseilsHtml = conseils.map((c: any) => {
    const text = typeof c === "string" ? c : (c.text || c.conseil || "");
    return text ? `<li>→ ${strip(text)}</li>` : "";
  }).filter(Boolean).join("\n");

  const variantesHtml = variantes.map((v: any) => {
    const text = typeof v === "string" ? v : (v.text || v.variante || "");
    return text ? `<li>· ${strip(text)}</li>` : "";
  }).filter(Boolean).join("\n");

  const materielHtml = materielListe.map((m: any) => {
    const text = typeof m === "string" ? m : (m.item || m.titre || "");
    return text ? `<li>${strip(text)}</li>` : "";
  }).filter(Boolean).join("\n");

  const ficheNom = fiche.nom || "Fiche";

  // === FULL HTML DOCUMENT (for iframe print) ===
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${ficheNom} – Lit uP</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link href="https://fonts.googleapis.com/css2?family=Source+Sans+3:ital,wght@0,400;0,600;0,700;0,800;1,400;1,600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    body {
      font-family: 'Source Sans 3', 'Source Sans Pro', system-ui, sans-serif;
      color: #2B3442;
      line-height: 1.55;
      font-size: 14px;
      max-width: 700px;
      margin: 0 auto;
      padding: 0 10px;
    }

    @media print {
      @page {
        size: A4;
        margin: 12mm 14mm 16mm 14mm;
      }
      body {
        max-width: 100%;
        padding: 0;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
    }

    /* ===== HEADER ===== */
    .pdf-header {
      background: linear-gradient(135deg, #00989D 0%, #007479 100%);
      color: white;
      padding: 20px 28px;
      margin: 0 -10px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      min-height: 60px;
    }
    .pdf-header-logo svg { height: 36px; width: auto; display: block; }
    .pdf-header-right {
      font-size: 12px; font-style: italic; opacity: 0.85; text-align: right;
    }

    /* ===== BADGE ÉTAPE ===== */
    .etape-badge-wrap { margin: 18px 0 8px; }
    .etape-badge {
      display: inline-block; background: #FCC33E; color: #2B3442;
      font-size: 12px; font-weight: 700; padding: 5px 16px; border-radius: 20px;
    }

    /* ===== TITRE ===== */
    .pdf-title {
      font-size: 28px; font-weight: 800; letter-spacing: -0.025em;
      line-height: 1.1; margin: 0 0 4px; color: #2B3442;
    }
    .pdf-source { font-size: 13px; font-style: italic; color: #6b7280; margin: 0 0 14px; }

    /* ===== GRILLE INFOS ===== */
    .info-table {
      width: 100%; border-collapse: collapse;
      border: 1.5px solid #e5e7eb; border-radius: 6px; margin-bottom: 8px;
    }
    .info-cell { padding: 10px 14px; border-right: 1.5px solid #e5e7eb; }
    .info-cell:last-child { border-right: none; }
    .info-label { font-size: 9px; font-weight: 700; color: #6b7280; letter-spacing: 0.06em; margin-bottom: 3px; }
    .info-value { font-size: 13px; font-weight: 700; color: #2B3442; }

    /* ===== META ===== */
    .meta-row { margin-bottom: 14px; font-size: 12px; }
    .meta-label { font-size: 9px; font-weight: 700; color: #6b7280; letter-spacing: 0.06em; margin-right: 6px; }

    /* ===== ENCADRÉ INTENTION (bleu) ===== */
    .box-intention {
      background: #e0f3f4; border-left: 4px solid #00989D;
      padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 14px 0;
      break-inside: avoid;
    }
    .box-intention-inner { display: flex; gap: 12px; align-items: flex-start; }
    .box-icon { font-size: 24px; flex-shrink: 0; margin-top: 2px; }
    .box-intention .box-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #007479; margin-bottom: 4px;
    }
    .box-intention .box-text { font-size: 13px; line-height: 1.6; color: #2B3442; }

    /* ===== ENCADRÉ POURQUOI (jaune) ===== */
    .box-pourquoi {
      background: #fff7df; border-left: 4px solid #e0a920;
      padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 0 0 18px;
      break-inside: avoid;
    }
    .box-pourquoi-inner { display: flex; gap: 12px; align-items: flex-start; }
    .box-pourquoi .box-label {
      font-size: 10px; font-weight: 700; letter-spacing: 0.08em; color: #856100; margin-bottom: 4px;
    }
    .box-pourquoi .box-text { font-size: 13px; line-height: 1.6; color: #2B3442; }

    /* ===== SECTIONS ===== */
    .section-heading {
      margin: 22px 0 12px; font-size: 18px; font-weight: 800;
      color: #2B3442; letter-spacing: -0.01em;
      break-after: avoid;
    }
    .section-heading .section-icon { margin-right: 8px; }

    /* ===== MATÉRIEL ===== */
    .materiel-list {
      background: #F6F6F8; border-radius: 10px;
      padding: 4px 0; list-style: none; margin: 0;
    }
    .materiel-list li {
      padding: 8px 16px; border-bottom: 1px solid #e5e7eb;
      font-size: 13px; line-height: 1.5;
    }
    .materiel-list li:last-child { border-bottom: none; }
    .materiel-list li::before { content: "•"; color: #00989D; font-weight: 700; margin-right: 8px; }

    /* ===== OBJECTIFS ===== */
    .objectif-item { margin-bottom: 10px; break-inside: avoid; }
    .objectif-title { font-size: 13px; color: #00989D; }
    .objectif-title strong { color: #007479; }
    .objectif-detail { font-size: 12px; color: #2B3442; padding-left: 18px; line-height: 1.5; }

    /* ===== DÉROULÉ ===== */
    .etape-card {
      background: #F6F6F8; border-radius: 10px;
      padding: 14px 18px; margin-bottom: 12px;
      break-inside: avoid;
    }
    .etape-header {
      display: flex; align-items: center; gap: 10px;
      margin-bottom: 10px; padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
    }
    .etape-num {
      display: inline-flex; align-items: center; justify-content: center;
      width: 26px; height: 26px; border-radius: 50%;
      background: #00989D; color: white;
      font-size: 13px; font-weight: 800; flex-shrink: 0;
    }
    .etape-title { font-size: 14px; font-weight: 700; color: #2B3442; flex-grow: 1; }
    .etape-duree {
      font-size: 11px; font-weight: 700; background: #FCC33E; color: #2B3442;
      padding: 4px 12px; border-radius: 12px; white-space: nowrap;
    }
    .etape-actions { margin: 0; padding: 0; list-style: none; }
    .etape-actions li {
      font-size: 12px; line-height: 1.55; padding: 3px 0 3px 16px;
      position: relative; color: #2B3442;
    }
    .etape-actions li::before {
      content: "•"; position: absolute; left: 4px; color: #00989D; font-weight: 700;
    }

    /* ===== CONSEILS ===== */
    .conseils-box { background: #F6F6F8; border-radius: 10px; padding: 14px 18px; }
    .conseils-list { margin: 0; padding: 0; list-style: none; }
    .conseils-list li { font-size: 12px; line-height: 1.55; padding: 4px 0; color: #2B3442; }

    /* ===== VARIANTES ===== */
    .variantes-box {
      background: #f5e9f3; border-left: 4px solid #6B2468;
      border-radius: 0 10px 10px 0; padding: 14px 18px;
      break-inside: avoid;
    }
    .variantes-list { margin: 0; padding: 0; list-style: none; }
    .variantes-list li { font-size: 12px; line-height: 1.55; padding: 4px 0; color: #2B3442; }

    /* ===== CLÉS ===== */
    .cles-wrap { margin: 10px 0; }
    .cle-badge {
      display: inline-block; background: #00989D; color: white;
      font-size: 10px; font-weight: 700;
      padding: 3px 10px; border-radius: 10px; margin: 0 4px 4px 0;
    }

    /* ===== CLOSING + FOOTER ===== */
    .pdf-closing {
      margin-top: 28px; padding-top: 12px;
      border-top: 1px dashed #d1d5db;
      text-align: center; font-size: 11px; font-style: italic; color: #00989D;
    }
    .pdf-footer {
      margin-top: 12px; font-size: 9px; color: #9ca3af;
      border-top: 1px solid #e5e7eb; padding-top: 8px; text-align: center;
    }
    .pdf-footer .footer-center { color: #00989D; font-style: italic; }
  </style>
</head>
<body>
  <div class="pdf-header">
    <div class="pdf-header-logo"><svg viewBox="0 0 1080 396" xmlns="http://www.w3.org/2000/svg" style="height:36px;width:auto;display:block;"><g fill="#FFFFFF"><path d="M0,291.03V85.95h78.7v197.38c0,29.08,11.55,45.34,32.08,45.34c4.28,0,8.56-0.43,14.12-0.86v65.02c-11.98,2.14-18.82,2.99-28.66,2.99C16.68,395.83,0,336.37,0,291.03z"/><path d="M155.26,390.69V196.58h78.7v194.11H155.26z"/><path d="M432.43,326.96v62.87c-14.54,3.43-36.36,5.99-52.61,5.99c-84.26,0-100.09-63.73-100.09-110.36v-162.4l72.29-37.21h6.42v65.44l67.15-0.43v59.88h-67.15v76c0,29.52,15.83,44.06,41.06,44.06C409.33,330.81,421.73,329.53,432.43,326.96z"/><path d="M697.61,85.8h79.13v304.9h-79.13v-24.38c-15.83,17.54-40.63,29.52-66.73,29.52c-44.05,0-80.41-26.52-80.41-85.12V172.55h78.7V293.6c0,23.1,12.41,36.36,31.65,36.36c12.83,0,26.52-6.42,36.78-16.68V85.8z"/><path d="M1080,114.2c0,69.29-45.34,114.2-104.37,114.2c-23.1,0-44.91-8.12-60.74-20.96v183.32h-78.7V5.13h79.13v15.4C931.15,8.12,952.96,0,975.63,0C1034.66,0,1080,44.91,1080,114.2z M1004.72,114.2c0-32.08-22.24-51.76-50.47-51.76c-13.26,0-27.38,5.13-38.92,12.83v77.85c11.55,7.7,25.67,12.83,38.92,12.83C982.48,165.96,1004.72,146.28,1004.72,114.2z"/></g><path fill="#FCC33D" d="M147.5,128.95c0-25.98,21.14-43.15,47.12-43.15c25.98,0,46.68,17.17,46.68,43.15c0,25.98-21.14,43.6-46.68,43.6C168.64,172.55,147.5,154.93,147.5,128.95z"/></svg></div>
    <div class="pdf-header-right">Boîte à outils · Fiche pédagogique</div>
  </div>

  ${fiche.etape_nom ? `<div class="etape-badge-wrap"><span class="etape-badge">${fiche.etape_code || ""} · ${fiche.etape_nom}</span></div>` : '<div style="margin-top:16px"></div>'}

  <h1 class="pdf-title">${fiche.emoji ? fiche.emoji + " " : ""}${ficheNom}</h1>
  ${fiche.source ? `<p class="pdf-source">Source : ${fiche.source}</p>` : ""}
  ${infoGridHtml ? `<table class="info-table"><tr>${infoGridHtml}</tr></table>` : ""}
  ${metaRow ? `<div class="meta-row">${metaRow}</div>` : ""}

  ${fiche.intention ? `
    <div class="box-intention"><div class="box-intention-inner">
      <div class="box-icon">💡</div>
      <div><div class="box-label">L'INTENTION</div><div class="box-text">${strip(fiche.intention)}</div></div>
    </div></div>
  ` : ""}

  ${fiche.pourquoi ? `
    <div class="box-pourquoi"><div class="box-pourquoi-inner">
      <div class="box-icon">⚙</div>
      <div><div class="box-label">POURQUOI CET OUTIL FONCTIONNE</div><div class="box-text">${strip(fiche.pourquoi)}</div></div>
    </div></div>
  ` : ""}

  ${materielHtml ? `<div class="section-heading"><span class="section-icon">🧳</span>Ce dont vous avez besoin</div><ul class="materiel-list">${materielHtml}</ul>` : ""}
  ${objectifsHtml ? `<div class="section-heading"><span class="section-icon">🎯</span>Objectifs pédagogiques</div>${objectifsHtml}` : ""}
  ${clesHtml ? `<div class="cles-wrap">${clesHtml}</div>` : ""}
  ${derouleHtml ? `<div class="section-heading"><span class="section-icon">👣</span>Le déroulé, étape par étape</div>${derouleHtml}` : ""}
  ${conseilsHtml ? `<div class="section-heading"><span class="section-icon">💬</span>Conseils pour bien animer</div><div class="conseils-box"><ul class="conseils-list">${conseilsHtml}</ul></div>` : ""}
  ${variantesHtml ? `<div class="section-heading"><span class="section-icon">🔄</span>Variantes possibles</div><div class="variantes-box"><ul class="variantes-list">${variantesHtml}</ul></div>` : ""}

  <div class="pdf-closing">Fiche issue de la Boîte à Outils Lit uP — ressources pour l'engagement des jeunes.</div>
  <div class="pdf-footer">Lit uP · ${ficheNom} <span class="footer-center">— faite pour être partagée</span></div>
</body>
</html>`;

  // === PRINT via hidden iframe ===
  const iframe = document.createElement("iframe");
  iframe.style.cssText = "position:fixed;left:-9999px;top:0;width:800px;height:600px;border:none;opacity:0;";

  // Use srcdoc + onload for reliable resource loading (fonts, images)
  await new Promise<void>((resolve, reject) => {
    iframe.onload = () => resolve();
    iframe.onerror = () => reject(new Error("Iframe failed to load"));
    iframe.srcdoc = html;
    document.body.appendChild(iframe);
  });

  // Extra safety: wait for fonts inside iframe
  const w = iframe.contentWindow;
  if (w) {
    await (w.document.fonts?.ready || Promise.resolve());
    // Two animation frames to ensure paint is complete
    await new Promise<void>((r) => w.requestAnimationFrame(() => w.requestAnimationFrame(() => setTimeout(r, 150))));
  }

  w?.print();

  // Clean up after print dialog closes
  setTimeout(() => {
    try { document.body.removeChild(iframe); } catch {}
  }, 3000);
}
