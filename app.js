(function () {
  "use strict";

  /* ---------------- settings ---------------- */

  const PUBLIC_MODE = true;

  const CONFIG_LABELS = {
    "VISPĀRINĀTS_NORMATĪVS": "Vispārināts “vajag”",
    "ATLIKTA_ATBILDĪBA": "Atlikts mehānisms",
    "IDENTITĀTE_KĀ_CĒLONIS": "Identitāte kā skaidrojums",
    "CITU_IEKŠĒJAIS_STĀVOKLIS": "Pieņēmums par citu iekšējo stāvokli"
    // (ja vēlāk gribi) "NORMATĪVS": "Normatīvs (“vajag/jā”)"
  };

const CONFIG_QUESTIONS = {
  "VISPĀRINĀTS_NORMATĪVS": "Kurā konkrētā situācijā tas ir patiess?",
  "ATLIKTA_ATBILDĪBA": "Kas tieši šeit paliek bez mehānisma?",
  "IDENTITĀTE_KĀ_CĒLONIS": "Kāds būtu apraksts bez ‘es esmu tāds’ (tikai par rīcību)?"
  "CITU_IEKŠĒJAIS_STĀVOKLIS": "Kāds ir novērojams fakts, nevis pieņēmums?"
};

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

    // clone regex to avoid lastIndex leaks
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
    
if (set.has("CITU_IEKŠĒJAIS_STĀVOKLIS")) {
  configs.push("CITU_IEKŠĒJAIS_STĀVOKLIS");
}
    
    if (set.has("UNIVERSĀLIS") && set.has("NORMATĪVS")) {
      configs.push("VISPĀRINĀTS_NORMATĪVS");
    }

    if (set.has("TELEOLOĢIJA") && set.has("NEDEFINĒTS_MEHĀNISMS")) {
      configs.push("ATLIKTA_ATBILDĪBA");
    }

    if (set.has("RETROSPEKTĪVA_ETIĶETE")) {
      configs.push("IDENTITĀTE_KĀ_CĒLONIS");
    }

    // Ja vēlāk gribi, lai publiski parādās arī “būtu jā...”
    // if (set.has("NORMATĪVS")) configs.push("NORMATĪVS");

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

    if (Array.isArray(R.OTHERS_STATE_PATTERNS)) {
  for (const p of R.OTHERS_STATE_PATTERNS) {
    markers.push(...findRegexMarkers(text, p, "CITU_IEKŠĒJAIS_STĀVOKLIS"));
  }
}


    // DEDUPE: type + index + text
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

    // TOP sentences (iekšēji) – konfigurācijas sver vairāk
    const scored = sentences.map((s, idx) => ({
      idx,
      score: s.configs.length * 100 + s.nf
    }));
    scored.sort((a, b) => b.score - a.score);
    const topSet = new Set(scored.filter(x => x.score > 0).slice(0, 3).map(x => x.idx));
    sentences.forEach((s, i) => {
      s.isTop = topSet.has(i);
      s._score = scored.find(x => x.idx === i)?.score || 0; // debug (nav jāparāda)
    });

    return { sentences, nf_total, nf_average, configCounts };
  }

  /* ---------------- starters ---------------- */

  function getStarters() {
    return {
      1: `Situācija:
Kas tieši notiek (fakti, īsi)?

Ko es gribēju:
Ko es gaidīju no sevis / citiem?

Ko es sev tagad saku:
Kādas frāzes galvā atkārtojas?

Ko es baidos atzīt:
`,
      2: `Kas man šobrīd sāp (vienā teikumā)?
...

Kurā vietā tas sāp (situācija/attiecības/darbs)?
...

Ko es sev par to stāstu?
...

Ko es gribētu, lai notiek?
...
`,
      3: `Ko es sev šobrīd saku (uzraksti tieši frāzes):
- ...
- ...
- ...

Ko es ar šīm frāzēm mēģinu panākt?
...

Kas būtu “neērtais fakts”, ko šīs frāzes aizvieto?
...
`
    };
  }

  /* ---------------- render ---------------- */

  function render(result) {
    const summary = $("summary");
    const sentencesEl = $("sentences");

    // Summary (publiski kluss)
    if (PUBLIC_MODE) {
      summary.innerHTML = `Teikumi: <strong>${result.sentences.length}</strong>`;
    } else {
      const cfg = Object.entries(result.configCounts)
        .map(([k, v]) => `${k}: ${v}`)
        .join(" · ");
      summary.innerHTML =
        `Teikumi: <strong>${result.sentences.length}</strong> · ` +
        `NF kopā: <strong>${result.nf_total}</strong> · ` +
        `NF vidēji: <strong>${result.nf_average}</strong>` +
        (cfg ? ` · <span class="muted">${escapeHtml(cfg)}</span>` : "");
    }

    // Publiski: rādam tikai teikumus ar signālu (konfigurācija vai vismaz 1 marķieris)
    const visible = PUBLIC_MODE
      ? result.sentences.filter(s => (s.configs?.length || 0) > 0 || (s.nf || 0) > 0)
      : result.sentences;

    // Sakārtojam pēc svarīguma: konfigurācijas augstāk, tad NF
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

      // Publiski header var būt vienkāršāks (bez NF)
      const publicHeader = `
        <div class="sentenceHeader">
          <div>
            <strong>#${s.id}</strong>
            ${s.isTop ? `<span class="pill">TOP</span>` : ``}
            <span class="muted">${escapeHtml(s.text)}</span>
          </div>
        </div>
      `;

      return `
        <div class="sentence">
          ${PUBLIC_MODE ? publicHeader : ``}
          ${PUBLIC_MODE ? publicBody : privateBody}
        </div>
      `;
    }).join("");
  }

  /* ---------------- boot ---------------- */

  function boot() {
    const input = $("input");
    const btn = $("btnRun");
    const btnClear = $("btnClear");

    
    if (!input || !btn || !$("summary") || !$("sentences")) {
      console.error("UI elementi nav atrasti");
      return;
    }

    const R = window.RULES_V06 || window.RULES_V05 || window.RULES_V04 || window.RULES;

    if (!R) {
      console.error("Rules nav ielādēti (RULES_V06 / RULES_V05 / RULES_V04 / RULES)");
      return;
    }

    // Starter buttons
    const startersEl = $("starters");
    const STARTERS = getStarters();

    if (startersEl) {
      startersEl.addEventListener("click", (e) => {
        const btnEl = e.target.closest(".starterBtn");
        if (!btnEl) return;

        const key = btnEl.getAttribute("data-starter");
        const tpl = STARTERS[key];
        if (!tpl) return;

        input.value = tpl;
        input.focus();

        // uzreiz palaist analīzi
        const result = analyze(input.value, R);
        render(result);
      });
    }

    // Run button
    btn.addEventListener("click", () => {
      if (btnClear) {
  btnClear.addEventListener("click", () => {
    input.value = "";
    $("summary").innerHTML = "";
    $("sentences").innerHTML = "";
    input.focus();
  });
}
      const result = analyze(input.value, R);
      render(result);
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();




