# Subbit Gameplay HUD — Design Handoff Bundle

This is a single-file bundle of the entire design handoff. Each file is delimited by
a `===== FILE: <path> =====` line followed by the file content, then `===== END FILE =====`.

Claude Code: to reconstruct the handoff folder, split this document on those markers
and write each block to its path under `design_handoff_gameplay_hud/`.

Files included (8):
- `README.md`
- `Gameplay HUD.html`
- `ds/components.jsx`
- `ds/gameplay-app.jsx`
- `ds/hud-b-balanced.jsx`
- `ds/icons.js`
- `ds/pitch-mockup.jsx`
- `ds/tokens.js`

---

===== FILE: README.md =====
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
===== END FILE =====

===== FILE: Gameplay HUD.html =====
<!DOCTYPE html>
<html lang="it">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Subbit — Gameplay HUD · 3 direzioni</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;800;900&family=DM+Serif+Display:ital@0;1&family=IBM+Plex+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    html, body { background: #07200f; }
    body { font-family: 'Archivo', system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
    button { font-family: inherit; }
    em { font-style: italic; }
    html { scroll-behavior: smooth; }
  </style>

  <script src="https://unpkg.com/react@18.3.1/umd/react.development.js" integrity="sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js" integrity="sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm" crossorigin="anonymous"></script>
  <script src="https://unpkg.com/@babel/standalone@7.29.0/babel.min.js" integrity="sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y" crossorigin="anonymous"></script>

  <script src="ds/tokens.js"></script>
  <script type="text/babel" src="ds/icons.js"></script>
  <script type="text/babel" src="ds/components.jsx"></script>
  <script type="text/babel" src="ds/pitch-mockup.jsx"></script>
  <script type="text/babel" src="ds/hud-b-balanced.jsx"></script>
  <script type="text/babel" src="ds/gameplay-app.jsx"></script>
</head>
<body>
  <div id="root"></div>
</body>
</html>
===== END FILE =====

===== FILE: ds/components.jsx =====
// Subbit Design System — Components (JSX)
// UI base + in-game HUD + meta-game. Mobile-first, compact.

const T = window.SUBBIT_TOKENS;

// Shortcut: inline style helpers
const c = T.color, sp = T.space, r = T.radius, s = T.shadow;

// ─── LOGO ICON (2D1 finale) ──────────────────────────────
function LogoIcon({ color = c.pitch, size = 24 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" style={{ display: 'block', flexShrink: 0 }}>
      <circle cx="60" cy="60" r="54" fill="none" stroke={color} strokeWidth="4" />
      <circle cx="60" cy="60" r="48" fill="none" stroke={color} strokeWidth="1.5" />
      <line x1="6" y1="60" x2="114" y2="60" stroke={color} strokeWidth="3" />
      <circle cx="60" cy="60" r="4" fill={color} />
      <path d="M 78 38 Q 78 26 60 26 Q 42 26 42 38 Q 42 50 60 50"
        fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
      <path d="M 60 70 Q 78 70 78 82 Q 78 94 60 94 Q 42 94 42 82"
        fill="none" stroke={color} strokeWidth="7" strokeLinecap="round" />
    </svg>
  );
}

// ─── BUTTON ──────────────────────────────────────────────
function Button({ children, variant = 'primary', size = 'md', icon, iconRight, disabled, full, onClick }) {
  const sizes = {
    sm: { h: 32, px: 12, fs: T.size.sm, gap: 6 },
    md: { h: 44, px: 16, fs: T.size.md, gap: 8 },
    lg: { h: 52, px: 20, fs: T.size.lg, gap: 10 },
  };
  const S = sizes[size];
  const variants = {
    primary:   { bg: c.pitch, fg: c.paper, border: 'transparent' },
    secondary: { bg: 'transparent', fg: c.paper, border: c.lineStrong },
    ghost:     { bg: 'transparent', fg: c.textMd, border: 'transparent' },
    danger:    { bg: c.danger, fg: c.paper, border: 'transparent' },
    highlight: { bg: c.highlight, fg: c.pitchInk, border: 'transparent' },
  };
  const V = variants[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      gap: S.gap, height: S.h, padding: `0 ${S.px}px`,
      background: V.bg, color: V.fg, border: `1px solid ${V.border}`,
      borderRadius: r.md, fontFamily: T.font.ui, fontSize: S.fs,
      fontWeight: T.weight.semibold, letterSpacing: 0.2,
      cursor: disabled ? 'not-allowed' : 'pointer',
      opacity: disabled ? 0.4 : 1, width: full ? '100%' : 'auto',
      transition: T.ease.fast, outline: 'none', userSelect: 'none',
    }}>
      {icon && <SubbitIcon name={icon} size={S.fs + 2} color={V.fg} />}
      {children}
      {iconRight && <SubbitIcon name={iconRight} size={S.fs + 2} color={V.fg} />}
    </button>
  );
}

// ─── CARD ────────────────────────────────────────────────
function Card({ children, padding = sp[6], elevated, style = {} }) {
  return (
    <div style={{
      background: c.surface1, border: `1px solid ${c.line}`,
      borderRadius: r.md, padding, color: c.textHi,
      boxShadow: elevated ? s.md : 'none',
      ...style,
    }}>{children}</div>
  );
}

// ─── BADGE ───────────────────────────────────────────────
function Badge({ children, tone = 'neutral', size = 'md' }) {
  const tones = {
    neutral: { bg: c.line, fg: c.textHi },
    pitch:   { bg: c.pitch, fg: c.paper },
    warn:    { bg: c.warn, fg: c.pitchInk },
    danger:  { bg: c.danger, fg: c.paper },
    success: { bg: c.success, fg: c.paper },
    highlight: { bg: c.highlight, fg: c.pitchInk },
  };
  const sizes = { sm: { h: 16, fs: 9, px: 6 }, md: { h: 20, fs: 10, px: 8 } };
  const S = sizes[size], V = tones[tone];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      height: S.h, padding: `0 ${S.px}px`,
      background: V.bg, color: V.fg, borderRadius: r.pill,
      fontFamily: T.font.mono, fontSize: S.fs, fontWeight: T.weight.semibold,
      letterSpacing: 1.2, textTransform: 'uppercase', lineHeight: 1,
    }}>{children}</span>
  );
}

// ─── AVATAR ──────────────────────────────────────────────
function Avatar({ initials = 'SU', color = c.pitch, size = 36, online }) {
  return (
    <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <div style={{
        width: size, height: size, borderRadius: r.circle,
        background: color, color: c.paper,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: T.font.ui, fontWeight: T.weight.bold,
        fontSize: size * 0.4, textTransform: 'uppercase', letterSpacing: 0.5,
      }}>{initials}</div>
      {online && (
        <div style={{
          position: 'absolute', bottom: 0, right: 0,
          width: size * 0.28, height: size * 0.28,
          background: c.success, borderRadius: r.circle,
          border: `2px solid ${c.surface0}`,
        }} />
      )}
    </div>
  );
}

// ─── INPUT ───────────────────────────────────────────────
function Input({ placeholder, value, icon, onChange, type = 'text' }) {
  return (
    <label style={{
      display: 'flex', alignItems: 'center', gap: sp[5],
      height: 44, padding: `0 ${sp[6]}px`,
      background: c.surface2, border: `1px solid ${c.line}`,
      borderRadius: r.md, color: c.textHi,
      fontFamily: T.font.ui, fontSize: T.size.md,
    }}>
      {icon && <SubbitIcon name={icon} size={16} color={c.textLo} />}
      <input type={type} value={value} placeholder={placeholder}
        onChange={e => onChange && onChange(e.target.value)}
        style={{
          flex: 1, background: 'transparent', border: 'none', outline: 'none',
          color: c.textHi, fontFamily: T.font.ui, fontSize: T.size.md,
        }}
      />
    </label>
  );
}

// ─── TAB BAR ─────────────────────────────────────────────
function TabBar({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex', gap: sp[2], padding: sp[2],
      background: c.surface1, borderRadius: r.md,
      border: `1px solid ${c.line}`,
    }}>
      {tabs.map(t => {
        const on = active === t.id;
        return (
          <button key={t.id} onClick={() => onChange && onChange(t.id)}
            style={{
              flex: 1, height: 34, padding: `0 ${sp[5]}px`,
              background: on ? c.pitch : 'transparent',
              border: 'none', borderRadius: r.sm,
              color: on ? c.paper : c.textMd,
              fontFamily: T.font.ui, fontSize: T.size.sm, fontWeight: T.weight.semibold,
              cursor: 'pointer', transition: T.ease.fast,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}>
            {t.icon && <SubbitIcon name={t.icon} size={14} color={on ? c.paper : c.textMd} />}
            {t.label}
          </button>
        );
      })}
    </div>
  );
}

// ─── TOGGLE ──────────────────────────────────────────────
function Toggle({ on, onChange }) {
  return (
    <button onClick={() => onChange && onChange(!on)} style={{
      width: 42, height: 24, padding: 2, border: 'none',
      background: on ? c.pitch : c.surface3, borderRadius: r.pill,
      display: 'flex', alignItems: 'center', cursor: 'pointer',
      transition: T.ease.base,
    }}>
      <div style={{
        width: 20, height: 20, background: c.paper, borderRadius: r.circle,
        transform: on ? 'translateX(18px)' : 'translateX(0)',
        transition: T.ease.fast, boxShadow: s.sm,
      }} />
    </button>
  );
}

// ─── LIST ROW ────────────────────────────────────────────
function ListRow({ icon, title, sub, right, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: sp[6],
      width: '100%', height: 52, padding: `0 ${sp[6]}px`,
      background: 'transparent', border: 'none',
      borderBottom: `1px solid ${c.line}`,
      color: c.textHi, cursor: onClick ? 'pointer' : 'default',
      textAlign: 'left', fontFamily: T.font.ui,
    }}>
      {icon && <SubbitIcon name={icon} size={18} color={c.textMd} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: T.size.md, fontWeight: T.weight.semibold, lineHeight: 1.2 }}>{title}</div>
        {sub && <div style={{ fontSize: T.size.xs, color: c.textLo, marginTop: 2 }}>{sub}</div>}
      </div>
      {right}
    </button>
  );
}

// ─── TOAST ───────────────────────────────────────────────
function Toast({ icon = 'info', tone = 'info', children }) {
  const tones = { info: c.info, success: c.success, danger: c.danger, warn: c.warn };
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: sp[5],
      padding: `${sp[5]}px ${sp[6]}px`,
      background: c.surface1, border: `1px solid ${c.line}`,
      borderLeft: `3px solid ${tones[tone]}`,
      borderRadius: r.md, boxShadow: s.md,
      color: c.textHi, fontFamily: T.font.ui, fontSize: T.size.sm,
    }}>
      <SubbitIcon name={icon} size={16} color={tones[tone]} />
      {children}
    </div>
  );
}

// ─── MODAL ───────────────────────────────────────────────
function Modal({ title, children, actions }) {
  return (
    <div style={{
      width: 340, maxWidth: '90vw',
      background: c.surface1, border: `1px solid ${c.line}`,
      borderRadius: r.lg, boxShadow: s.lg,
      color: c.textHi, overflow: 'hidden',
    }}>
      <div style={{
        padding: `${sp[7]}px ${sp[7]}px ${sp[5]}px`,
        fontFamily: T.font.display, fontSize: T.size.xl,
        color: c.textHi, letterSpacing: -0.5,
      }}>{title}</div>
      <div style={{ padding: `0 ${sp[7]}px ${sp[7]}px`, fontFamily: T.font.ui, fontSize: T.size.sm, color: c.textMd, lineHeight: 1.5 }}>
        {children}
      </div>
      {actions && (
        <div style={{
          display: 'flex', gap: sp[5], padding: sp[6],
          background: c.surface0, borderTop: `1px solid ${c.line}`,
        }}>{actions}</div>
      )}
    </div>
  );
}

// ─── TEAM CREST (placeholder generico) ──────────────────
function TeamCrest({ color = c.teamHome, label = 'HOME', size = 40 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: r.circle,
      background: color, color: c.paper,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: T.font.ui, fontWeight: T.weight.black,
      fontSize: size * 0.28, letterSpacing: 1,
      border: `2px solid ${c.paper}`, flexShrink: 0,
    }}>{label.slice(0, 3)}</div>
  );
}

// ─── SCORE HUD (in-game) ─────────────────────────────────
function ScoreHUD({ home = 0, away = 0, homeLabel = 'HOME', awayLabel = 'AWAY', homeColor = c.teamHome, awayColor = c.teamAway }) {
  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: sp[5],
      padding: `${sp[4]}px ${sp[6]}px`,
      background: 'rgba(7, 32, 15, 0.85)', backdropFilter: 'blur(8px)',
      border: `1px solid ${c.line}`, borderRadius: r.md,
      fontFamily: T.font.ui, color: c.textHi,
    }}>
      <TeamCrest color={homeColor} label={homeLabel} size={22} />
      <span style={{ fontFamily: T.font.mono, fontSize: T.size.xxs, color: c.textLo, letterSpacing: 1.2 }}>{homeLabel}</span>
      <span style={{ fontSize: T.size.xl, fontWeight: T.weight.black, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.5 }}>
        {home}<span style={{ color: c.textDim, margin: '0 6px' }}>–</span>{away}
      </span>
      <span style={{ fontFamily: T.font.mono, fontSize: T.size.xxs, color: c.textLo, letterSpacing: 1.2 }}>{awayLabel}</span>
      <TeamCrest color={awayColor} label={awayLabel} size={22} />
    </div>
  );
}

// ─── TIMER HUD ───────────────────────────────────────────
function TimerHUD({ seconds = 120, half = 1 }) {
  const m = Math.floor(seconds / 60), s = Math.floor(seconds % 60);
  const low = seconds < 30;
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center',
      padding: `${sp[4]}px ${sp[6]}px`,
      background: 'rgba(7, 32, 15, 0.85)', backdropFilter: 'blur(8px)',
      border: `1px solid ${c.line}`, borderRadius: r.md,
      minWidth: 76,
    }}>
      <div style={{
        fontFamily: T.font.mono, fontSize: 9, letterSpacing: 2,
        color: c.textLo, textTransform: 'uppercase',
      }}>{half === 1 ? '1° tempo' : '2° tempo'}</div>
      <div style={{
        fontFamily: T.font.mono, fontSize: T.size.lg, fontWeight: T.weight.bold,
        color: low ? c.danger : c.textHi, fontVariantNumeric: 'tabular-nums',
        lineHeight: 1.1,
      }}>{m}:{String(s).padStart(2, '0')}</div>
    </div>
  );
}

// ─── TURN INDICATOR ──────────────────────────────────────
function TurnIndicator({ text = 'Il tuo turno — seleziona una pedina', hint, highlight = true }) {
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 2,
    }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: sp[4],
        padding: `${sp[4]}px ${sp[6]}px`,
        background: highlight ? c.highlight : 'rgba(7, 32, 15, 0.85)',
        border: `1px solid ${highlight ? 'rgba(0,0,0,0.15)' : c.line}`,
        borderRadius: r.pill,
        color: highlight ? c.pitchInk : c.textHi,
        fontFamily: T.font.ui, fontSize: T.size.sm, fontWeight: T.weight.semibold,
        boxShadow: highlight ? s.glow : s.sm,
      }}>
        {highlight && <SubbitIcon name="ball" size={14} color={c.pitchInk} />}
        {text}
      </div>
      {hint && <div style={{
        fontFamily: T.font.mono, fontSize: T.size.xs, color: c.textLo,
        letterSpacing: 1, textTransform: 'uppercase',
      }}>{hint}</div>}
    </div>
  );
}

// ─── KEEPER SLIDER ───────────────────────────────────────
function KeeperSlider({ value = 50 }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: sp[4] }}>
      <div style={{
        padding: `${sp[3]}px ${sp[5]}px`, background: c.danger, color: c.paper,
        borderRadius: r.pill, fontFamily: T.font.ui, fontSize: T.size.xs,
        fontWeight: T.weight.bold, letterSpacing: 1, textTransform: 'uppercase',
        display: 'flex', alignItems: 'center', gap: 4,
      }}>
        <SubbitIcon name="target" size={12} color={c.paper} />DIFENDI!
      </div>
      <div style={{
        width: 44, height: 180, padding: 4,
        background: 'rgba(7, 32, 15, 0.6)', border: `1px solid ${c.line}`,
        borderRadius: r.pill, position: 'relative',
      }}>
        <div style={{
          position: 'absolute', left: '50%', top: `${value}%`,
          transform: 'translate(-50%, -50%)',
          width: 36, height: 36, borderRadius: r.circle,
          background: c.danger, border: `3px solid ${c.paper}`, boxShadow: s.md,
        }} />
      </div>
    </div>
  );
}

// ─── RESULT OVERLAY (GOL! / PARATA / FALLO) ──────────────
function ResultOverlay({ text = 'GOL!', tone = 'success' }) {
  const colors = { success: c.highlight, info: c.paper, danger: c.danger };
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: sp[3],
      padding: `${sp[8]}px ${sp[10]}px`,
      background: 'rgba(7, 32, 15, 0.75)', backdropFilter: 'blur(12px)',
      border: `1px solid ${c.line}`, borderRadius: r.lg,
    }}>
      <div style={{
        fontFamily: T.font.display, fontSize: 64, lineHeight: 0.9,
        color: colors[tone], letterSpacing: -2,
        textShadow: tone === 'success' ? '0 0 30px rgba(255,214,74,0.6)' : 'none',
      }}>{text}</div>
    </div>
  );
}

// ─── MATCH TILE (lobby) ──────────────────────────────────
function MatchTile({ homeLabel = 'HOME', awayLabel = 'AWAY', homeColor = c.teamHome, awayColor = c.teamAway, status = 'live', score = '1 – 0', time = "34'" }) {
  const statuses = {
    live: { label: 'LIVE', tone: 'danger' },
    waiting: { label: 'IN ATTESA', tone: 'warn' },
    done: { label: 'TERMINATA', tone: 'neutral' },
  };
  const st = statuses[status];
  return (
    <Card padding={sp[6]} style={{ minWidth: 260 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: sp[5] }}>
        <Badge tone={st.tone}>{st.label}</Badge>
        <span style={{ fontFamily: T.font.mono, fontSize: T.size.xs, color: c.textLo, letterSpacing: 1 }}>{time}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: sp[5] }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <TeamCrest color={homeColor} label={homeLabel} size={34} />
          <span style={{ fontFamily: T.font.ui, fontSize: T.size.xs, color: c.textMd, fontWeight: T.weight.semibold }}>{homeLabel}</span>
        </div>
        <div style={{
          fontFamily: T.font.mono, fontSize: T.size.xl, fontWeight: T.weight.bold,
          color: c.textHi, fontVariantNumeric: 'tabular-nums',
        }}>{score}</div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <TeamCrest color={awayColor} label={awayLabel} size={34} />
          <span style={{ fontFamily: T.font.ui, fontSize: T.size.xs, color: c.textMd, fontWeight: T.weight.semibold }}>{awayLabel}</span>
        </div>
      </div>
    </Card>
  );
}

// ─── LEADERBOARD ROW ─────────────────────────────────────
function LeaderboardRow({ rank = 1, name = 'Player', initials = 'PL', color = c.pitch, points = 1850, delta = '+12', me }) {
  const medal = rank <= 3 ? [c.highlight, '#c9c9c9', '#c47840'][rank - 1] : null;
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: sp[5],
      padding: `${sp[4]}px ${sp[6]}px`, background: me ? 'rgba(255,214,74,0.08)' : 'transparent',
      borderLeft: me ? `3px solid ${c.highlight}` : '3px solid transparent',
      borderBottom: `1px solid ${c.line}`,
    }}>
      <span style={{
        width: 28, textAlign: 'center',
        fontFamily: T.font.mono, fontSize: T.size.md, fontWeight: T.weight.bold,
        color: medal || c.textMd,
      }}>{rank}</span>
      <Avatar initials={initials} color={color} size={28} />
      <span style={{ flex: 1, fontFamily: T.font.ui, fontSize: T.size.sm, fontWeight: T.weight.semibold, color: c.textHi }}>{name}</span>
      <span style={{
        fontFamily: T.font.mono, fontSize: T.size.sm, fontWeight: T.weight.bold,
        color: c.textHi, fontVariantNumeric: 'tabular-nums',
      }}>{points.toLocaleString()}</span>
      <span style={{ fontFamily: T.font.mono, fontSize: T.size.xs, color: delta.startsWith('+') ? c.success : c.danger, width: 32, textAlign: 'right' }}>{delta}</span>
    </div>
  );
}

Object.assign(window, {
  LogoIcon, Button, Card, Badge, Avatar, Input, TabBar, Toggle, ListRow, Toast, Modal,
  TeamCrest, ScoreHUD, TimerHUD, TurnIndicator, KeeperSlider, ResultOverlay,
  MatchTile, LeaderboardRow,
});
===== END FILE =====

===== FILE: ds/gameplay-app.jsx =====
// Gameplay HUD — final Variant B only (stripped from the 3-variant exploration)

const G_T = window.SUBBIT_TOKENS;
const Gc = G_T.color;
const { useState } = React;

const STATES = [
  { id: 'your_turn',     label: 'Il tuo turno' },
  { id: 'flicking',      label: 'Flick in carica' },
  { id: 'shot_incoming', label: 'Tiro in porta' },
  { id: 'goal',          label: 'GOAL' },
  { id: 'opponent_turn', label: 'Turno avversario' },
];

function App() {
  const [state, setState] = useState('your_turn');
  const [flickCount, setFlickCount] = useState(1);
  const [power, setPower] = useState(0.65);
  const [keeperSide, setKeeperSide] = useState('right');

  return (
    <div style={{ background: Gc.surface0, minHeight: '100vh' }}>
      {/* Header */}
      <header style={{
        padding: '80px 32px 48px',
        background: `linear-gradient(180deg, ${Gc.pitchDeep} 0%, ${Gc.surface0} 100%)`,
        borderBottom: `1px solid ${Gc.line}`,
      }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 32 }}>
            <LogoIcon color={Gc.pitchLight} size={28} />
            <span style={{ fontFamily: G_T.font.mono, fontSize: 11, color: Gc.textLo, letterSpacing: 2, textTransform: 'uppercase' }}>Subbit · Gameplay HUD · Variante finale</span>
          </div>
          <h1 style={{
            fontFamily: G_T.font.display, fontSize: 56, lineHeight: 1,
            color: Gc.textHi, margin: 0, letterSpacing: -1.8, fontWeight: 400, maxWidth: 800,
          }}>
            Sport-tech <em style={{ color: Gc.highlight, fontStyle: 'italic' }}>bilanciato</em>.
          </h1>
          <p style={{ fontFamily: G_T.font.ui, fontSize: 16, color: Gc.textMd, margin: '20px 0 0', maxWidth: 640, lineHeight: 1.5 }}>
            Glassmorphism con blur controllato. Punteggio e timer su una riga sola in alto. Banner scuro in basso con dot colorato pulsante come unico accento. Keeper slider sempre visibile dal lato della tua porta. Anello di potenza verde→giallo→rosso attorno alla pedina.
          </p>
        </div>
      </header>

      {/* Scrubber section */}
      <section style={{ padding: '48px 32px' }}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>

          {/* State scrubber */}
          <div style={{
            display: 'flex', gap: 4, padding: 4, marginBottom: 8,
            background: Gc.surface1, borderRadius: 10, border: `1px solid ${Gc.line}`,
            overflowX: 'auto',
          }}>
            {STATES.map(s => (
              <button key={s.id} onClick={() => setState(s.id)}
                style={{
                  padding: '8px 14px', border: 'none',
                  background: state === s.id ? Gc.pitch : 'transparent',
                  color: state === s.id ? '#fff' : Gc.textMd,
                  fontFamily: G_T.font.ui, fontSize: 12, fontWeight: 600,
                  borderRadius: 6, cursor: 'pointer', whiteSpace: 'nowrap',
                }}>{s.label}</button>
            ))}
          </div>

          {/* Extra controls when relevant */}
          {(state === 'your_turn' || state === 'flicking') && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 20, padding: 12, marginBottom: 8,
              background: Gc.surface1, borderRadius: 10, border: `1px solid ${Gc.line}`,
              fontFamily: G_T.font.mono, fontSize: 11, color: Gc.textMd, letterSpacing: 1, textTransform: 'uppercase',
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                Flick #
                <input type="range" min="1" max="3" value={flickCount} onChange={e => setFlickCount(+e.target.value)} style={{ accentColor: Gc.pitch }}/>
                <span style={{ color: '#fff', minWidth: 12 }}>{flickCount}</span>
              </label>
              {state === 'flicking' && (
                <label style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1 }}>
                  Potenza
                  <input type="range" min="0" max="100" value={Math.round(power*100)} onChange={e => setPower(+e.target.value/100)} style={{ accentColor: Gc.highlight, flex: 1, maxWidth: 240 }}/>
                  <span style={{ color: '#fff', minWidth: 36 }}>{Math.round(power*100)}%</span>
                </label>
              )}
            </div>
          )}

          {/* Keeper side */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: 12, marginBottom: 8,
            background: Gc.surface1, borderRadius: 10, border: `1px solid ${Gc.line}`,
            fontFamily: G_T.font.mono, fontSize: 11, color: Gc.textMd, letterSpacing: 1, textTransform: 'uppercase',
          }}>
            <span>La tua porta</span>
            <div style={{ display: 'flex', gap: 2, padding: 2, background: Gc.surface0, borderRadius: 6 }}>
              {['left', 'right'].map(s => (
                <button key={s} onClick={() => setKeeperSide(s)} style={{
                  padding: '4px 10px', border: 'none', borderRadius: 4,
                  background: keeperSide === s ? Gc.pitch : 'transparent',
                  color: keeperSide === s ? '#fff' : Gc.textMd,
                  fontFamily: G_T.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1,
                  textTransform: 'uppercase', cursor: 'pointer',
                }}>{s === 'left' ? '← sinistra' : 'destra →'}</button>
              ))}
            </div>
          </div>

          {/* Pitch + HUD */}
          <div style={{ display: 'flex', justifyContent: 'center', padding: 32 }}>
            <PitchMockup state={state} flickCount={flickCount} power={power}>
              <HudBalanced state={state} flickCount={flickCount} power={power} keeperSide={keeperSide}/>
            </PitchMockup>
          </div>
        </div>
      </section>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
===== END FILE =====

===== FILE: ds/hud-b-balanced.jsx =====
// HUD Variant B — BALANCED / SPORT-TECH MODERN (v2 refined)
// Changes from v1:
//  1. Score in ONE line, top-left: flag · ITA · 2 – 1 · BRA · flag · 2T 1:42
//  3. Bottom pill turn indicator: glass dark + subtle yellow accent (no full yellow bg)
//  4. Goal kept as-is but label is "GOAL" not "GOL!"
//  7. Keeper slider always visible on YOUR goal side (side prop)

const B_T = window.SUBBIT_TOKENS;
const Bc = B_T.color;

// tiny SVG flags (simplified tricolor / canarinho)
function FlagITA({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" style={{ borderRadius: size/2, overflow: 'hidden', display: 'block' }}>
      <rect width="6" height="18" fill="#009246"/>
      <rect x="6" width="6" height="18" fill="#ffffff"/>
      <rect x="12" width="6" height="18" fill="#ce2b37"/>
      <circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1"/>
    </svg>
  );
}
function FlagBRA({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 18 18" style={{ borderRadius: size/2, overflow: 'hidden', display: 'block' }}>
      <rect width="18" height="18" fill="#009c3b"/>
      <polygon points="9,3 16,9 9,15 2,9" fill="#ffdf00"/>
      <circle cx="9" cy="9" r="2.6" fill="#002776"/>
      <circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth="1"/>
    </svg>
  );
}

window.HudBalanced = function HudBalanced({
  state = 'your_turn',
  flickCount = 1,
  power = 0.65,
  keeperSide = 'right',   // 'left' | 'right' — where YOUR goal is
}) {
  const isDefending = state === 'shot_incoming';

  return (
    <>
      {/* ═══ TOP — single-line score bar ═══ */}
      <div style={{
        position: 'absolute', top: 10, left: 10,
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '7px 12px',
        background: 'rgba(7,32,15,0.7)', backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999,
        boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
        fontFamily: B_T.font.ui, color: '#fff',
      }}>
        <FlagITA />
        <span style={{ fontFamily: B_T.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#fff' }}>ITA</span>
        <span style={{ fontFamily: B_T.font.ui, fontSize: 18, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3, color: '#fff', lineHeight: 1 }}>2</span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', margin: '0 -2px' }}>–</span>
        <span style={{ fontFamily: B_T.font.ui, fontSize: 18, fontWeight: 800, fontVariantNumeric: 'tabular-nums', letterSpacing: -0.3, color: '#fff', lineHeight: 1 }}>1</span>
        <span style={{ fontFamily: B_T.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1, color: '#fff' }}>BRA</span>
        <FlagBRA />
        {/* separator */}
        <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.18)', margin: '0 2px' }}/>
        <span style={{ fontFamily: B_T.font.mono, fontSize: 10, fontWeight: 600, letterSpacing: 1, color: 'rgba(255,255,255,0.55)' }}>2T</span>
        <span style={{ fontFamily: B_T.font.mono, fontSize: 12, fontWeight: 700, fontVariantNumeric: 'tabular-nums', color: '#fff' }}>1:42</span>
      </div>

      {/* ═══ TOP-RIGHT — 2D/3D segmented ═══ */}
      <div style={{
        position: 'absolute', top: 10, right: 10,
        display: 'flex', padding: 3,
        background: 'rgba(7,32,15,0.7)', backdropFilter: 'blur(16px)',
        border: '1px solid rgba(255,255,255,0.15)', borderRadius: 999,
      }}>
        {['2D', '3D'].map((m) => (
          <button key={m} style={{
            padding: '4px 10px', border: 'none', borderRadius: 999,
            background: m === '3D' ? '#fff' : 'transparent',
            color: m === '3D' ? Bc.pitchInk : 'rgba(255,255,255,0.7)',
            fontFamily: B_T.font.mono, fontSize: 10, fontWeight: 700, letterSpacing: 1,
            cursor: 'pointer',
          }}>{m}</button>
        ))}
      </div>

      {/* ═══ 3-FLICK PILLS above selected ═══ */}
      {(state === 'your_turn' || state === 'flicking') && (
        <div style={{
          position: 'absolute', left: 280 - 22, top: 220 - 38,
          display: 'flex', gap: 4,
        }}>
          {[0,1,2].map(i => (
            <div key={i} style={{
              width: 12, height: 5, borderRadius: 3,
              background: i < flickCount ? Bc.highlight : 'rgba(255,255,255,0.25)',
              boxShadow: i < flickCount ? '0 0 8px rgba(255,214,74,0.7)' : 'none',
            }}/>
          ))}
        </div>
      )}

      {/* ═══ Power ring when flicking ═══ */}
      {state === 'flicking' && (
        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} width="720" height="360">
          <defs>
            <linearGradient id="pwrGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={Bc.success} />
              <stop offset="50%" stopColor={Bc.highlight} />
              <stop offset="100%" stopColor={Bc.danger} />
            </linearGradient>
          </defs>
          <circle cx="280" cy="220" r="24" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="3"/>
          <circle cx="280" cy="220" r="24" fill="none" stroke="url(#pwrGrad)" strokeWidth="3"
            strokeDasharray={`${2*Math.PI*24*power} ${2*Math.PI*24}`} transform="rotate(-90 280 220)" strokeLinecap="round"/>
        </svg>
      )}

      {/* ═══ BOTTOM banner — dark glass + yellow accent ═══ */}
      <BottomBanner state={state} power={power} />

      {/* ═══ GOAL — cinematic card (label "GOAL") ═══ */}
      {state === 'goal' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'radial-gradient(circle at 70% 50%, rgba(255,214,74,0.3), transparent 60%)',
          pointerEvents: 'none',
        }}>
          <div style={{
            padding: '20px 48px',
            background: 'rgba(7,32,15,0.55)', backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,214,74,0.4)', borderRadius: 20,
            boxShadow: '0 0 60px rgba(255,214,74,0.4)',
            textAlign: 'center',
          }}>
            <div style={{ fontFamily: B_T.font.mono, fontSize: 10, color: Bc.highlight, letterSpacing: 3, textTransform: 'uppercase' }}>78' · 2° TEMPO</div>
            <div style={{ fontFamily: B_T.font.ui, fontSize: 56, fontWeight: 900, color: '#fff', letterSpacing: -2, lineHeight: 1, marginTop: 4 }}>GOAL</div>
            <div style={{ fontFamily: B_T.font.ui, fontSize: 12, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>Italia <span style={{ color: Bc.highlight, fontWeight: 700 }}>2</span> – 1 Brasile</div>
          </div>
        </div>
      )}

      {/* ═══ KEEPER SLIDER — always visible on YOUR goal side ═══ */}
      <KeeperSlider side={keeperSide} defending={isDefending} />

      {/* ═══ OPPONENT TURN — subtle corner label ═══ */}
      {state === 'opponent_turn' && (
        <div style={{
          position: 'absolute', top: 58, left: '50%', transform: 'translateX(-50%)',
          display: 'flex', alignItems: 'center', gap: 8, padding: '5px 12px',
          background: 'rgba(7,32,15,0.7)', backdropFilter: 'blur(12px)',
          border: '1px solid rgba(240,160,32,0.4)', borderRadius: 999,
          fontFamily: B_T.font.mono, fontSize: 10, color: Bc.warn, letterSpacing: 1.5, textTransform: 'uppercase',
        }}>
          <div style={{ width: 6, height: 6, borderRadius: 3, background: Bc.warn,
            animation: 'pulse 1.4s ease-in-out infinite' }}/>
          Opponent playing
        </div>
      )}
    </>
  );
};

// ─── Bottom banner: dark glass, yellow accent only ───
function BottomBanner({ state, power }) {
  const accent = (() => {
    if (state === 'your_turn') return Bc.highlight;
    if (state === 'flicking') return Bc.highlight;
    if (state === 'shot_incoming') return Bc.danger;
    if (state === 'opponent_turn') return Bc.warn;
    if (state === 'goal') return Bc.highlight;
    return Bc.highlight;
  })();

  return (
    <div style={{
      position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)',
      display: 'flex', alignItems: 'center', gap: 10,
      padding: '7px 14px 7px 10px',
      background: 'rgba(7,32,15,0.78)',
      backdropFilter: 'blur(14px)', WebkitBackdropFilter: 'blur(14px)',
      border: '1px solid rgba(255,255,255,0.12)',
      borderRadius: 999,
      boxShadow: '0 4px 16px rgba(0,0,0,0.4)',
      fontFamily: B_T.font.ui, fontSize: 12, fontWeight: 600,
      color: '#fff',
    }}>
      {/* left dot — the only pop of accent */}
      <span style={{
        display: 'inline-block', width: 8, height: 8, borderRadius: 4,
        background: accent,
        boxShadow: `0 0 10px ${accent}`,
        animation: state === 'your_turn' || state === 'shot_incoming' ? 'pulse 1.4s ease-in-out infinite' : 'none',
      }}/>
      {state === 'your_turn' && <span>Il tuo turno — <span style={{ color: accent, fontWeight: 700 }}>tocca una pedina</span></span>}
      {state === 'flicking' && <>
        <span>Trascina per direzionare</span>
        <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.2)' }}/>
        <span style={{ fontFamily: B_T.font.mono, fontVariantNumeric: 'tabular-nums', color: accent, fontWeight: 700 }}>{Math.round(power*100)}%</span>
      </>}
      {state === 'shot_incoming' && <span style={{ color: accent, fontWeight: 700 }}>Tiro in porta — DIFENDI</span>}
      {state === 'opponent_turn' && <>
        <span style={{ color: 'rgba(255,255,255,0.82)' }}>Turno avversario</span>
        <span style={{ width: 1, height: 12, background: 'rgba(255,255,255,0.15)' }}/>
        <span style={{ fontFamily: B_T.font.mono, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>34ms</span>
      </>}
      {state === 'goal' && <span>GOL di <span style={{ color: accent, fontWeight: 700 }}>Marco</span> · 78'</span>}
    </div>
  );
}

// ─── Keeper slider — always visible on YOUR goal side ───
function KeeperSlider({ side, defending }) {
  const isRight = side === 'right';
  // Pitch area in mock is roughly y 30→330. Keeper slider spans goal mouth area.
  const thumbY = 50; // %
  return (
    <div style={{
      position: 'absolute',
      [isRight ? 'right' : 'left']: 6,
      top: 96, bottom: 96,
      width: 22,
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
      pointerEvents: 'none',
    }}>
      {/* Track */}
      <div style={{
        flex: 1, width: 6, position: 'relative',
        background: defending ? 'rgba(225,71,71,0.2)' : 'rgba(255,255,255,0.12)',
        border: defending ? '1px solid rgba(225,71,71,0.5)' : '1px solid rgba(255,255,255,0.15)',
        borderRadius: 3,
        transition: 'all 200ms ease',
      }}>
        {/* Thumb */}
        <div style={{
          position: 'absolute',
          [isRight ? 'right' : 'left']: -7,
          top: `${thumbY}%`, transform: 'translateY(-50%)',
          width: 20, height: 28, borderRadius: 6,
          background: defending ? Bc.danger : '#fff',
          border: defending ? '1.5px solid #fff' : `1.5px solid ${Bc.pitchInk}`,
          boxShadow: defending
            ? '0 0 12px rgba(225,71,71,0.6), 0 2px 4px rgba(0,0,0,0.4)'
            : '0 2px 6px rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 200ms ease, border 200ms ease',
        }}>
          {/* grip lines */}
          <div style={{ width: 8, height: 1, background: defending ? '#fff' : Bc.pitchInk, opacity: 0.5, marginBottom: 2 }}/>
          <div style={{
            position: 'absolute', width: 8, height: 1,
            background: defending ? '#fff' : Bc.pitchInk, opacity: 0.5,
          }}/>
          <div style={{ width: 8, height: 1, background: defending ? '#fff' : Bc.pitchInk, opacity: 0.5, marginTop: 2 }}/>
        </div>
      </div>
      {/* Label (only when defending, to avoid noise) */}
      {defending && (
        <div style={{
          position: 'absolute', top: -22,
          padding: '2px 8px', background: Bc.danger, borderRadius: 999,
          fontFamily: B_T.font.mono, fontSize: 8, fontWeight: 700,
          color: '#fff', letterSpacing: 1.2, textTransform: 'uppercase',
          whiteSpace: 'nowrap',
        }}>DEFEND</div>
      )}
    </div>
  );
}
===== END FILE =====

===== FILE: ds/icons.js =====
// Subbit Design System — Icon set
// Stroke-based, 24×24 viewBox, currentColor. Coerente col logo.

window.SubbitIcon = function SubbitIcon({ name, size = 20, color = 'currentColor', strokeWidth = 2 }) {
  const P = { fill: 'none', stroke: color, strokeWidth, strokeLinecap: 'round', strokeLinejoin: 'round' };
  const ICONS = {
    back:    <><path d="M15 5l-7 7 7 7" {...P}/></>,
    close:   <><path d="M6 6l12 12M18 6L6 18" {...P}/></>,
    menu:    <><path d="M4 7h16M4 12h16M4 17h16" {...P}/></>,
    more:    <><circle cx="5" cy="12" r="1.2" fill={color}/><circle cx="12" cy="12" r="1.2" fill={color}/><circle cx="19" cy="12" r="1.2" fill={color}/></>,
    settings:<><circle cx="12" cy="12" r="3" {...P}/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.5-2.4.7a7 7 0 0 0-2-1.2L14 3h-4l-.5 2.3a7 7 0 0 0-2 1.2L5.1 5.8l-2 3.5 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.5 2.4-.7a7 7 0 0 0 2 1.2L10 21h4l.5-2.3a7 7 0 0 0 2-1.2l2.4.7 2-3.5-2-1.5c.1-.4.1-.8.1-1.2z" {...P}/></>,
    user:    <><circle cx="12" cy="8" r="4" {...P}/><path d="M4 20c1.5-4 5-6 8-6s6.5 2 8 6" {...P}/></>,
    users:   <><circle cx="9" cy="8" r="3.5" {...P}/><path d="M3 20c1-3.5 3.5-5 6-5s5 1.5 6 5" {...P}/><path d="M16 4a3.5 3.5 0 0 1 0 7" {...P}/><path d="M17 14c2 .5 3.5 2 4 6" {...P}/></>,
    trophy:  <><path d="M8 4h8v5a4 4 0 0 1-8 0V4z" {...P}/><path d="M5 5h3M19 5h-3" {...P}/><path d="M10 15v3h4v-3M8 20h8" {...P}/></>,
    ball:    <><circle cx="12" cy="12" r="8" {...P}/><path d="M12 4l2 4-2 3-2-3zM4 12l3-1 2 3-1 3zM20 12l-3-1-2 3 1 3zM12 20l-2-3h4z" {...P}/></>,
    whistle: <><path d="M3 11c0-2 2-4 5-4h8a3 3 0 0 1 3 3v1a3 3 0 0 1-3 3h-1l-3 4a3 3 0 1 1-4-4l-1-1H8c-3 0-5-2-5-2z" {...P}/></>,
    play:    <><path d="M7 5l12 7-12 7z" fill={color} {...P}/></>,
    pause:   <><rect x="7" y="5" width="3.5" height="14" fill={color} {...P}/><rect x="13.5" y="5" width="3.5" height="14" fill={color} {...P}/></>,
    timer:   <><circle cx="12" cy="13" r="7" {...P}/><path d="M12 13V9M9 3h6M10 6l-2-2M14 6l2-2" {...P}/></>,
    target:  <><circle cx="12" cy="12" r="8" {...P}/><circle cx="12" cy="12" r="4" {...P}/><circle cx="12" cy="12" r="1" fill={color}/></>,
    check:   <><path d="M5 12l5 5L20 7" {...P}/></>,
    star:    <><path d="M12 3l2.6 6 6.4.5-4.9 4.2 1.6 6.3L12 16.7 6.3 20l1.6-6.3L3 9.5 9.4 9z" {...P}/></>,
    search:  <><circle cx="11" cy="11" r="6" {...P}/><path d="M20 20l-4-4" {...P}/></>,
    bell:    <><path d="M6 17c0-5 1-8 6-8s6 3 6 8H6zM10 20a2 2 0 1 0 4 0" {...P}/></>,
    share:   <><circle cx="6" cy="12" r="2.5" {...P}/><circle cx="18" cy="5" r="2.5" {...P}/><circle cx="18" cy="19" r="2.5" {...P}/><path d="M8.2 11l7.5-4.5M8.2 13l7.5 4.5" {...P}/></>,
    plus:    <><path d="M12 5v14M5 12h14" {...P}/></>,
    swap:    <><path d="M7 6l-3 3 3 3M4 9h10M17 18l3-3-3-3M20 15H10" {...P}/></>,
    chevronR:<><path d="M9 5l7 7-7 7" {...P}/></>,
    info:    <><circle cx="12" cy="12" r="8" {...P}/><path d="M12 11v5M12 8.5v.01" {...P}/></>,
    globe:   <><circle cx="12" cy="12" r="8" {...P}/><path d="M4 12h16M12 4c3 3 3 13 0 16M12 4c-3 3-3 13 0 16" {...P}/></>,
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ display: 'block', flexShrink: 0 }}>
      {ICONS[name] || ICONS.info}
    </svg>
  );
};
===== END FILE =====

===== FILE: ds/pitch-mockup.jsx =====
// Shared pitch mockup — 720×360 landscape, with configurable state.
// Used by all 3 HUD variants as the "canvas" behind the HUD.
// State drives: ball pos, selected figure, predictive arrow, opponent highlight, celebration.

const PTokens = window.SUBBIT_TOKENS;

window.PitchMockup = function PitchMockup({
  state = 'your_turn',         // your_turn | flicking | shot_incoming | goal | opponent_turn
  homeColor = '#e04a3f',
  awayColor = '#2e7fd4',
  selectedIdx = 3,             // which home figure is selected (0-5)
  power = 0.65,                // 0..1, used when state === 'flicking'
  children,                    // HUD layer overlay
}) {
  const pc = PTokens.color;
  const homeFigs = [[180,100],[180,180],[180,260],[280,140],[280,220],[120,180]];
  const awayFigs = [[540,100],[540,180],[540,260],[440,140],[440,220],[600,180]];
  const ball = state === 'shot_incoming' ? [550, 170]
             : state === 'goal' ? [665, 180]
             : [360, 180];
  const sel = homeFigs[selectedIdx];

  return (
    <div style={{
      position: 'relative', width: 720, height: 360,
      background: `radial-gradient(ellipse at 50% 45%, #3aa860 0%, #1f6b3a 45%, #0f3d20 100%)`,
      borderRadius: 28, overflow: 'hidden', border: `8px solid #000`,
      boxShadow: PTokens.shadow.lg, flexShrink: 0,
    }}>
      <svg width="720" height="360" viewBox="0 0 720 360" style={{ position: 'absolute', inset: 0 }}>
        {/* Field lines */}
        <rect x="40" y="30" width="640" height="300" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <line x1="360" y1="30" x2="360" y2="330" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <circle cx="360" cy="180" r="46" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <circle cx="360" cy="180" r="2" fill="rgba(255,255,255,0.6)" />
        <rect x="40" y="110" width="70" height="140" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        <rect x="610" y="110" width="70" height="140" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" />
        {/* Goals (2D nets) */}
        <rect x="680" y="140" width="24" height="80" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" />
        <rect x="16" y="140" width="24" height="80" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" />

        {/* ═══ SPONSOR BORDER — like original Subbuteo pitch cloth ═══ */}
        {/* Field area: x 40→680, y 30→330 (width 640, height 300). 20% = 128/60 from edges */}
        {/* TOP side — logo 20% from left, url 20% from right */}
        <g opacity="0.85">
          <text x={40 + 640*0.20} y="22" fontFamily="Archivo" fontSize="11" fontWeight="900" fill="#fff" textAnchor="middle" letterSpacing="1">SUBBIT</text>
          <text x={40 + 640*0.80} y="22" fontFamily="IBM Plex Mono" fontSize="8" fill="rgba(255,255,255,0.7)" textAnchor="middle" letterSpacing="0.5">www.subbit.app</text>

          {/* BOTTOM side — mirrored */}
          <text x={40 + 640*0.20} y="348" fontFamily="Archivo" fontSize="11" fontWeight="900" fill="#fff" textAnchor="middle" letterSpacing="1">SUBBIT</text>
          <text x={40 + 640*0.80} y="348" fontFamily="IBM Plex Mono" fontSize="8" fill="rgba(255,255,255,0.7)" textAnchor="middle" letterSpacing="0.5">www.subbit.app</text>

          {/* LEFT side — rotated 90° CCW; logo 20% from top, url 20% from bottom */}
          <text x={30 + 300*0.20} y="-26" transform="rotate(90)" fontFamily="Archivo" fontSize="11" fontWeight="900" fill="#fff" textAnchor="middle" letterSpacing="1">SUBBIT</text>
          <text x={30 + 300*0.80} y="-26" transform="rotate(90)" fontFamily="IBM Plex Mono" fontSize="8" fill="rgba(255,255,255,0.7)" textAnchor="middle" letterSpacing="0.5">www.subbit.app</text>

          {/* RIGHT side — rotated 90° CW; logo 20% from top, url 20% from bottom */}
          <text x={-(30 + 300*0.20)} y="694" transform="rotate(-90)" fontFamily="Archivo" fontSize="11" fontWeight="900" fill="#fff" textAnchor="middle" letterSpacing="1">SUBBIT</text>
          <text x={-(30 + 300*0.80)} y="694" transform="rotate(-90)" fontFamily="IBM Plex Mono" fontSize="8" fill="rgba(255,255,255,0.7)" textAnchor="middle" letterSpacing="0.5">www.subbit.app</text>
        </g>

        {/* Opponent-turn: dim the pitch */}
        {state === 'opponent_turn' && (
          <rect x="0" y="0" width="720" height="360" fill="rgba(7,32,15,0.5)" />
        )}

        {/* Away figures */}
        {awayFigs.map(([x,y],i)=>{
          const pulse = state === 'opponent_turn' && i === 2;
          return <g key={'a'+i}>
            {pulse && <circle cx={x} cy={y} r="16" fill="none" stroke={awayColor} strokeWidth="2" opacity="0.6">
              <animate attributeName="r" values="12;20;12" dur="1.5s" repeatCount="indefinite"/>
              <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.5s" repeatCount="indefinite"/>
            </circle>}
            <circle cx={x} cy={y} r="10" fill={awayColor} stroke="#fff" strokeWidth="2" />
          </g>;
        })}

        {/* Home figures */}
        {homeFigs.map(([x,y],i)=>{
          const isSel = i === selectedIdx && (state === 'your_turn' || state === 'flicking' || state === 'shot_incoming');
          return <g key={'h'+i}>
            <circle cx={x} cy={y} r="10" fill={homeColor} stroke="#fff" strokeWidth="2" />
            {isSel && state === 'your_turn' && (
              <circle cx={x} cy={y} r="18" fill="none" stroke={pc.highlight} strokeWidth="2.5" opacity="0.9">
                <animate attributeName="r" values="16;20;16" dur="1.8s" repeatCount="indefinite"/>
              </circle>
            )}
          </g>;
        })}

        {/* Ball */}
        {state !== 'goal' && <circle cx={ball[0]} cy={ball[1]} r="7" fill="#fff" stroke="#000" strokeWidth="1" />}
        {state === 'goal' && <circle cx={ball[0]} cy={ball[1]} r="7" fill="#fff" stroke="#000" strokeWidth="1" />}

        {/* Predictive arrow when flicking or shot */}
        {(state === 'flicking' || state === 'shot_incoming') && (() => {
          const target = state === 'shot_incoming' ? [670, 175] : [360, 180];
          const dx = target[0] - sel[0], dy = target[1] - sel[1];
          const len = Math.sqrt(dx*dx+dy*dy);
          return <g>
            {/* dotted line */}
            <line x1={sel[0]} y1={sel[1]} x2={target[0]} y2={target[1]}
                  stroke={pc.highlight} strokeWidth="2.5" strokeDasharray="5 6" opacity="0.85" />
            <polygon points={`${target[0]},${target[1]} ${target[0]-10*dx/len-6*dy/len},${target[1]-10*dy/len+6*dx/len} ${target[0]-10*dx/len+6*dy/len},${target[1]-10*dy/len-6*dx/len}`} fill={pc.highlight}/>
          </g>;
        })()}
      </svg>
      {children}
    </div>
  );
};
===== END FILE =====

===== FILE: ds/tokens.js =====
// Subbit Design System — Tokens
// Mobile-only (Telegram Mini App, landscape), compact density.

window.SUBBIT_TOKENS = {
  // ─── COLORS ──────────────────────────────────────────
  color: {
    // Brand
    pitch:       '#1f6b3a',  // Primary brand green
    pitchLight:  '#2d9050',  // Hover / active lighter
    pitchDeep:   '#0f3d20',  // Surface dark / backgrounds
    pitchInk:    '#07200f',  // Deepest background
    cream:       '#f2ede2',  // Light bg
    paper:       '#ffffff',
    ink:         '#0a1a10',  // Primary text on light

    // Neutrals on dark (for HUD / in-game surfaces)
    surface0:    '#07200f',  // app bg darkest
    surface1:    '#0f3d20',  // elevated
    surface2:    '#164e2a',  // elevated 2
    surface3:    '#1f6b3a',  // interactive surface
    line:        'rgba(255,255,255,0.12)',
    lineStrong:  'rgba(255,255,255,0.22)',

    // Text on dark
    textHi:      '#ffffff',
    textMd:      'rgba(255,255,255,0.78)',
    textLo:      'rgba(255,255,255,0.52)',
    textDim:     'rgba(255,255,255,0.34)',

    // Text on light
    textHiL:     '#07200f',
    textMdL:     'rgba(7,32,15,0.70)',
    textLoL:     'rgba(7,32,15,0.48)',

    // Team colors (home / away placeholders — override per team)
    teamHome:    '#e04a3f',  // warm red
    teamAway:    '#2e7fd4',  // cool blue

    // Semantic
    success:     '#27ae60',
    warn:        '#f0a020',
    danger:      '#e14747',
    info:        '#2e7fd4',

    // Gameplay accents
    highlight:   '#ffd64a',  // your-turn glow
    ballWhite:   '#ffffff',
  },

  // ─── TYPOGRAPHY ──────────────────────────────────────
  // Archivo = UI/wordmark ; DM Serif = editorial accents ;
  // IBM Plex Mono = numbers/labels/metadata
  font: {
    ui:      '"Archivo", system-ui, -apple-system, sans-serif',
    display: '"DM Serif Display", Georgia, serif',
    mono:    '"IBM Plex Mono", ui-monospace, monospace',
  },
  // Compact scale — mobile landscape, lots of info in small space
  size: {
    xxs: 10,  // labels in mono caps
    xs:  11,
    sm:  12,
    md:  14,  // body default
    lg:  16,
    xl:  20,
    xxl: 28,
    display: 40,
  },
  weight: { regular: 400, medium: 500, semibold: 600, bold: 700, black: 800 },

  // ─── SPACING (4pt scale, compact) ────────────────────
  space: { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 12, 6: 16, 7: 20, 8: 24, 9: 32, 10: 48 },

  // ─── RADIUS ──────────────────────────────────────────
  radius: { xs: 4, sm: 6, md: 10, lg: 14, pill: 999, circle: '50%' },

  // ─── SHADOW ──────────────────────────────────────────
  shadow: {
    sm: '0 1px 2px rgba(0,0,0,0.25)',
    md: '0 2px 8px rgba(0,0,0,0.35)',
    lg: '0 8px 24px rgba(0,0,0,0.45)',
    glow: '0 0 0 2px rgba(255,214,74,0.5), 0 0 16px rgba(255,214,74,0.5)',
  },

  // ─── TIMING ──────────────────────────────────────────
  ease: {
    fast: '120ms cubic-bezier(.2,.7,.3,1)',
    base: '220ms cubic-bezier(.2,.7,.3,1)',
    slow: '400ms cubic-bezier(.2,.7,.3,1)',
  },

  // ─── HIT TARGETS ─────────────────────────────────────
  hit: { min: 44 }, // iOS/Android recommended minimum

  // ─── Z-LAYERS ────────────────────────────────────────
  z: { pitch: 0, hud: 10, overlay: 30, modal: 50, toast: 80 },
};
===== END FILE =====

