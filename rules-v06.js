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
  
    /\bkaut\s+kā\b/giu,
    /\bkaut\s+kad\b/giu,
    /\bkaut\s+kas\b/giu,
                   
    /\bizdosies\b/giu
  ],

  // 5) RETROSPEKTĪVA_ETIĶETE — identitāte kā cēlonis (“es neesmu tāds”, “es esmu cilvēks, kas…”)
  RETRO_LABEL_PATTERNS: [
    /\bes\s+ne\s+esmu\s+tāds\b/giu,
    /\bes\s+esmu\s+tāds\b/giu,
    /\bes\s+esmu\s+(?:cilvēks|tips|persona)\b/giu,
    /\bes\s+neesmu\s+(?:cilvēks|tips|persona)\b/giu
  ]

  // 6) CITU_IEKŠĒJAIS_STĀVOKLIS — pieņēmumi par citu domām/jūtām/nolūkiem
OTHERS_STATE_PATTERNS: [
  // "viņš/viņa/viņi/viņas domā/šķiet/jūt/grib/negrib"
  /\b(?:viņš|viņa|viņi|viņas)\s+(?:domā|jūt|grib|negrib|vēlas|nevēlas|šķiet|uzskata)\b/giu,

  // "man liekas, ka viņš/viņa..."
  /\bman\s+(?:liekas|šķiet)\s*,?\s+ka\s+(?:viņš|viņa|viņi|viņas)\b/giu,

  // "viņam/viņai/viņiem/viņām liekas/šķiet"
  /\b(?:viņam|viņai|viņiem|viņām)\s+(?:liekas|šķiet)\b/giu
],

ABSTRACT_GOOD_PATTERNS: [
  /\blabi\b/giu,
  /\bpareizi\b/giu,
  /\bnormāli\b/giu,
  /\bvajadzīgi\b/giu,
  /\bvērts\b/giu,
  /\bvērīgi\b/giu,          // ja kļūdaini – izņem
  /\bvērtīgi\b/giu,
  /\bjēga\b/giu,
  /\bnozīmīgi\b/giu,
  /\bsvarīgi\b/giu
],


// 8) SALĪDZINĀJUMS / ETALONS — “labāk nekā”, “kā citi”, “normāli cilvēki”, “vajadzētu būt kā…”
COMPARISON_PATTERNS: [
  /\blabāk\s+nekā\b/giu,
  /\bsliktāk\s+nekā\b/giu,
  /\btāpat\s+kā\b/giu,
  /\bgluži\s+kā\b/giu,
  /\bkā\s+citi\b/giu,
  /\bkā\s+visiem\b/giu,
  /\bnormāl(?:s|a|i|u|ie|ajiem)\s+(?:cilvēk(?:s|i)|cilvēkiem)\b/giu,
  /\bvajadzētu\s+būt\s+kā\b/giu
],

// 9) NEKONKRĒTAIS SUBJEKTS — “cilvēki”, “sabiedrība”, “visi”, “viņi” (kā miglains subjekts)
VAGUE_SUBJECT_PATTERNS: [
  /\bcilvēki\s+(?:saka|domā|uzskata|runā)\b/giu,
  /\bsabiedrība\s+(?:saka|domā|uzskata|pieņem)\b/giu,
  /\bvisi\s+(?:saka|domā|zina|uzskata)\b/giu,
  /\bviņi\s+(?:saka|domā|grib|negrib|zina|uzskata)\b/giu
],

// 10) MINDFOG — “kaut kā”, “vienkārši”, “viss”, “nekas”, “kaut kas”
MINDFOG_PATTERNS: [
  /\bkaut\s+kā\b/giu,
  /\bkaut\s+kas\b/giu,
  /\bkaut\s+kur\b/giu,
  /\bkaut\s+kad\b/giu,
  /\bvieni?nkārši\b/giu,
  /\bviss\b/giu,
  /\bnekas\b/giu
],

  
};




