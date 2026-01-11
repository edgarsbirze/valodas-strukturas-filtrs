// app.js — Valodas struktūras filtrs
// Strādā ar minimālo UI un RULES_V05 (regex + locījumi)

(function () {
  "use strict";

  // ---------- helpers ----------
  function $(id) {
    return document.getElementById(id);
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[c]));
  }

  function setSummary(html) {
    const el = $("summary");
    if (!el) return;
    el.innerHTML = html || "";
  }

  function setSentences(html) {
    const el = $("sentences");
    if (!el) return;
    el.innerHTML = html || "";
  }

  function showFatal(msg, err) {
    console.error("[APP ERROR]", msg, err || "");
    setSummary(`<span style="color:#b00020;">Kļūda: ${escapeHtml(msg)}</span>`);
    setSentences(`<div class="muted">Atver pārlūka Console (F12) detalizētākai kļūdas informācijai.</div>`);
  }

  // ---------- sentence split ----------
  // Vienkārši un paredzami:
  // 1) vispirms sadala rindās
  // 2) katru rindu sadala teikumos pēc . ! ? ;
  function splitSentences(text) {
    const cleaned = String(text || "").replace(/\r\n/g, "\n");
    const lines = cleaned.split(/\n+/).map(s => s.trim()).filter(Boolean);

    const out = [];
    for (const line of lines) {
      // sadalam ar delimitera saglabāšanu
      const parts = line.split(/([.!?;]+)/);
      let buf = "";
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!p) continue;
        buf += p;
        if (/[.!?;]+/.test(p)) {
          const s = buf.trim();
          if (s) out.push(s);
          buf = "";
        }
      }
      const tail = buf.trim();
      if (tail) out.push(tail);
    }
    return out;
  }

  // ---------- marker finders ----------
  function findRegexMarkers(text, regex, type) {
    const markers = [];
    if (!regex) return markers;

    // Klonējam, lai lastIndex vienmēr sākas no 0
    const re = new RegExp(regex.source, regex.flags);
    let m;
    while ((m = re.exec(text)) !== null) {
      markers.push({ text: m[0], type, index: m.index });
      // drošība pret 0-garuma match (ja kādreiz tāds parādās)
      if (m[0].length === 0) re.lastIndex++;
    }
    return markers;
  }

  function findWordListMarkers(textLower, words, type) {
    const markers = [];
    if (!Array.isArray(words)) return markers;

    for (const w of words) {
      if (!w) continue;
      const re = new RegExp(`\\b${w}\\b`, "giu");
      let m;
      while ((m = re.exec(textLower)) !== null) {
        markers.push({ text: m[0], type, index: m.index });
        if (m[0].length === 0) re.lastIndex++;
      }
    }
    return markers;
  }

  // ---------- rules adapter ----------
  // Mērķis: lai app.js var strādāt ar vairākām RULES versijām.
  function getRules() {
    // prioritāte: jaunākais
    return window.RULES_V05 || window.RULES_V04 || window.RULES_V03 || null;
  }


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

  
  // ---------- analyze ----------
  function analyzeSentence(original, R) {
    const text = String(original || "").trim();
    const lower = text.toLowerCase();
    let markers = [];

    // 1) UNIVERSĀLIS
    if (Array.isArray(R.UNIVERSAL_PATTERNS)) {
      for (const p of R.UNIVERSAL_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "UNIVERSĀLIS"));
      }
    } else if (Array.isArray(R.UNIVERSALS)) {
      markers.push(...findWordListMarkers(lower, R.UNIVERSALS, "UNIVERSĀLIS"));
    }

    // 2) NORMATĪVS
    if (Array.isArray(R.NORMATIVE_PATTERNS)) {
      for (const p of R.NORMATIVE_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "NORMATĪVS"));
      }
    } else {
      if (Array.isArray(R.NORMATIVES)) {
        markers.push(...findWordListMarkers(lower, R.NORMATIVES, "NORMATĪVS"));
      }
      if (Array.isArray(R.NORM_PATTERNS)) {
        for (const p of R.NORM_PATTERNS) {
          markers.push(...findRegexMarkers(text, p, "NORMATĪVS"));
        }
      }
    }

    // 3) ABSTRAKTS_LABUMS
    if (Array.isArray(R.ABSTRACT_GOOD_PATTERNS)) {
      for (const p of R.ABSTRACT_GOOD_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "ABSTRAKTS_LABUMS"));
      }
    } else if (Array.isArray(R.ABSTRACT_GOOD)) {
      markers.push(...findWordListMarkers(lower, R.ABSTRACT_GOOD, "ABSTRAKTS_LABUMS"));
    }

    // 4) CITU_IEKŠĒJAIS_STĀVOKLIS
    if (R.OTHERS_STATE_PATTERN instanceof RegExp) {
      markers.push(...findRegexMarkers(text, R.OTHERS_STATE_PATTERN, "CITU_IEKŠĒJAIS_STĀVOKLIS"));
    } else if (R.OTHERS_STATE instanceof RegExp) {
      markers.push(...findRegexMarkers(text, R.OTHERS_STATE, "CITU_IEKŠĒJAIS_STĀVOKLIS"));
    }

    // 5) RETROSPEKTĪVA_ETIĶETE
    if (Array.isArray(R.RETRO_LABEL_PATTERNS)) {
      for (const p of R.RETRO_LABEL_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "RETROSPEKTĪVA_ETIĶETE"));
      }
    }

    // 6) TELEOLOĢIJA
    if (Array.isArray(R.TELEOLOGY_PATTERNS)) {
      for (const p of R.TELEOLOGY_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "TELEOLOĢIJA"));
      }
    }

    // 7) NEDEFINĒTS MEHĀNISMS (v0.4+)
    if (Array.isArray(R.UNDEFINED_MECH_PATTERNS)) {
      for (const p of R.UNDEFINED_MECH_PATTERNS) {
        markers.push(...findRegexMarkers(text, p, "NEDEFINĒTS_MEHĀNISMS"));
      }
    }


    // dedupe: type + index + text
const seen = new Set();
markers = markers.filter(m => {
  const key = `${m.type}|${m.index}|${m.text}`;
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

// sakārtojam
markers.sort((a, b) => a.index - b.index);

const simplifiedMarkers = markers.map(m => ({ text: m.text, type: m.type }));
const configs = detectConfigurations(simplifiedMarkers);

return {
  text,
  markers: simplifiedMarkers,
  configs,              // <-- JAUNS
  nf: simplifiedMarkers.length
};


  }

  function analyze(text, R) {
    const input = String(text || "").trim();
    if (!input) return { sentences: [], nf_total: 0, nf_average: 0 };

    const sentenceTexts = splitSentences(input);
    const sentences = sentenceTexts
      .map(s => analyzeSentence(s, R))
      .map((s, i) => ({ id: i + 1, ...s }));

    const nf_total = sentences.reduce((sum, s) => sum + s.nf, 0);
    const nf_average = sentences.length ? +(nf_total / sentences.length).toFixed(2) : 0;

    
    const configCounts = {};
    for (const s of sentences) {
       for (const c of (s.configs || [])) {
        configCounts[c] = (configCounts[c] || 0) + 1;
    }
}

   const configCounts = {};
for (const s of sentences) {
  for (const c of (s.configs || [])) {
    configCounts[c] = (configCounts[c] || 0) + 1;
  }
} 
    return { sentences, nf_total, nf_average, configCounts };
  }

  // ---------- render ----------
  function render(result) {
    if (!result || !result.sentences) {
      setSummary("");
      setSentences("");
      return;
    }

    if (result.sentences.length === 0) {
      setSummary("");
      setSentences("");
      return;
    }

    const configs = result.configCounts || {};
const topConfigs = Object.entries(configs)
  .sort((a,b) => b[1] - a[1])
  .slice(0, 3)
  .map(([k,v]) => `${k}: ${v}`)
  .join(" · ");

setSummary(
  `Teikumi: <strong>${result.sentences.length}</strong> · ` +
  `NF kopā: <strong>${result.nf_total}</strong> · ` +
  `NF vidēji: <strong>${result.nf_average}</strong>` +
  (topConfigs ? ` · <span class="muted">${escapeHtml(topConfigs)}</span>` : "")
);


    const html = result.sentences.map(s => {
      const markersHtml = s.markers.length
        ? `<ul>${s.markers.map(m =>
            `<li><code>${escapeHtml(m.text)}</code> <span class="pill">${escapeHtml(m.type)}</span></li>`
          ).join("")}</ul>`
        : `<div class="muted">Marķieri nav atrasti.</div>`;
const configsHtml = (s.configs && s.configs.length)
  ? `<div style="margin-top:8px;">${s.configs.map(c => `<span class="pill">${escapeHtml(c)}</span>`).join(" ")}</div>`
  : "";

      return `
        <div class="sentence">
          <div class="sentenceHeader">
  <div>
    <strong>#${s.id}</strong>
    ${s.isTop ? `<span class="pill">TOP</span>` : ``}
    <span class="muted">${escapeHtml(s.text)}</span>
  </div>
  <div><span class="pill">NF ${s.nf}</span></div>
</div>
          ${markersHtml}
          ${configsHtml}
          
        </div>
      `;
    }).join("");

    setSentences(html);
  }

  // ---------- boot ----------
  function boot() {
    const inputEl = $("input");
    const btnRun = $("btnRun");

    if (!inputEl || !btnRun || !$("summary") || !$("sentences")) {
      showFatal("Trūkst kāds no elementiem: input, btnRun, summary, sentences. Pārbaudi index.html id atribūtus.");
      return;
    }

    const R = getRules();
    if (!R) {
      showFatal("Nav ielādēti noteikumi (rules). Pārbaudi, ka index.html vispirms ielādē rules-v05.js un tikai tad app.js.");
      return;
    }

    // drošības pārbaude: vismaz kaut kas no noteikumiem eksistē
    const hasAny =
      Array.isArray(R.UNIVERSAL_PATTERNS) || Array.isArray(R.UNIVERSALS) ||
      Array.isArray(R.NORMATIVE_PATTERNS) || Array.isArray(R.NORMATIVES) ||
      Array.isArray(R.ABSTRACT_GOOD_PATTERNS) || Array.isArray(R.ABSTRACT_GOOD) ||
      (R.OTHERS_STATE_PATTERN instanceof RegExp) || (R.OTHERS_STATE instanceof RegExp);

    if (!hasAny) {
      showFatal("Noteikumu objekts ir ielādēts, bet tajā nav sagaidāmo lauku. Pārbaudi rules faila nosaukumu un saturu.");
      return;
    }

    btnRun.addEventListener("click", () => {
      try {
        const res = analyze(inputEl.value, R);
        render(res);
      } catch (e) {
        showFatal("Analīze neizdevās (izņēmums).", e);
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();



