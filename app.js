(function () {
  "use strict";

  /* ---------------- utils ---------------- */

  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  /* ---------------- sentence split ---------------- */

  function splitSentences(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }

  /* ---------------- marker helpers ---------------- */

  function findRegexMarkers(text, regex, type) {
    const out = [];
    if (!(regex instanceof RegExp)) return out;

    const re = new RegExp(regex.source, regex.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      out.push({ text: m[0], type, index: m.index });
      if (!m[0]) re.lastIndex++;
    }
    return out;
  }

  /* ---------------- L2 configurations ---------------- */

  function detectConfigurations(markers) {
    const set = new Set(markers.map(m => m.type));
    const configs = [];

    if (set.has("UNIVERSĀLIS") && set.has("NORMATĪVS")) {
      configs.push("VISPĀRINĀTS_NORMATĪVS");
    }
    if (set.has("TELEOLOĢIJA") && set.has("NEDEFINĒTS_MEHĀNISMS")) {
      configs.push("ATLIKTA_ATBILDĪBA");
    }
    if (set.has("RETROSPEKTĪVA_ETIĶETE")) {
      configs.push("IDENTITĀTE_KĀ_CĒLONIS");
    }

    return configs;
  }

  /* ---------------- analyze sentence ---------------- */

  function analyzeSentence(text, R) {
    let markers = [];

    if (Array.isArray(R.UNIVERSAL_PATTERNS)) {
      for (const p of R.UNIVERSAL_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "UNIVERSĀLIS"));
      }
    }

    if (Array.isArray(R.NORMATIVE_PATTERNS)) {
      for (const p of R.NORMATIVE_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "NORMATĪVS"));
      }
    }

    if (Array.isArray(R.TELEOLOGY_PATTERNS)) {
      for (const p of R.TELEOLOGY_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "TELEOLOĢIJA"));
      }
    }

    if (Array.isArray(R.UNDEFINED_MECH_PATTERNS)) {
      for (const p of R.UNDEFINED_MECH_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "NEDEFINĒTS_MEHĀNISMS"));
      }
    }

    if (Array.isArray(R.RETRO_LABEL_PATTERNS)) {
      for (const p of R.RETRO_LABEL_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "RETROSPEKTĪVA_ETIĶETE"));
      }
    }

    // DEDUPE
    const seen = new Set();
    markers = markers.filter(m => {
      const k = `${m.type}|${m.index}|${m.text}`;
      if (seen.has(k)) return false;
      seen.add(k);
      return true;
    });

    markers.sort((a, b) => a.index - b.index);

    const simpleMarkers = markers.map(m => ({ text: m.text, type: m.type }));
    const configs = detectConfigurations(simpleMarkers);

    return {
      text,
      markers: simpleMarkers,
      configs,
      nf: simpleMarkers.length
    };
  }

  /* ---------------- analyze text ---------------- */

  function analyze(text, R) {
    const sentencesRaw = splitSentences(text);
    const sentences = sentencesRaw.map((s, i) => ({
      id: i + 1,
      ...analyzeSentence(s, R)
    }));

    const nf_total = sentences.reduce((a, s) => a + s.nf, 0);
    const nf_average = sentences.length ? +(nf_total / sentences.length).toFixed(2) : 0;

    const configCounts = {};
    for (const s of sentences) {
      for (const c of s.configs) {
        configCounts[c] = (configCounts[c] || 0) + 1;
      }
    }

    // TOP sentences
    const scored = sentences.map((s, idx) => ({
      idx,
      score: s.configs.length * 10 + s.nf
    }));

    scored.sort((a, b) => b.score - a.score);

    const topSet = new Set(
      scored.filter(x => x.score > 0).slice(0, 3).map(x => x.idx)
    );

    sentences.forEach((s, i) => {
      s.isTop = topSet.has(i);
    });

    return { sentences, nf_total, nf_average, configCounts };
  }

  /* ---------------- render ---------------- */

  function render(result) {
    const summary = $("summary");
    const sentencesEl = $("sentences");

    const cfg = Object.entries(result.configCounts)
      .map(([k, v]) => `${k}: ${v}`)
      .join(" · ");

    summary.innerHTML =
      `Teikumi: <strong>${result.sentences.length}</strong> · ` +
      `NF kopā: <strong>${result.nf_total}</strong> · ` +
      `NF vidēji: <strong>${result.nf_average}</strong>` +
      (cfg ? ` · <span class="muted">${escapeHtml(cfg)}</span>` : "");

    
    const ordered = [...result.sentences].sort((a,b) => (b.isTop === true) - (a.isTop === true));

    sentencesEl.innerHTML = ordered.map(s => `
      <div class="sentence">
        <div class="sentenceHeader">
          <div>
            <strong>#${s.id}</strong>
            ${s.isTop ? `<span class="pill">TOP</span>` : ``}
            <span class="muted">${escapeHtml(s.text)}</span>
          </div>
          <div><span class="pill">NF ${s.nf}</span></div>
        </div>

        ${s.markers.length
          ? `<ul>${s.markers.map(m =>
              `<li><code>${escapeHtml(m.text)}</code> <span class="pill">${escapeHtml(m.type)}</span></li>`
            ).join("")}</ul>`
          : `<div class="muted">Marķieri nav atrasti.</div>`}

        ${s.configs.length
          ? `<div style="margin-top:6px;">${s.configs.map(c =>
              `<span class="pill">${escapeHtml(c)}</span>`
            ).join(" ")}</div>`
          : ``}
      </div>
    `).join("");
  }

  /* ---------------- boot ---------------- */

  function boot() {
    const input = $("input");
    const btn = $("btnRun");

    if (!input || !btn || !$("summary") || !$("sentences")) {
      console.error("UI elementi nav atrasti");
      return;
    }

    const R = window.RULES_V05 || window.RULES_V04;
    if (!R) {
      console.error("Rules nav ielādēti");
      return;
    }

    btn.addEventListener("click", () => {
      const result = analyze(input.value, R);
      render(result);
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();

