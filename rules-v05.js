// rules-v05.js
// Fokus: latviešu locījumi un formas (v0.5)

window.RULES_V05 = {
  meta: { version: "0.5", updated: "2026-01-11", name: "Valodas struktūras filtrs" },

  // Palīgklase LV "vārda turpinājumam"
  // Lietosim tikai regexos, lai ķertu locījumus ar diakritiku
  _LVWORD: "[a-zāčēģīķļņōŗšūž]+",

  // ===== UNIVERSĀLIS =====
  // Pārejam uz regex, kas ķer locījumus/formas
  UNIVERSAL_PATTERNS: [
    // visi/visu/visiem/visās/visos/visām/visiem...
        /\bkat(r|ra|ram|ru|rs|ri|ros|rās|riem|rām|rai|ras)\b/gi,

    // vienmēr
    /\bvienmēr\b/gi,

    // nekad
    /\bnekad\b/gi,

    // neviens/neviena/nevienam/nevienu/nevieni/nevieniem/nevienās...
    /\bnevien(a|s|u|am|ai|i|iem|ām|os|ās)?\b/gi,

    // katrs/katra/katram/katru/katri/katriem/katros/katrai/katras/katrai/katrām...
    /\bkat(r|ra|ram|ru|ri|rā|ras|rai|riem|rām|ros|rās)\b/gi,

    // jebkurš/jebkura/jebkuram/jebkuru/jebkuri/jebkuriem/jebkurā/jebkuros...
    /\bjebkur(š|a|am|ai|u|i|iem|ām|ā|os|ās)\b/gi
  ],

  // ===== NORMATĪVS =====
  // “vajag/vajadzētu/nedrīkst” + konstrukcijas ar “jā-”
 NORMATIVE_PATTERNS: [
  /\bvajag\b/gi,
  /\bvajadzētu\b/gi,
  /\bnedrīkst\b/gi,

  // tikai skaidras konstrukcijas
  /\bir\s+jā\s+[a-zāčēģīķļņōŗšūž]+/giu,
  /\bbūtu\s+jā\s*[a-zāčēģīķļņōŗšūž]+/giu

   
],

  // ===== ABSTRAKTS_LABUMS =====
  // ķer adverbus + īpašības vārdu saknes ar locījumiem
  ABSTRACT_GOOD_PATTERNS: [
    /\blabi\b/gi,
    /\bpareiz[a-zāčēģīķļņōŗšūž]*\b/giu,     // pareizs, pareiza, pareizi, pareizā, pareizie...
    /\btaisnīg[a-zāčēģīķļņōŗšūž]*\b/giu,   // taisnīgs, taisnīga, taisnīgi...
    /\bcilvēcīg[a-zāčēģīķļņōŗšūž]*\b/giu,  // cilvēcīgs, cilvēcīgi...
    /\bnormāl[a-zāčēģīķļņōŗšūž]*\b/giu     // normāls, normāli, normālāk...
  ],

  // ===== CITU_IEKŠĒJAIS_STĀVOKLIS =====
  // paplašinām “subjektu” un “darbības vārdu” formas
  OTHERS_STATE_PATTERN: new RegExp(
    String.raw`\b(` +
      // viņš/viņa/viņi + locījumi
      String.raw`viņš|viņa|viņi|viņu|viņiem|viņām|` +
      // cits/citi + locījumi
      String.raw`cits|cita|citi|citu|citiem|citām|` +
      // cilvēks/cilvēki + locījumi
      String.raw`cilvēks|cilvēka|cilvēkam|cilvēku|cilvēki|cilvēkiem|` +
      // kāds/kāda + locījumi
      String.raw`kāds|kāda|kādu|kādam|kādai|kādi|kādiem|kādām` +
    String.raw`)\b\s+\b(` +
      // domāt
      String.raw`domā|domāja|domās|` +
      // just
      String.raw`jūt|juta|jutīs|` +
      // gribēt
      String.raw`grib|gribēja|gribēs|` +
      // saprast
      String.raw`saprot|saprata|sapratis|sapratusi|sapratuši|sapratīs|` +
      // zināt
      String.raw`zina|zināja|zinās` +
    String.raw`)\b`,
    "giu"
  ),

  // ===== RETROSPEKTĪVA_ETIĶETE ===== (kā bija)
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

  // ===== TELEOLOĢIJA ===== (mazliet paplašinām “kad pienāks laiks”)
  TELEOLOGY_PATTERNS: [
    /\bkad\s+pienāks\s+[a-zāčēģīķļņōŗšūž]+\s+laiks\b/giu, // “īstais laiks” utml.
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
  ],

  // ===== NEDEFINĒTS MEHĀNISMS ===== (kā bija, + daži LV locījumi)
  UNDEFINED_MECH_PATTERNS: [
    /\bkaut\s+kā\b/gi,
    /\bkaut\s+kādā\s+veidā\b/gi,
    /\bpats\s+no\s+sevis\b/gi,

    /\bviss\s+sakārtosies\b/gi,
    /\bviss\s+noskaidrosies\b/gi,
    /\bviss\s+nokārtosies\b/gi,
    /\bviss\s+būs\s+kārtībā\b/gi,

    /\bgan\s+jau\b/gi,
    /\bgan\s+jau\s+būs\b/gi,
    /\bviss\s+būs\s+labi\b/gi,

    /\bkā\s+būs,\s*tā\s+būs\b/gi,
    /\bkā\s+būs\s+tā\s+būs\b/gi,

    /\bkaut\s+kad\b/gi,
    /\bkādreiz\b/gi,

    /\bsomehow\b/gi,
    /\bit\s+will\s+work\s+out\b/gi,
    /\beverything\s+will\s+be\s+fine\b/gi,
    /\bit\s+will\s+sort\s+itself\s+out\b/gi
  ]
};


