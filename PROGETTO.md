# Vanessa

Assistente vocale con un volto. Nome definitivo: **Vanessa** (prima "Moana").

## Dove vive

- Sito online: `https://assistente-vocale-tmcctb-preview.freebuff.site` (ambiente "preview" del sito Freebuff "Assistente vocale").
- Questo repository è la copia di sicurezza: se una chat sparisce, il progetto resta qui.

## File

- `index.html` — la pagina intera: volto, conversazione, microfono, parola di attivazione, campo di testo, gestione della chiave Groq.
- `wake.js` — parola di attivazione, sessione di dialogo, scelta della voce italiana, politica di riavvio del microfono.
- `assets/vanessa-poliziotta.jpg` — il ritratto di Vanessa. **Manca ancora in questo repository**: l'immagine si scarica dal sito (indirizzo qui sopra, poi `/assets/vanessa-poliziotta.jpg`) e si trascina nella cartella `assets/`. Senza quel file la pagina mostra il riquadro vuoto al posto del volto.
- `PROGETTO.md` — queste note.

## Come funziona

- Cervello: Groq (`openai/gpt-oss-120b`), chiamata diretta dal browser con la chiave dell'utente, salvata solo nel `localStorage` del dispositivo.
- Voce: sintesi vocale del browser (`speechSynthesis`), con preferenza per le voci italiane femminili.
- Ascolto: Web Speech API del browser, lingua `it-IT`.
- Il volto è una fotografia: si illumina quando ascolta, si spegne quando pensa, si scalda quando risponde, ma non può muovere la bocca.

## Prossimi passi

1. Caricare `assets/vanessa-poliziotta.jpg` in questo repository (basta trascinarlo dalla pagina del repository).
2. Valutare un servizio di voce italiana che restituisca l'audio: Groq copre solo inglese e arabo, quindi con Groq la bocca non può muoversi.
3. Dopo ogni modifica: aggiornare il sito online, perché questa copia non si pubblica da sola.
