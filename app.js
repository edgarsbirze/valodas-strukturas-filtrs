// app.js
(function () {
  const R = window.RULES_V05;

  function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

  function splitSentences(text) {
    const raw = text.replace(/\r\n/g, "\n").split(/\n+/).map(s => s.trim()).filter(Boolean);
    const out = [];
    for (const chunk of raw) {
      const parts = chunk.split(/([.!?;]+)\s+/);
      if (parts.length === 1) { out.push(chunk); continue; }
      let buf = "";
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        if (!p) continue;
        buf += p;
        if (/[.!?;]+/.test(p)) { out.push(buf.trim()); buf = ""; }
        else { buf += " "; }
      }
      if (buf.trim()) out.push(buf.trim());
    }
    return out;
  }

  function findWordMarkers(textLower, words, type) {
    const markers = [];
    for (const w of words) {
      const re = new RegExp(`\\b${w}\\b`, "gi");
      let m;
      while ((m = re.exec(textLower)) !== null) markers.push({ text: m[0], type, index: m.index });
    }
    return markers;
  }

  function findRegexMarkers(text, regex, type) {
    const markers = [];
    let m;
    const re = new RegExp(regex.source, regex.flags);
    while ((m = re.exec(text)) !== null) markers.push({ text: m[0], type, index: m.index });
    return markers;
  }

  function analyzeSentence(sentenceText) {
    const original = sentenceText.trim();
    const lower = original.toLowerCase();
    let markers = [];

    markers = markers.concat(findWordMarkers(lower, R.UNIVERSALS, "UNIVERSĀLIS"));
    markers = markers.concat(findWordMarkers(lower, R.NORMATIVES, "NORMATĪVS"));
    markers = markers.concat(findWordMarkers(lower, R.ABSTRACT_GOOD, "ABSTRAKTS_LABUMS"));
    for (const p of R.NORM_PATTERNS) markers = markers.concat(findRegexMarkers(original, p, "NORMATĪVS"));
    markers = markers.concat(findRegexMarkers(original, R.OTHERS_STATE, "CITU_IEKŠĒJAIS_STĀVOKLIS"));
    for (const p of R.RETRO_LABEL_PATTERNS) markers = markers.concat(findRegexMarkers(original, p, "RETROSPEKTĪVA_ETIĶETE"));
    for (const p of R.TELEOLOGY_PATTERNS) markers = markers.concat(findRegexMarkers(original, p, "TELEOLOĢIJA"));
    for (const p of R.UNDEFINED_MECH_PATTERNS) markers = markers.concat(findRegexMarkers(original, p, "NEDEFINĒTS_MEHĀNISMS"));
    for (const p of R.UNIVERSAL_PATTERNS) markers = markers.concat(findRegexMarkers(original, p, "UNIVERSĀLIS"));
    for (const p of R.NORMATIVE_PATTERNS) markers = markers.concat(findRegexMarkers(original, p, "NORMATĪVS"));
    for (const p of R.ABSTRACT_GOOD_PATTERNS) markers = markers.concat(findRegexMarkers(original, p, "ABSTRAKTS_LABUMS"));


    // CITU_IEKŠĒJAIS_STĀVOKLIS (regex)
    markers = markers.concat(findRegexMarkers(original, R.OTHERS_STATE_PATTERN, "CITU_IEKŠĒJAIS_STĀVOKLIS"));
    
    
    markers.sort((a,b) => a.index - b.index);
    return { text: original, markers: markers.map(({text,type})=>({text,type})), nf: markers.length };
  }

  function analyze(input) {
    const text = (input || "").trim();
    if (!text) return { sentences: [], nf_total: 0, nf_average: 0 };
    const list = splitSentences(text).map(analyzeSentence).map((s,i)=>({id:i+1,...s}));
    const nf_total = list.reduce((sum, s) => sum + s.nf, 0);
    const nf_average = list.length ? +(nf_total / list.length).toFixed(2) : 0;
    return { sentences: list, nf_total, nf_average };
  }

  function render(r) {
    const summaryEl = document.getElementById("summary");
    const sentencesEl = document.getElementById("sentences");

    if (!r.sentences.length) {
      summaryEl.textContent = "";
      sentencesEl.innerHTML = "";
      return;
    }

    summaryEl.innerHTML =
      `Teikumi: <strong>${r.sentences.length}</strong> · ` +
      `NF kopā: <strong>${r.nf_total}</strong> · ` +
      `NF vidēji: <strong>${r.nf_average}</strong>`;

    sentencesEl.innerHTML = r.sentences.map(s => {
      const markerHtml = s.markers.length
        ? `<ul>${s.markers.map(m => `<li><code>${escapeHtml(m.text)}</code> <span class="pill">${escapeHtml(m.type)}</span></li>`).join("")}</ul>`
        : `<div class="muted">Marķieri nav atrasti.</div>`;

      return `
        <div class="sentence">
          <div class="sentenceHeader">
            <div><strong>#${s.id}</strong> <span class="muted">${escapeHtml(s.text)}</span></div>
            <div><span class="pill">NF ${s.nf}</span></div>
          </div>
          ${markerHtml}
        </div>
      `;
    }).join("");
  }

  document.getElementById("btnRun").addEventListener("click", () => {
    render(analyze(document.getElementById("input").value));
  });
})();



