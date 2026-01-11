(function () {
  "use strict";
const PUBLIC_MODE = true;

const CONFIG_LABELS = {
  "VISPĀRINĀTS_NORMATĪVS": "Vispārināts “vajag”",
  "ATLIKTA_ATBILDĪBA": "Atlikts mehānisms",
  "IDENTITĀTE_KĀ_CĒLONIS": "Identitāte kā skaidrojums"
};

const CONFIG_QUESTIONS = {
  "VISPĀRINĀTS_NORMATĪVS": "Kurā konkrētā situācijā tas attiecas?",
  "ATLIKTA_ATBILDĪBA": "Kas tieši šeit tiek atlikts vai atstāts “uz laiku”?",
  "IDENTITĀTE_KĀ_CĒLONIS": "Kas mainītos, ja šis nebūtu skaidrojums?"
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
  `Teikumi: <strong>${result.sentences.length}</strong>` +
  (cfg && !PUBLIC_MODE ? ` · <span class="muted">${escapeHtml(cfg)}</span>` : "");

    
    const ordered = [...result.sentences].sort((a,b) => (b.isTop === true) - (a.isTop === true));

    sentencesEl.innerHTML = result.sentences.map(s => {
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

  // publiski: nerādām “Marķieri nav atrasti.”, vienkārši klusējam
  const publicBody = `
    ${s.configs.length ? configLines : `<div class="muted">Nav atrasts nekas izteikts.</div>`}
  `;

  const privateBody = `
    ${s.markers.length
      ? `<ul>${s.markers.map(m =>
          `<li><code>${escapeHtml(m.text)}</code> <span class="pill">${escapeHtml(m.type)}</span></li>`
        ).join("")}</ul>`
      : `<div class="muted">Marķieri nav atrasti.</div>`}

    ${s.configs.length ? configLines : ``}
  `;

  return `
    <div class="sentence">
      <div class="sentenceHeader">
        <div>
          <strong>#${s.id}</strong>
          ${s.isTop ? `<span class="pill">TOP</span>` : ``}
          <span class="muted">${escapeHtml(s.text)}</span>
        </div>
        ${PUBLIC_MODE ? `` : `<div><span class="pill">NF ${s.nf}</span></div>`}
      </div>

      ${PUBLIC_MODE ? publicBody : privateBody}
    </div>
  `;
}).join("");

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
const STARTERS = {
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
const startersEl = $("starters");
if (startersEl) {
  startersEl.addEventListener("click", (e) => {
    const btnEl = e.target.closest(".starterBtn");
    if (!btnEl) return;

    const key = btnEl.getAttribute("data-starter");
    const tpl = STARTERS[key];
    if (!tpl) return;

    // ieliek tekstu un fokusē
    input.value = tpl;
    input.focus();

    // (neobligāti) uzreiz palaist analīzi
    const result = analyze(input.value, R);
    render(result);
  });
}

    btn.addEventListener("click", () => {
      const result = analyze(input.value, R);
      render(result);
    });
  }

  document.addEventListener("DOMContentLoaded", boot);
})();



