// rules-v03.js
// Visi noteikumi vienā vietā. Šo failu tu mainīsi visbiežāk.

window.RULES_V03 = {
  meta: { version: "0.3", updated: "2026-01-11", name: "Valodas struktūras filtrs" },
  ...
};

window.RULES_V03 = {
  UNIVERSALS: ["visi","vienmēr","nekad","neviens","katrs","jebkurš"],
  NORMATIVES: ["vajag","vajadzētu","nedrīkst"],
  NORM_PATTERNS: [/\bir\s+jādara\b/gi, /\bbūtu\s+jā\b/gi],
  ABSTRACT_GOOD: ["labi","pareizi","taisnīgi","cilvēcīgi","normāli"],

  OTHERS_STATE: /\b(viņi|citi|cilvēki|kāds)\b\s+\b(domā|jūt|grib|saprot|zina)\b/gi,

  RETRO_LABEL_PATTERNS: [
    /\bes\s+neesmu\s+tāds\b/gi,
    /\bes\s+esmu\s+tāds\b/gi,
    /\bes\s+neesmu\s+cilvēks,\s*kas\b/gi,
    /\bes\s+neesmu\s+no\s+tiem,\s*kas\b/gi,
    /\btāds\s+cilvēks\s+kā\s+es\b/gi,
    /\bi\s+am\s+not\s+the\s+kind\s+of\s+person\s+who\b/gi,
    /\bi\s+am\s+the\s+type\s+of\s+person\s+who\b/gi,
    /\bi['’]m\s+just\s+not\s+someone\s+who\b/gi
  ],

  TELEOLOGY_PATTERNS: [
    /\bkad\s+pienāks\s+laiks\b/gi,
    /\bar\s+laiku\b/gi,
    /\blaiks\s+rādīs\b/gi,
    /\bdzīve\s+parādīs\b/gi,
    /\bviss\s+nāks\s+pats\b/gi,
    /\btā\s+bija\s+lemts\b/gi,
    /\btam\s+bija\s+jānotiek\b/gi,
    /\btā\s+tam\s+jābūt\b/gi,
    /\bliktenis\b/gi,
    /\bparedzēts\b/gi,
    /\btad\s+sapratīšu\b/gi,
    /\bkaut\s+kad\s+sapratīšu\b/gi,
    /\bpats\s+kļūs\s+skaidrs\b/gi,
    /\bwhen\s+the\s+time\s+comes\b/gi,
    /\bin\s+time\b/gi,
    /\btime\s+will\s+tell\b/gi,
    /\bmeant\s+to\s+be\b/gi,
    /\bdestiny\b/gi,
    /\blife\s+will\s+show\b/gi,
    /\beverything\s+happens\s+for\s+a\s+reason\b/gi
  ]
};

