(function () {
  "use strict";

  /* =========================
     SETTINGS
  ========================= */

  const PUBLIC_MODE = true;

  // Cilvēcīgie nosaukumi konfigurācijām (L2)
  const CONFIG_LABELS = {
    "VISPĀRINĀTS_NORMATĪVS": "Vispārināts “vajag”",
    "ATLIKTA_ATBILDĪBA": "Atlikts mehānisms",
    "IDENTITĀTE_KĀ_CĒLONIS": "Identitāte kā skaidrojums",
    "CITU_IEKŠĒJAIS_STĀVOKLIS": "Pieņēmums par citu iekšējo stāvokli",
    "ABSTRAKTS_LABUMS": "Abstrakts “labi/pareizi”",
    "SALĪDZINĀJUMS_ETALONS": "Salīdzinājums / etalons",
    "NEKONKRĒTS_SUBJEKTS": "Nekonkrēts subjekts (“cilvēki/viņi”)",
    "MINDFOG": "Migla (“kaut kā/viss/nekas”)"
  };

  const CONFIG_QUESTIONS = {
    "VISPĀRINĀTS_NORMATĪVS": "Kurā konkrētā situācijā tas ir patiess?",
    "ATLIKTA_ATBILDĪBA": "Kas tieši šeit paliek bez mehānisma?",
    "IDENTITĀTE_KĀ_CĒLONIS": "Kāds būtu apraksts bez ‘es esmu tāds’ (tikai par rīcību)?",
    "CITU_IEKŠĒJAIS_STĀVOKLIS": "Kāds ir novērojams fakts, nevis pieņēmums?",
    "ABSTRAKTS_LABUMS": "Kas tieši ir “labi” — pēc kā tu to atpazīsti?",
    "SALĪDZINĀJUMS_ETALONS": "Ar ko tieši tu salīdzini (konkrēts etalons)?",
    "NEKONKRĒTS_SUBJEKTS": "Kurš tieši (viens reāls cilvēks vai grupa)?",
    "MINDFOG": "Kas ir “kaut kas” — nosauc vienu konkrētu lietu."
  };

  // Marķieru “stipruma” prioritāte vienam un tam pašam fragmentam (index+text)
  // (piem., ja kāds fragments tiek noķerts ar 2 tipiem, paturam augstāko)
  const MARKER_PRIORITY = [
    "TELEOLOĢIJA",
    "NEDEFINĒTS_MEHĀNISMS",
    "NORMATĪVS",
    "UNIVERSĀLIS",
    "RETROSPEKTĪVA_ETIĶETE",
    "CITU_IEKŠĒJAIS_STĀVOKLIS",
    "ABSTRAKTS_LABUMS",
    "SALĪDZINĀJUMS_ETALONS",
    "NEKONKRĒTS_SUBJEKTS",
    "MINDFOG"
  ];

  function priorityOf(type) {
    const i = MARKER_PRIORITY.indexOf(type);
    return i === -1 ? 999 : i;
  }

  /* =========================
     DOM HELPERS
  ========================= */

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

  /* =========================
     TEXT / SENTENCE SPLIT
  ========================= */

  function splitSentences(text) {
    return String(text || "")
      .replace(/\r\n/g, "\n")
      .split(/(?<=[.!?])\s+/)
      .map(s => s.trim())
      .filter(Boolean);
  }

const CHALLENGES = [
  {
    title: "Migla",
    text: "Kaut kā pēdējā laikā viss ir sašķobījies, bet nekas īsti nenotiek.",
    goal: "Pārraksti tā, lai nav: “kaut kā / viss / nekas”."
  },
  {
    title: "Atlikta atbildība",
    text: "Gan jau ar laiku viss sakārtosies pats no sevis.",
    goal: "Pārraksti tā, lai ir skaidrs mehānisms: kas tieši notiks un kā."
  },
  {
    title: "Vispārināts “vajag”",
    text: "Katram būtu jāuzņemas atbildība.",
    goal: "Pārraksti konkrēti: kuram, par ko, kādā situācijā."
  },
  {
    title: "Nekonkrēts subjekts",
    text: "Cilvēki saka, ka normāli cilvēki tā nedara.",
    goal: "Pārraksti ar konkrētu subjektu: kurš tieši to saka / kurai grupai tas attiecas."
  },
  {
    title: "Salīdzinājums bez etalona",
    text: "Man vajadzētu būt kā citiem.",
    goal: "Pārraksti, nosaucot konkrētu etalonu vai kritēriju (ne “citi”)."
  },
  {
    title: "Abstrakts “pareizi”",
    text: "Man ir svarīgi, lai viss būtu pareizi.",
    goal: "Pārraksti, konkretizējot: pēc kā tieši tu nosaki “pareizi”."
  }
];

function pickRandomChallenge() {
  const i = Math.floor(Math.random() * CHALLENGES.length);
  return CHALLENGES[i];
}

  
  
  /* =========================
     MARKERS (REGEX)
  ========================= */

  function findRegexMarkers(text, regex, type) {
    const out = [];
    if (!(regex instanceof RegExp)) return out;

    // clone to avoid lastIndex bleed
    const re = new RegExp(regex.source, regex.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      out.push({ text: m[0], type, index: m.index });
      if (!m[0]) re.lastIndex++;
    }
    return out;
  }

  // Bold-iezīmēšana (render laikā, indeksi pret oriģinālo tekstu)
  function highlightMarkers(text, markers) {
    if (!markers || !markers.length) return escapeHtml(text);

    // Aizsardzība pret “noķerts viss teikums” (ja tāds gadās)
    const maxLen = Math.max(20, Math.floor(text.length * 0.6));

    const ms = markers
      .filter(m => typeof m.index === "number" && m.index >= 0 && m.text)
      .filter(m => m.text.length <= maxLen)
      .map(m => ({ index: m.index, end: m.index + m.text.length }))
      .sort((a, b) => a.index - b.index);

    if (!ms.length) return escapeHtml(text);

    // noņemam pārklājumus
    const cleaned = [];
    let lastEnd = -1;
    for (const m of ms) {
      if (m.index < lastEnd) continue;
      cleaned.push(m);
      lastEnd = m.end;
    }

    let out = "";
    let pos = 0;
    for (const m of cleaned) {
      if (m.index > text.length || m.end > text.length) continue;
      out += escapeHtml(text.slice(pos, m.index));
      out += "<strong>" + escapeHtml(text.slice(m.index, m.end)) + "</strong>";
      pos = m.end;
    }
    out += escapeHtml(text.slice(pos));
    return out;
  }

  /* =========================
     L2 CONFIGURATIONS
  ========================= */

  function detectConfigurations(markers) {
    const set = new Set((markers || []).map(m => m.type));
    const configs = [];

    // L2: universālis + normatīvs
    if (set.has("UNIVERSĀLIS") && set.has("NORMATĪVS")) {
      configs.push("VISPĀRINĀTS_NORMATĪVS");
    }

    // L2: teleoloģija + nedefinēts mehānisms
    if (set.has("TELEOLOĢIJA") && set.has("NEDEFINĒTS_MEHĀNISMS")) {
      configs.push("ATLIKTA_ATBILDĪBA");
    }

    // L2: identitāte kā cēlonis
    if (set.has("RETROSPEKTĪVA_ETIĶETE")) {
      configs.push("IDENTITĀTE_KĀ_CĒLONIS");
    }

    // L2: citu iekšējais stāvoklis
    if (set.has("CITU_IEKŠĒJAIS_STĀVOKLIS")) {
      configs.push("CITU_IEKŠĒJAIS_STĀVOKLIS");
    }

    // L2: abstrakts labums
    if (set.has("ABSTRAKTS_LABUMS")) {
      configs.push("ABSTRAKTS_LABUMS");
    }

    // L2: salīdzinājums/etalons
    if (set.has("SALĪDZINĀJUMS_ETALONS")) {
      configs.push("SALĪDZINĀJUMS_ETALONS");
    }

    // L2: nekonkrēts subjekts
    if (set.has("NEKONKRĒTS_SUBJEKTS")) {
      configs.push("NEKONKRĒTS_SUBJEKTS");
    }

    // L2: mindfog
    if (set.has("MINDFOG")) {
      configs.push("MINDFOG");
    }

    return configs;
  }

  /* =========================
     ANALYZE ONE SENTENCE
  ========================= */

  function analyzeSentence(text, R) {
    let markers = [];

    // UNIVERSĀLIS
    if (Array.isArray(R.UNIVERSAL_PATTERNS)) {
      for (const p of R.UNIVERSAL_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "UNIVERSĀLIS"));
      }
    }

    // NORMATĪVS
    if (Array.isArray(R.NORMATIVE_PATTERNS)) {
      for (const p of R.NORMATIVE_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "NORMATĪVS"));
      }
    }

    // ABSTRAKTS_LABUMS
    if (Array.isArray(R.ABSTRACT_GOOD_PATTERNS)) {
      for (const p of R.ABSTRACT_GOOD_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "ABSTRAKTS_LABUMS"));
      }
    }

    // TELEOLOĢIJA
    if (Array.isArray(R.TELEOLOGY_PATTERNS)) {
      for (const p of R.TELEOLOGY_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "TELEOLOĢIJA"));
      }
    }

    // NEDEFINĒTS_MEHĀNISMS
    if (Array.isArray(R.UNDEFINED_MECH_PATTERNS)) {
      for (const p of R.UNDEFINED_MECH_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "NEDEFINĒTS_MEHĀNISMS"));
      }
    }

    // RETROSPEKTĪVA_ETIĶETE
    if (Array.isArray(R.RETRO_LABEL_PATTERNS)) {
      for (const p of R.RETRO_LABEL_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "RETROSPEKTĪVA_ETIĶETE"));
      }
    }

    // CITU_IEKŠĒJAIS_STĀVOKLIS (array vai fallback uz vienu regex)
    if (Array.isArray(R.OTHERS_STATE_PATTERNS)) {
      for (const p of R.OTHERS_STATE_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "CITU_IEKŠĒJAIS_STĀVOKLIS"));
      }
    } else if (R.OTHERS_STATE_PATTERN instanceof RegExp) {
      markers.push(...findRegexMarkers(text, R.OTHERS_STATE_PATTERN, "CITU_IEKŠĒJAIS_STĀVOKLIS"));
    }

    // SALĪDZINĀJUMS / ETALONS
    if (Array.isArray(R.COMPARISON_PATTERNS)) {
      for (const p of R.COMPARISON_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "SALĪDZINĀJUMS_ETALONS"));
      }
    }

    // NEKONKRĒTAIS SUBJEKTS
    if (Array.isArray(R.VAGUE_SUBJECT_PATTERNS)) {
      for (const p of R.VAGUE_SUBJECT_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "NEKONKRĒTS_SUBJEKTS"));
      }
    }

    // MINDFOG
    if (Array.isArray(R.MINDFOG_PATTERNS)) {
      for (const p of R.MINDFOG_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "MINDFOG"));
      }
    }

    // NORMALIZE / DEDUPE by (index|text) with priority
    const bySpan = new Map(); // key = "index|text"
    for (const m of markers) {
      const key = `${m.index}|${m.text}`;
      const prev = bySpan.get(key);
      if (!prev) {
        bySpan.set(key, m);
      } else {
        if (priorityOf(m.type) < priorityOf(prev.type)) {
          bySpan.set(key, m);
        }
      }
    }
    markers = Array.from(bySpan.values()).sort((a, b) => a.index - b.index);

    // saglabājam markerus ar index (vajag bold)
    const simpleMarkers = markers.map(m => ({ text: m.text, type: m.type, index: m.index }));

    const configs = detectConfigurations(simpleMarkers);

    return {
      text,
      markers: simpleMarkers,
      configs,
      nf: simpleMarkers.length
    };
  }

  /* =========================
     ANALYZE WHOLE TEXT
  ========================= */

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
      for (const c of (s.configs || [])) {
        configCounts[c] = (configCounts[c] || 0) + 1;
      }
    }

    // TOP: konfigurācijas sver vairāk
    const scored = sentences.map((s, idx) => ({
      idx,
      score: (s.configs.length * 100) + s.nf
    }));
    scored.sort((a, b) => b.score - a.score);

    const topSet = new Set(scored.filter(x => x.score > 0).slice(0, 3).map(x => x.idx));
    sentences.forEach((s, i) => { s.isTop = topSet.has(i); });

    return { sentences, nf_total, nf_average, configCounts };
  }



  /* =========================
     RENDER
  ========================= */

  function render(result) {
    const summary = $("summary");
    const sentencesEl = $("sentences");

    // Summary
    if (PUBLIC_MODE) {
      summary.innerHTML = `Teikumi: <strong>${result.sentences.length}</strong>`;
    } else {
      const cfg = Object.entries(result.configCounts || {})
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · ");
      summary.innerHTML =
        `Teikumi: <strong>${result.sentences.length}</strong> · ` +
        `NF kopā: <strong>${result.nf_total}</strong> · ` +
        `NF vidēji: <strong>${result.nf_average}</strong>` +
        (cfg ? ` · <span class="muted">${escapeHtml(cfg)}</span>` : "");
    }

    // PUBLIC: tikai teikumi ar signālu
    const visible = PUBLIC_MODE
      ? result.sentences.filter(s => (s.configs?.length || 0) > 0 || (s.nf || 0) > 0)
      : result.sentences;

    // Sort: configs augstāk, tad NF
    const ordered = [...visible].sort((a, b) => {
      const aScore = (a.configs.length * 100) + a.nf;
      const bScore = (b.configs.length * 100) + b.nf;
      return bScore - aScore;
    });

    if (PUBLIC_MODE && ordered.length === 0) {
      sentencesEl.innerHTML =
        `<div class="muted">Pamēģini uzrakstīt 3–6 teikumus. Vari nospiest vienu no starteriem virs ievades lauka.</div>`;
      return;
    }

    sentencesEl.innerHTML = ordered.map(s => {
      const configLines = (s.configs || []).map(c => {
        const label = CONFIG_LABELS[c] || c;
        const q = CONFIG_QUESTIONS[c] || "";
        return `
          <div style="margin-top:8px;">
            <span class="pill">${escapeHtml(label)}</span>
            ${q ? `<div class="muted" style="margin-top:4px;">${escapeHtml(q)}</div>` : ``}
          </div>
        `;
      }).join("");

      // Ja nav konfigurāciju, bet ir marķieri: parādam 1–3 “Atrasts: …”
      const foundWords = (s.markers || []).slice(0, 3).map(m => m.text).join(", ");

      const publicBody = s.configs.length
        ? configLines
        : (s.markers.length ? `<div class="muted">Atrasts: ${escapeHtml(foundWords)}</div>` : ``);

      const publicHeader = `
        <div class="sentenceHeader">
          <div>
            <strong>#${s.id}</strong>
            ${s.isTop ? `<span class="pill">TOP</span>` : ``}
            <span class="muted">${highlightMarkers(s.text, s.markers)}</span>
          </div>
        </div>
      `;

      const privateBody = `
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

        ${s.configs.length ? configLines : ``}
      `;

      // PUBLIC => header+body; PRIVATE => tikai privateBody (tas jau satur header)
      return `
        <div class="sentence">
          ${PUBLIC_MODE ? (publicHeader + publicBody) : privateBody}
        </div>
      `;
    }).join("");
  }

  /* =========================
     BOOT / UI WIRING
  ========================= */

  function boot() {
    const input = $("input");
    const btnRun = $("btnRun");
    const btnClear = $("btnClear");

    const summaryEl = $("summary");
    const sentencesEl = $("sentences");

    if (!input || !btnRun || !summaryEl || !sentencesEl) {
      console.error("UI elementi nav atrasti. Nepieciešami id: input, btnRun, summary, sentences (+ btnClear pēc izvēles).");
      return;
    }

    // izvēlamies jaunāko rules (V06 > V05 > V04 > RULES)
    const R = window.RULES_V06 || window.RULES_V05 || window.RULES_V04 || window.RULES;
    if (!R) {
      console.error("Rules nav ielādēti (RULES_V06/V05/V04/RULES). Pārbaudi script src secību index.html.");
      return;
    }



    // Run
    btnRun.addEventListener("click", () => {
      const result = analyze(input.value, R);
      render(result);
    });

    // Clear
    if (btnClear) {
      btnClear.addEventListener("click", () => {
        input.value = "";
        summaryEl.innerHTML = "";
        sentencesEl.innerHTML = "";
        input.focus();
      });
    }

// Challenge (spēles režīms)
if (btnChallenge) {
  btnChallenge.addEventListener("click", () => {
    const c = pickRandomChallenge();

    input.value = c.text;
    input.focus();

    if (challengeBox) {
      challengeBox.innerHTML =
        `<strong>Izaicinājums:</strong> ${escapeHtml(c.title)} — ` +
        `${escapeHtml(c.goal)} ` +
        `<span class="muted">(Mērķis: 0 brāķi)</span>`;
    }

    const result = analyze(input.value, R);
    render(result);
  });
}

    
if (btnChallenge) {
  btnChallenge.addEventListener("click", () => {
    const c = pickRandomChallenge();

    // Ieliek tekstu ievadē
    input.value = c.text;
    input.focus();

    // Parāda instrukciju
    if (challengeBox) {
      challengeBox.innerHTML =
        `<strong>Izaicinājums:</strong> ${escapeHtml(c.title)} — ` +
        `${escapeHtml(c.goal)} ` +
        `<span class="muted">(Mērķis: 0 brāķi)</span>`;
    }

    // Uzreiz parāda analīzi
    const result = analyze(input.value, R);
    render(result);
  });
}

    
  }

  document.addEventListener("DOMContentLoaded", boot);
})();


