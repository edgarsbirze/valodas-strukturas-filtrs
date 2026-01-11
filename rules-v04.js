// rules-v04.js
// v0.4: + NEDEFINĒTS_MEHĀNISMS

window.RULES_V04 = {
  meta: { version: "0.4", updated: "2026-01-11", name: "Valodas struktūras filtrs" },

  UNIVERSALS: ["visi","vienmēr","nekad","neviens","katrs","jebkurš"],
  NORMATIVES: ["vajag","vajadzētu","nedrīkst"],
  NORM_PATTERNS: [/\bir\s+jādara\b/gi, /\bbūtu\s+jā\b/gi],
  ABSTRACT_GOOD: ["labi","pareizi","taisnīgi","cilvēcīgi","normāli"],

  OTHERS_STATE: /\b(viņi|citi|cilvēki|kāds)\b\s+\b(domā|jūt|grib|saprot|zina)\b/gi,

  RETRO_LABEL_PATTERNS: [
    // LV
    /\bes\s+neesmu\s+tāds\b/gi,
    /\bes\s+esmu\s+tāds\b/gi,
    /\bes\s+neesmu\s+cilvēks,\s*kas\b/gi,
    /\bes\s+neesmu\s+no\s+tiem,\s*kas\b/gi,
    /\btāds\s+cilvēks\s+kā\s+es\b/gi,

    // EN
    /\bi\s+am\s+not\s+the\s+kind\s+of\s+person\s+who\b/gi,
    /\bi\s+am\s+the\s+type\s+of\s+person\s+who\b/gi,
    /\bi['’]m\s+just\s+not\s+someone\s+who\b/gi
  ],

  TELEOLOGY_PATTERNS: [
    // LV — laiks / automātisms
    /\bkad\s+pienāks\s+laiks\b/gi,
    /\bar\s+laiku\b/gi,
    /\blaiks\s+rādīs\b/gi,
    /\bdzīve\s+parādīs\b/gi,
    /\bviss\s+nāks\s+pats\b/gi,

    // LV — noliktība
    /\btā\s+bija\s+lemts\b/gi,
    /\btam\s+bija\s+jānotiek\b/gi,
    /\btā\s+tam\s+jābūt\b/gi,
    /\bliktenis\b/gi,
    /\bparedzēts\b/gi,

    // LV — saprašana bez mehānisma
    /\btad\s+sapratīšu\b/gi,
    /\bkaut\s+kad\s+sapratīšu\b/gi,
    /\bpats\s+kļūs\s+skaidrs\b/gi,

    // EN
    /\bwhen\s+the\s+time\s+comes\b/gi,
    /\bin\s+time\b/gi,
    /\btime\s+will\s+tell\b/gi,
    /\bmeant\s+to\s+be\b/gi,
    /\bdestiny\b/gi,
    /\blife\s+will\s+show\b/gi,
    /\beverything\s+happens\s+for\s+a\s+reason\b/gi
  ],

  // v0.4 — NEDEFINĒTS MEHĀNISMS
  // (notiek / būs / sanāks / atrisināsies) bez mehānisma
  UNDEFINED_MECH_PATTERNS: [
    // LV — “kaut kā”
    /\bkaut\s+kā\b/gi,
    /\bkaut\s+kādā\s+veidā\b/gi,

    // LV — “pats no sevis / pats”
    /\bpats\s+no\s+sevis\b/gi,
    /\bpašs?(\s+no\s+sevis)?\b/gi, // ķer "pats", "pašs" (konservatīvi)

    // LV — “viss sakārtosies / nokārtos”
    /\bviss\s+sakārtosies\b/gi,
    /\bviss\s+noskaidrosies\b/gi,
    /\bviss\s+nokārtosies\b/gi,
    /\bviss\s+būs\s+kārtībā\b/gi,

    // LV — “gan jau”
    /\bgan\s+jau\b/gi,
    /\bgan\s+jau\s+būs\b/gi,
    /\bviss\s+būs\s+labi\b/gi,

    // LV — “kā būs, tā būs”
    /\bkā\s+būs,\s*tā\s+būs\b/gi,
    /\bkā\s+būs\s+tā\s+būs\b/gi,

    // LV — “kaut kad / kādreiz” (bez teleoloģijas vārda “laiks”)
    /\bkaut\s+kad\b/gi,
    /\bkādreiz\b/gi,

    // EN — analogi
    /\bsomehow\b/gi,
    /\bit\s+will\s+work\s+out\b/gi,
    /\beverything\s+will\s+be\s+fine\b/gi,
    /\bit\s+will\s+sort\s+itself\s+out\b/gi
  ]
};
