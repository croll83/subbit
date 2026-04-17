# Handoff: Subbit Gameplay HUD

## Overview
Redesign completo dell'HUD in-game di **Subbit**, una Telegram Mini App mobile-only (landscape) ispirata al gioco da tavolo del calcio a biglie. Il gioco corrente usa Three.js + Rapier + WebSocket (vedi `PLAN.md`) con un HUD grezzo (`client/index.html` + `client/game/ui.js`) che ora va sostituito con la versione "Variante B · Sport-tech bilanciato" approvata dopo 3 round di esplorazione.

Questo pacchetto contiene **solo la variante finale scelta**. Tutte le vecchie A (minimal) e C (editorial) sono state scartate e non vanno implementate.

## About the Design Files
I file in questo bundle sono **riferimenti di design creati in HTML/React** — prototipi che mostrano l'aspetto e il comportamento desiderati, **non codice di produzione da copiare direttamente**.

Il codice esistente di Subbit usa **vanilla JS moduli** (`client/game/*.js`) con `Three.js` caricato via `importmap`, **senza React** e senza bundler. Il task è **ricreare questi design nell'ambiente esistente** — HUD come DOM overlay sopra il `<canvas>` Three.js, con CSS vanilla + vanilla JS, seguendo i pattern già presenti in `client/game/ui.js`. **Non introdurre React, Vite, Tailwind o altre dipendenze** salvo istruzione contraria.

## Fidelity
**High-fidelity.** Colori, tipografia, spaziature, animazioni, micro-interazioni sono tutte definite con precisione. Il developer deve replicare pixel-perfect usando CSS vanilla e i token in `ds/tokens.js`.

## Target environment
- **Piattaforma:** Telegram Mini App, landscape mobile only
- **Rendering 3D esistente:** Three.js scene già costruita in `client/game/*.js`
- **HUD layer:** DOM elements position-absolute sopra il canvas (l'attuale `ui.js` già funziona così — si estende, non si riscrive da zero se possibile)
- **Viewport di design:** 720×360 (il mockup usa questa dimensione fissa; l'implementazione deve essere fluida e adattarsi alla viewport reale mantenendo le proporzioni relative degli elementi)

## Files in this bundle

```
design_handoff_gameplay_hud/
├── README.md                      ← questo file
├── Gameplay HUD.html              ← apri in browser per vedere il design live
└── ds/
    ├── tokens.js                  ← design tokens (colori, font, spacing, radius, shadow, ease)
    ├── icons.js                   ← SVG icon set (LogoIcon, SubbitIcon)
    ├── components.jsx             ← Badge + primitive UI (usate dallo scrubber della pagina demo)
    ├── pitch-mockup.jsx           ← rendering 2D del campo (solo per demo/visualizzazione)
    ├── hud-b-balanced.jsx         ← ★ IL FILE CHIAVE — tutta la logica HUD da portare
    └── gameplay-app.jsx           ← wrapper della pagina demo (non va portato in produzione)
```

**Il file principale da studiare è `ds/hud-b-balanced.jsx`** — contiene tutti i sotto-componenti dell'HUD (score bar, banner, keeper slider, power ring, goal card, ecc.).

## Come avviare la demo
Apri `Gameplay HUD.html` in un browser moderno. Non servono dipendenze — React, ReactDOM e Babel sono caricati da CDN. Usa lo scrubber di stato per navigare tutti i 5 stati di gioco e gli slider per regolare i parametri.

---

## Screens / Views

Il gioco ha **un solo "screen" HUD** con **5 stati** (più varianti sullo stato "flicking" in base alla potenza e flick count). L'HUD overlay è sempre sopra il campo 3D/2D.

### Canvas di riferimento
- Proporzioni design: **720×360 (2:1)** — campo 3D in background, HUD in position:absolute
- Safe areas: l'HUD occupa 60px di margine visivo dai bordi del campo per non coprire il gioco

### Stati HUD

| State id | Nome | Quando | Elementi attivi |
|---|---|---|---|
| `your_turn` | Il tuo turno | Hai il possesso, devi selezionare una pedina | Score bar, 3-flick pills, Bottom banner (giallo highlight), Keeper slider (neutro) |
| `flicking` | Flick in carica | Stai trascinando per decidere direzione/potenza | + Power ring gradient attorno alla pedina, Banner mostra % |
| `shot_incoming` | Tiro in porta | L'avversario ha tirato verso la tua porta | Banner rosso "DIFENDI", Keeper slider in modalità rossa con label DEFEND |
| `goal` | GOAL | Appena segnato | Goal card centrale con glow giallo |
| `opponent_turn` | Turno avversario | In attesa della mossa dell'altro player | Banner con dot warn e latency, Badge "Opponent playing" in alto |

---

## Components

### 1. Top Score Bar (sempre visibile)
**Posizione:** `top: 10px; left: 10px` — pill singola riga.

**Layout orizzontale:** `FlagITA · ITA · 2 · – · 1 · BRA · FlagBRA · | · 2T · 1:42`

**Stile contenitore:**
- Background: `rgba(7,32,15,0.7)` + `backdrop-filter: blur(16px)`
- Border: `1px solid rgba(255,255,255,0.15)`
- Border-radius: `999px` (pill)
- Padding: `7px 12px`
- Box-shadow: `0 4px 16px rgba(0,0,0,0.4)`
- Gap tra elementi: `10px`

**Elementi dentro:**
- **Flag**: SVG 14×14 tondo (border-radius 50%). Per ITA: tricolore verticale verde/bianco/rosso. Per BRA: quadrato verde con rombo giallo e cerchio blu. Outline bianco 1px 85% opacity.
- **3-letter code** (es. ITA): `font-family: IBM Plex Mono; font-size: 10px; font-weight: 700; letter-spacing: 1px; color: white`
- **Score digit**: `font-family: Archivo; font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; letter-spacing: -0.3px; color: white; line-height: 1`
- **Dash "–"**: `font-size: 12px; color: rgba(255,255,255,0.35); margin: 0 -2px` (avvicinato)
- **Separator verticale**: `width: 1px; height: 16px; background: rgba(255,255,255,0.18); margin: 0 2px`
- **Half label "2T"**: `font-family: IBM Plex Mono; font-size: 10px; font-weight: 600; letter-spacing: 1px; color: rgba(255,255,255,0.55)`
- **Timer**: `font-family: IBM Plex Mono; font-size: 12px; font-weight: 700; tabular-nums; color: white`

### 2. Top-Right 2D/3D Segmented Control (sempre visibile)
**Posizione:** `top: 10px; right: 10px`.

- Container: pill glass (`rgba(7,32,15,0.7)` + blur 16px, border-radius 999px, padding 3px, border bianco 15%)
- 2 bottoni "2D" / "3D" dentro
- Bottone attivo: `background: white; color: #07200f`
- Bottone inattivo: `background: transparent; color: rgba(255,255,255,0.7)`
- Font: `IBM Plex Mono 10px 700 letter-spacing: 1px`
- Padding bottone: `4px 10px`; border-radius pill

### 3. 3-Flick Pills (stato your_turn + flicking)
**Posizione:** assolute sopra la pedina selezionata (`top: <piece-y> - 38px; left: <piece-x> - 22px`).

3 pill orizzontali affiancate:
- Ogni pill: `width: 12px; height: 5px; border-radius: 3px`
- Gap: `4px`
- **Pill consumata** (flick già usato): `background: #ffd64a; box-shadow: 0 0 8px rgba(255,214,74,0.7)`
- **Pill libera**: `background: rgba(255,255,255,0.25); box-shadow: none`
- Rappresenta la regola FISTF 5.2.1 (max 3 flick consecutivi con la stessa pedina prima che debba toccare la palla o passare).

### 4. Power Ring (stato flicking)
**Posizione:** SVG fullscreen inset:0, centrato sulla pedina.

- Cerchio sfondo: `cx=<piece-x>; cy=<piece-y>; r=24; stroke: rgba(255,255,255,0.15); stroke-width: 3`
- Cerchio di potenza: stesso centro/raggio, `stroke: url(#pwrGrad); stroke-width: 3; stroke-linecap: round; stroke-dasharray: <2π·r·power> <2π·r>; transform: rotate(-90deg) attorno al centro`
- Gradient definition:
  ```
  <linearGradient id="pwrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"  stop-color="#27ae60"/>  <!-- success (low power) -->
    <stop offset="50%" stop-color="#ffd64a"/>  <!-- highlight -->
    <stop offset="100%" stop-color="#e14747"/> <!-- danger (high risk) -->
  </linearGradient>
  ```

### 5. Bottom Banner (sempre visibile)
**Posizione:** `bottom: 12px; left: 50%; transform: translateX(-50%)` — pill centrata.

**Stile base:**
- Background: `rgba(7,32,15,0.78)` + blur 14px
- Border: `1px solid rgba(255,255,255,0.12)`
- Border-radius: `999px`
- Padding: `7px 14px 7px 10px`
- Box-shadow: `0 4px 16px rgba(0,0,0,0.4)`
- Font: `Archivo 12px 600 white`
- Gap: `10px` tra elementi interni

**Dot accento** (unico pop di colore, sempre primo elemento):
- `display: inline-block; width: 8px; height: 8px; border-radius: 4px`
- Colore cambia per stato (vedi sotto)
- `box-shadow: 0 0 10px <accent-color>`
- **Pulsa** (anim `pulse 1.4s ease-in-out infinite`) negli stati `your_turn` e `shot_incoming`

**Contenuto per stato:**
| Stato | Accent color | Testo |
|---|---|---|
| `your_turn` | `#ffd64a` | "Il tuo turno — **tocca una pedina**" (ultima parte in giallo bold) |
| `flicking` | `#ffd64a` | "Trascina per direzionare" \| separatore verticale 1×12px bianco 20% \| "**<power>%**" (giallo bold, mono) |
| `shot_incoming` | `#e14747` | "**Tiro in porta — DIFENDI**" (tutto rosso bold) |
| `opponent_turn` | `#f0a020` | "Turno avversario" \| separatore \| "**34ms**" (grigio 50%, mono 10px) |
| `goal` | `#ffd64a` | "GOL di **Marco** · 78'" (nome giocatore in giallo bold) |

### 6. Goal Card (solo stato goal)
**Posizione:** inset:0, flex center.

**Background layer:** `radial-gradient(circle at 70% 50%, rgba(255,214,74,0.3), transparent 60%)` — pointer-events: none

**Card interna:**
- Padding: `20px 48px`
- Background: `rgba(7,32,15,0.55)` + blur 20px
- Border: `1px solid rgba(255,214,74,0.4)`
- Border-radius: `20px`
- Box-shadow: `0 0 60px rgba(255,214,74,0.4)` (glow giallo)
- Text-align: center

**Contenuto:**
- **Kicker "78' · 2° TEMPO"**: `IBM Plex Mono 10px letter-spacing: 3px uppercase color: #ffd64a`
- **"GOAL"**: `Archivo 56px 900 color: white letter-spacing: -2px line-height: 1 margin-top: 4px` — **NOTA: scritta "GOAL" in inglese, non "GOL!"**
- **Score summary**: `Archivo 12px rgba(255,255,255,0.7) margin-top: 6px` — es. "Italia **2** – 1 Brasile" (il 2 in giallo bold highlight)

### 7. Keeper Slider (sempre visibile)
**IMPORTANTE:** lato dinamico. `side='left'` o `'right'` dipende da quale porta è la TUA in questa partita (multiplayer → il server/client decide all'ingresso). Il lato non si inverte durante il gioco.

**Posizione:**
- `position: absolute; top: 96px; bottom: 96px; width: 22px`
- Se `side='right'`: `right: 6px`
- Se `side='left'`: `left: 6px`
- `pointer-events: none` sul container (il drag è gestito a livello di gioco, il componente è visualizzazione)

**Track:**
- `flex: 1; width: 6px; position: relative; border-radius: 3px; transition: all 200ms ease`
- **Neutro (non sotto tiro):** `background: rgba(255,255,255,0.12); border: 1px solid rgba(255,255,255,0.15)`
- **Defending (shot_incoming):** `background: rgba(225,71,71,0.2); border: 1px solid rgba(225,71,71,0.5)`

**Thumb:**
- Posizione relativa al track: `top: <thumbY>%; transform: translateY(-50%)` — la Y del thumb rappresenta la posizione del portiere sulla linea di porta (valore controllato dal gioco; default 50%)
- Offset orizzontale: se `side='right'` metti `right: -7px`; se `side='left'` metti `left: -7px` (sporge dal track verso il centro del campo)
- `width: 20px; height: 28px; border-radius: 6px`
- **Neutro:** `background: white; border: 1.5px solid #07200f; box-shadow: 0 2px 6px rgba(0,0,0,0.4)`
- **Defending:** `background: #e14747; border: 1.5px solid white; box-shadow: 0 0 12px rgba(225,71,71,0.6), 0 2px 4px rgba(0,0,0,0.4)`
- Transition: `background 200ms ease, border 200ms ease`
- **Grip lines interne:** 3 linee orizzontali `width: 8px; height: 1px` con `opacity: 0.5`, spacing 2px tra l'una e l'altra. Colore: `#07200f` se neutro, `white` se defending.

**Label "DEFEND":**
- Solo quando `defending === true`
- Posizione: `top: -22px` rispetto al container slider
- Pill: `padding: 2px 8px; background: #e14747; border-radius: 999px`
- Font: `IBM Plex Mono 8px 700 white; letter-spacing: 1.2px; text-transform: uppercase`
- Testo: `DEFEND` (in inglese — l'HUD mescola italiano e inglese come nel resto del design, es. "2D/3D", "34ms")

### 8. Opponent Turn Badge (solo stato opponent_turn)
**Posizione:** `top: 58px; left: 50%; transform: translateX(-50%)` (appena sotto lo score bar).

Pill glass:
- Background: `rgba(7,32,15,0.7)` + blur 12px
- Border: `1px solid rgba(240,160,32,0.4)` (warn 40%)
- Border-radius: `999px`
- Padding: `5px 12px`
- Font: `IBM Plex Mono 10px color: #f0a020 letter-spacing: 1.5px text-transform: uppercase`
- Gap: `8px`

Contenuto:
- Dot pulsante: `width: 6px; height: 6px; border-radius: 3px; background: #f0a020; animation: pulse 1.4s ease-in-out infinite`
- Testo: `Opponent playing`

---

## Animations & Transitions

### Keyframe: pulse
```css
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50%      { opacity: 0.55; transform: scale(0.9); }
}
```
Applicato al dot del banner (`your_turn`, `shot_incoming`) e al dot del badge opponent turn. Durata `1.4s ease-in-out infinite`.

### Keyframe: selected-piece-ring
Il cerchio highlight attorno alla pedina selezionata (nel `pitch-mockup.jsx` usa `<animate>` SVG, ma in produzione basta CSS):
```css
@keyframes pieceRing {
  0%, 100% { r: 16; }
  50%      { r: 20; }
}
```
1.8s ease-in-out infinite.

### Transizioni
- Keeper track/thumb: `all 200ms ease` (cambio neutro ↔ defending)
- Cambi di stato HUD (mount/unmount di banner, goal card, badge): **fade-in 150ms** + leggero **scale 0.95 → 1** per feel sport-tech. Non è nel mockup React (appaiono/scompaiono), ma in produzione va aggiunto.

---

## State Management

### Stato globale dell'HUD
Il game engine già mantiene uno stato — l'HUD deve leggerlo. Stati minimi:

```js
const hudState = {
  phase: 'your_turn' | 'flicking' | 'shot_incoming' | 'goal' | 'opponent_turn',
  score: { home: 2, away: 1 },
  half: 1 | 2,                        // 1T o 2T
  timeSeconds: 102,                    // formattato come M:SS
  homeTeam: { code: 'ITA', flag: 'ita', name: 'Italia' },
  awayTeam: { code: 'BRA', flag: 'bra', name: 'Brasile' },
  selectedPiece: { x, y },             // coords schermo della pedina selezionata
  flickCount: 0..3,                    // consecutive flicks usati dalla stessa pedina
  power: 0..1,                         // solo durante flicking
  keeperSide: 'left' | 'right',        // lato della TUA porta
  keeperY: 0..1,                       // posizione verticale del portiere (0 = top, 1 = bottom)
  goalEvent: { scorer: 'Marco', minute: 78 } | null,
  latencyMs: 34,                        // per opponent_turn display
};
```

### Transizioni state machine
```
your_turn ──tap piece──▶ (still your_turn, selected)
your_turn ──start drag──▶ flicking
flicking  ──release──▶ [if shot toward own goal] shot_incoming
                    ──▶ [if ball moved] opponent_turn
                    ──▶ [if score] goal ──3s──▶ your_turn/opponent_turn (kickoff)
opponent_turn ──server event──▶ your_turn / shot_incoming / goal
shot_incoming ──ball stops / goal──▶ goal / opponent_turn
```

Queste transizioni esistono già nel game engine esistente (vedi `client/game/*`). L'HUD deve solo **riflettere** lo stato, non gestirlo.

---

## Design Tokens

Tutti i valori sono in `ds/tokens.js`. Estratti qui per comodità:

### Colors
```css
/* Brand */
--pitch:        #1f6b3a;  /* primary green */
--pitch-light:  #2d9050;  /* hover/active */
--pitch-deep:   #0f3d20;  /* surface dark */
--pitch-ink:    #07200f;  /* deepest bg */
--cream:        #f2ede2;
--paper:        #ffffff;
--ink:          #0a1a10;

/* Surfaces on dark */
--surface-0:    #07200f;
--surface-1:    #0f3d20;
--surface-2:    #164e2a;
--surface-3:    #1f6b3a;
--line:         rgba(255,255,255,0.12);
--line-strong:  rgba(255,255,255,0.22);

/* Text on dark */
--text-hi:      #ffffff;
--text-md:      rgba(255,255,255,0.78);
--text-lo:      rgba(255,255,255,0.52);
--text-dim:     rgba(255,255,255,0.34);

/* Team */
--team-home:    #e04a3f;
--team-away:    #2e7fd4;

/* Semantic */
--success:      #27ae60;
--warn:         #f0a020;
--danger:       #e14747;
--info:         #2e7fd4;

/* Gameplay accent */
--highlight:    #ffd64a;  /* your-turn yellow */
--ball-white:   #ffffff;
```

### Typography
```css
--font-ui:      'Archivo', system-ui, -apple-system, sans-serif;
--font-display: 'DM Serif Display', Georgia, serif;  /* non usato nell'HUD finale, solo nel brand */
--font-mono:    'IBM Plex Mono', ui-monospace, monospace;
```
Carica via Google Fonts:
```html
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

Pesi usati: Archivo 400/600/700/800/900, IBM Plex Mono 500/600/700.

### Size scale (px)
`xxs: 10, xs: 11, sm: 12, md: 14, lg: 16, xl: 20, xxl: 28`

### Spacing (4pt scale, compact)
`0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 12, 6: 16, 7: 20, 8: 24, 9: 32, 10: 48`

### Radius
`xs: 4, sm: 6, md: 10, lg: 14, pill: 999`

### Shadow
```css
--shadow-sm:   0 1px 2px rgba(0,0,0,0.25);
--shadow-md:   0 2px 8px rgba(0,0,0,0.35);
--shadow-lg:   0 8px 24px rgba(0,0,0,0.45);
--shadow-glow: 0 0 0 2px rgba(255,214,74,0.5), 0 0 16px rgba(255,214,74,0.5);
```

### Easing
```css
--ease-fast: 120ms cubic-bezier(.2,.7,.3,1);
--ease-base: 220ms cubic-bezier(.2,.7,.3,1);
--ease-slow: 400ms cubic-bezier(.2,.7,.3,1);
```

---

## Internationalizzazione
L'HUD mescola **italiano** (copy principale: "Il tuo turno", "Turno avversario", "Trascina per direzionare", "GOL di Marco") e **inglese** (termini tecnici che sono diventati lingua franca nel gaming: "DEFEND", "GOAL", "2D/3D", "34ms"). Mantenere questa miscela — è intenzionale e coerente con il target Telegram italiano che consuma anche gaming internazionale.

Flag bandiere: per ora cablare ITA + BRA come demo. A regime servirà un sistema per generare flag SVG dinamicamente per tutte le nazionali/club.

---

## Assets

Nessun asset esterno. Tutti gli elementi visivi sono:
- **Font**: Google Fonts (Archivo, DM Serif Display, IBM Plex Mono)
- **Icone/flag**: SVG inline (vedi `FlagITA`, `FlagBRA` in `hud-b-balanced.jsx` e `LogoIcon`/`SubbitIcon` in `ds/icons.js`)
- **Logo Subbit**: file SVG in `assets/subbit-icon-green.svg` e `assets/subbit-icon-white.svg` (del brand package separato) — **non è usato nell'HUD in-game**, ma serve per eventuali loading splash / pre-match

---

## Integration notes

### Dove mettere il codice nel repo `subbit`
- **`client/index.html`** — estendere la struttura HTML con gli elementi HUD nuovi (togliere i vecchi `#score-display`, `#timer-display`, ecc. o ridefinirli)
- **`client/game/ui.js`** — qui vive già l'update loop dell'HUD; estenderlo per riflettere i nuovi stati e aggiornare classi/testi
- **Nuovo file `client/game/hud.css`** — tutto il CSS dell'HUD in un file dedicato (convertire gli inline style JSX del mockup in classi CSS)
- **Mantenere separato** il rendering del campo (Three.js) dall'HUD (DOM overlay). Non spostarli nello stesso layer.

### State → DOM binding
Evitare framework. Usare una funzione `renderHUD(state)` che riceve lo stato corrente e aggiorna gli elementi DOM via `textContent`, `classList.toggle`, `style.setProperty`. Esempio:

```js
export function renderHUD(state) {
  document.getElementById('hud-score-home').textContent = state.score.home;
  document.getElementById('hud-score-away').textContent = state.score.away;
  document.getElementById('hud-timer').textContent = formatTime(state.timeSeconds);
  document.body.dataset.hudPhase = state.phase;   // CSS usa [data-hud-phase="goal"] per mostrare goal card
  // ... etc
}
```

Gli stati visibili (banner, goal card, defend label) si nascondono/mostrano via attribute selector CSS — più veloce e più dichiarativo di toggleClass.

### Safe areas mobile
Telegram Mini App su iPhone/Android ha notch e gesture bar. Aggiungere `env(safe-area-inset-*)` al padding dei containers top/bottom. In landscape i safe area sono sui lati corti (sopra e sotto).

### Performance
- `backdrop-filter: blur()` è costoso su Android low-end. Fallback: controllare via `@supports (backdrop-filter: blur(16px))` e in caso negativo usare background più opaco (es. `rgba(7,32,15,0.92)`).
- Power ring SVG: ridisegnare a 60fps durante `flicking` è ok ma aggiornare solo `stroke-dasharray`, non ricreare il nodo. Idealmente usare `transform` + `stroke-dashoffset` per non forzare reflow.

---

## Cosa NON implementare ora
Questi sono fuori scope per questa iterazione (già discusso con l'utente):
- Lobby / home screen
- Selezione squadra
- Leaderboard
- Profilo utente
- Pre-match / matchmaking
- Post-match / rematch
- Onboarding tutorial
- Chat / emoji avversario
- Mini-mappa top-down
- Replay

Saranno trattati in handoff successivi. L'HUD in-game è il primo deliverable perché il gameplay è già giocabile.

---

## Checklist di completamento

- [ ] Score bar rende tutti i 7 elementi inline (flag, code, score, dash, score, code, flag, separator, half, timer)
- [ ] Segmented 2D/3D funzionante (toggle di stato + eventuale swap della camera Three.js esistente)
- [ ] 3-flick pills si posizionano dinamicamente sopra la pedina selezionata corrente e riflettono il contatore
- [ ] Power ring animato durante flicking, gradiente verde→giallo→rosso
- [ ] Bottom banner cambia testo + dot color in base allo stato; dot pulsa solo in your_turn e shot_incoming
- [ ] Goal card appare inset:0 centrata per 2-3 secondi dopo un gol poi fade-out
- [ ] Keeper slider sempre visibile dal lato corretto (letto dal game state al match start)
- [ ] Keeper passa a stato rosso + label DEFEND quando phase === shot_incoming
- [ ] Opponent turn badge in alto centro solo in opponent_turn, con latency live
- [ ] Fallback senza backdrop-filter su dispositivi non supportati
- [ ] Safe area insets rispettati su iOS/Android landscape
- [ ] Design tokens centralizzati in un file CSS custom properties (`--pitch`, `--highlight`, ecc.)