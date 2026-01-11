window.RULES_V06 = {
  // 1) UNIVERSĀLIS — absolūtie vispārinājumi
  // Mērķis: noķert "katrs/katram/katru...", "visi/visiem/visu...", "neviens/nevienam...", "vienmēr/nekad"
  UNIVERSAL_PATTERNS: [
    // katrs locījumi (katrs, katram, katru, katri, katriem, katros, ...)
    /\bkat(?:rs|ra|ram|ru|ri|ros|rās|riem|rām|rai|ras)\b/giu,

    // visi locījumi (visi, visiem, visus, visas, visā, visos, utt.)
    /\bvis(?:s|i|u|iem|ām|ās|os|ai|ā|āks|āk|ākie|ākajiem)\b/giu,

    // neviens locījumi
    /\bnevien(?:s|a|am|u|i|iem|ās|os)\b/giu,

    // vienmēr / nekad (spēcīgi universāļi)
    /\bvienmēr\b/giu,
    /\bnekad\b/giu,

    // "ikviens", "jebkurš"
    /\bikviens\b/giu,
    /\bjebkur(?:š|a|am|u|i|iem|ās|os)\b/giu
  ],

  // 2) NORMATĪVS — vajag / jābūt / nedrīkst
  // Mērķis: noķert NORMATĪVU, bet neķert "pēdējās" utt. Tāpēc: tikai pilnas frāzes, nevis "jās" fragmenti.
  NORMATIVE_PATTERNS: [
    /\bvajag\b/giu,
    /\bvajadzētu\b/giu,
    /\bnedrīkst\b/giu,

    // "ir jā" + darbības vārds (ar vai bez atstarpes)
    /\bir\s+jā\s*\p{L}+/giu,

    // "būtu jā" + darbības vārds (ar vai bez atstarpes)
    /\bbūtu\s+jā\s*\p{L}+/giu,

    // "jābūt" + īpašības vārds / apzīmējums
    /\bjābūt\b/giu,

    // "tev/man/mums/jums viņam/viņai jā..." (ļoti bieži ikdienā)
    /\b(?:man|tev|mums|jums|viņam|viņai|viņiem|viņām)\s+jā\s*\p{L}+/giu
  ],

  // 3) TELEOLOĢIJA — iznākums bez procesa (laiks rādīs, kad pienāks laiks, viss būs labi, utt.)
  TELEOLOGY_PATTERNS: [
    /\bar\s+laiku\b/giu,
    /\bkad\s+pienāks\s+laiks\b/giu,
    /\blaiks\s+rādīs\b/giu,
    /\bgan\s+jau\b/giu,
    /\bviss\s+būs\s+labi\b/giu,
    /\bviss\s+sakārtosies\b/giu,
    /\bnostāsies\s+savās\s+vietās\b/giu
  ],

  // 4) NEDEFINĒTS_MEHĀNISMS — "pats", "kaut kā", "kaut kad", "kaut kas", "notiks pats"
  // Šis ir labs pāris ar TELEOLOĢIJU konfigurācijai ATLIKTA_ATBILDĪBA.
  UNDEFINED_MECH_PATTERNS: [
    /\bpats\s+no\s+sevis\b/giu,
    /\bpaš(?:a|i|ām|os)?\b/giu,               // uzmanīgi: šis ir "plašāks", ja dod troksni, izņem
    /\bkaut\s+kā\b/giu,
    /\bkaut\s+kad\b/giu,
    /\bkaut\s+kas\b/giu,
    /\bnotiks\b/giu,                           // ja dod troksni, vari noņemt; bet publiskajā režīmā “Atrasts:” der
    /\bizdosies\b/giu
  ],

  // 5) RETROSPEKTĪVA_ETIĶETE — identitāte kā cēlonis (“es neesmu tāds”, “es esmu cilvēks, kas…”)
  RETRO_LABEL_PATTERNS: [
    /\bes\s+ne\s+esmu\s+tāds\b/giu,
    /\bes\s+esmu\s+tāds\b/giu,
    /\bes\s+esmu\s+(?:cilvēks|tips|persona)\b/giu,
    /\bes\s+neesmu\s+(?:cilvēks|tips|persona)\b/giu
  ]
};
