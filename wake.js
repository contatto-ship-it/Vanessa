/* Riconoscimento della parola di attivazione, sessione di dialogo e politica di riavvio, senza dipendenze. */
(function (root, factory) {
  var api = factory();
  if (typeof module === "object" && module.exports) { module.exports = api; }
  else { root.Wake = api; }
})(typeof self !== "undefined" ? self : this, function () {
  "use strict";

  /* Minuscole, senza accenti, senza punteggiatura, spazi singoli. */
  function normalizza(testo) {
    return String(testo || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  var PREMESSI = ["ehi", "hey", "ok", "okay", "ciao", "ascolta"];

  /*
   * Restituisce { attivato, comando }.
   * La parola vale solo all'inizio della frase, o dopo un breve richiamo
   * ("ehi moana", "ok moana"): così una frase che la contiene di sfuggita
   * ("chiamami moana") non attiva l'ascolto.
   */
  function estraiComando(trascrizione, parola) {
    var p = normalizza(parola || "moana");
    var t = normalizza(trascrizione);
    if (!p) { return { attivato: false, comando: "" }; }

    var parole = t ? t.split(" ") : [];
    var indice = parole.indexOf(p);
    if (indice === -1) { return { attivato: false, comando: "" }; }

    var valido = indice === 0 || (indice === 1 && PREMESSI.indexOf(parole[0]) !== -1);
    if (!valido) { return { attivato: false, comando: "" }; }

    return { attivato: true, comando: parole.slice(indice + 1).join(" ").trim() };
  }

  /* Frasi che chiudono la sessione di dialogo. Confronto sull'intera frase, non su una parte. */
  var CHIUSURA = ["basta", "stop", "chiudi", "chiudi ascolto", "spegni", "spegni ascolto"];

  function eChiusura(testo) {
    return CHIUSURA.indexOf(normalizza(testo)) !== -1;
  }

  /*
   * Sessione di dialogo: dopo la parola di attivazione resta aperta per `durataMs`,
   * si rinnova a ogni frase e scade da sola. Il tempo si può passare a mano,
   * così la si prova senza orologio.
   */
  function creaSessione(durataMs) {
    var durata = Number(durataMs) > 0 ? Number(durataMs) : 60000;
    var fine = 0;
    var adesso = function (ora) { return typeof ora === "number" ? ora : Date.now(); };
    return {
      apri: function (ora) { fine = adesso(ora) + durata; return fine; },
      chiudi: function () { fine = 0; },
      attiva: function (ora) { return adesso(ora) < fine; },
      residuo: function (ora) { var r = fine - adesso(ora); return r > 0 ? r : 0; },
      durata: durata
    };
  }

  /*
   * Scelta della voce: l'elenco delle voci di sintesi dipende dal dispositivo, quindi si
   * preferiscono i nomi femminili italiani noti, poi le altre voci italiane, poi il resto.
   */
  var FEMMINILI = ["elsa", "alice", "isabella", "federica", "sonia", "irene", "paola", "sara", "giulia", "google italiano", "italiano", "female", "donna"];
  var MASCHILI = ["diego", "cosimo", "luca", "giorgio", "marco", "male", "uomo", "maschile"];

  function punteggioVoce(voce) {
    if (!voce) { return -9999; }
    var nome = normalizza(voce.name);
    var lang = String(voce.lang || "").toLowerCase();
    var punti = lang.indexOf("it") === 0 ? 0 : -1000;
    if (lang === "it-it") { punti += 5; }

    var i, femmina = -1;
    for (i = 0; i < FEMMINILI.length; i++) {
      if (nome.indexOf(FEMMINILI[i]) !== -1) { femmina = i; break; }
    }
    if (femmina !== -1) {
      punti += 100 - femmina;
    } else {
      var maschio = false;
      for (i = 0; i < MASCHILI.length; i++) {
        if (nome.indexOf(MASCHILI[i]) !== -1) { maschio = true; break; }
      }
      punti += maschio ? 10 : 40;
    }
    if (voce.localService === false) { punti += 2; }
    return punti;
  }

  /* La voce migliore secondo il punteggio: italiano e femminile valgono di più. */
  function scegliVoce(voci) {
    var lista = voci || [];
    var migliore = null;
    for (var i = 0; i < lista.length; i++) {
      if (!migliore || punteggioVoce(lista[i]) > punteggioVoce(migliore)) { migliore = lista[i]; }
    }
    return migliore;
  }

  /* Attese crescenti fra i tentativi di riavvio del microfono, in millisecondi. */
  var ATTESE = [400, 800, 1600, 3200, 6400, 10000];

  function prossimaAttesa(fallimenti) {
    var n = Number(fallimenti);
    if (!isFinite(n) || n < 0) { n = 0; }
    var i = Math.min(Math.floor(n), ATTESE.length - 1);
    return ATTESE[i];
  }

  /* Dopo questo numero di fallimenti consecutivi l'ascolto si sospende e lo dice. */
  var SOGLIA_SOSPENSIONE = 6;

  function daSospendere(fallimenti) {
    var n = Number(fallimenti);
    if (!isFinite(n)) { return false; }
    return n >= SOGLIA_SOSPENSIONE;
  }

  return {
    normalizza: normalizza,
    estraiComando: estraiComando,
    eChiusura: eChiusura,
    creaSessione: creaSessione,
    scegliVoce: scegliVoce,
    punteggioVoce: punteggioVoce,
    prossimaAttesa: prossimaAttesa,
    daSospendere: daSospendere,
    SOGLIA_SOSPENSIONE: SOGLIA_SOSPENSIONE
  };
});
