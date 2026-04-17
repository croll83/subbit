# Subbit — Prototype Plan
**Table football for Telegram. Subbuteo-inspired, legally independent.**

---

## 1. CONCEPT

Subbit è una Telegram Mini App multiplayer real-time che ricrea il Subbuteo digitale in 3D.
Due giocatori si sfidano in partite 2x2 minuti (configurabile) con fisica di flick realistica.

---

## 2. GAMEPLAY LOOP

### Vista default — 2D top-down
- All'inizio del turno il giocatore vede il campo dall'alto
- Le sue 11 pedine sono evidenziate, quelle avversarie no
- Tap su una pedina → attivazione

### Vista flick — 3D prospettica
- Camera si posiziona **dietro la pedina selezionata**, orientata sulla retta pedina→pallone
- Altezza camera = 2x l'altezza della pedina
- Camera **fissa** per tutta la durata del flick
- Il giocatore esegue il flick con drag-and-release

### Meccanica del flick
- Drag verso il basso/dietro = direziona il tiro verso il pallone
- Lunghezza del drag = potenza
- Release = la pedina parte
- Linea di traiettoria predittiva mostrata durante il drag
- Il raycasting è triviale: camera ortogonale al piano → drag = vettore mondo

### Fine flick (FISTF Rules)
- Se la pedina tocca il pallone → turno continua:
  - La stessa pedina può continuare (max 3 tocchi consecutivi)
  - Oppure il giocatore può scegliere un'altra pedina
- Se la pedina manca il pallone → cambio possesso all'avversario
- Se il pallone tocca una pedina avversaria ferma → cambio possesso

### Tiro in porta
- Se traiettoria pallone punta alla porta → camera NON cambia (rimane prospettiva flick)
- Difendente riceve notifica simultanea e attiva slider portiere
- Slider laterale entro X ms (es. 1500ms), poi si calcola la collisione
- Gol o parata → breve feedback visivo → back a 2D, rimessa dal fondo

### Regole competitive (da FISTF Rules V5.3)

**Turno e possesso (Rule 5.1, 5.2):**
- L'attaccante mantiene il possesso finché:
  - La pedina manca il pallone → cambio turno
  - Il pallone tocca una pedina avversaria ferma → cambio turno
- Se la pedina tocca il pallone → l'attaccante continua il turno

**Regola dei 3 flick consecutivi (Rule 5.2.1):**
- La stessa pedina può toccare il pallone **max 3 volte consecutive**
- Dopo 3 tocchi, deve intervenire un'altra pedina prima di riusare quella figura
- Il conteggio si resetta se:
  - Un'altra pedina dello stesso team tocca il pallone
  - Il pallone cambia possesso (tocco avversario/portiere)
  - Il pallone esce dal campo

**Fallo (Rule 5.3.1):**
- Se la pedina flickata tocca una pedina avversaria PRIMA del pallone → fallo → calcio di punizione

**Fuori campo:**
- Rimessa laterale / calcio d'angolo / calcio dal fondo standard

**Rigore:**
- Falli ripetuti in area → penalty spot, solo slider portiere vs flick

---

## 3. ARCHITETTURA TECNICA

### Frontend — Telegram Mini App
- **Three.js** per rendering 3D (WebGL, leggero, no Unity overhead)
- **Rapier.js** per fisica 2.5D (campo piatto, pallone con rimbalzi realistici)
- **WebSocket client** per sincronia real-time con il game server
- Due modalità di rendering:
  - Top-down 2D: OrthographicCamera, visione zenitale
  - Prospettiva 3D: PerspectiveCamera, posizionamento dinamico dietro pedina

### Backend — Game Server
- **Node.js + ws** (WebSocket server leggero)
- Stato partita authoritative sul server (no client-side cheating)
- Logica:
  - Gestione turni e validazione mosse
  - Timer partita condiviso (2x2 min)
  - Calcolo collisioni server-side per validazione
  - Broadcast stato a entrambi i client dopo ogni azione

### Struttura dati partita
```
GameState {
  match_id: string
  phase: "kickoff" | "playing" | "halftime" | "ended"
  timer: { half: 1|2, seconds_remaining: int }
  possession: "home" | "away"
  
  // Regole FISTF 5.2.1 - tracking flick consecutivi
  current_figure: figure_id | null       // pedina che sta giocando
  consecutive_touches: int               // quanti tocchi consecutivi (max 3)
  
  figures: [{ id, team, x, y, is_keeper }]
  ball: { x, y }
  score: { home: int, away: int }
  fouls: { home: int, away: int }
}
```

### Sincronia real-time
```
Client → Server: FLICK { figure_id, vector: {x, y}, power }
Server → entrambi: STATE_UPDATE { ...GameState }

Client → Server: KEEPER_SLIDE { position_x }
Server → entrambi: SHOT_RESULT { goal: bool, new_state: ...GameState }
```

---

## 4. STACK

| Layer | Tecnologia |
|-------|-----------|
| Mini App frontend | HTML5 + Three.js + Rapier.js |
| Game server | Node.js + ws |
| Hosting | VPS leggero (1-2 CPU, 1GB RAM sufficiente) |
| Telegram integration | Bot API + Mini App WebApp |
| Dominio | subbit.app |

---

## 5. SCOPE PROTOTIPO (MVP)

### IN SCOPE
- [ ] Campo 3D con texture erba, linee, porte
- [ ] 22 pedine (11 + 11), modelli semplici (cilindri colorati per ora)
- [ ] Pallone fisico con rimbalzi
- [ ] Vista 2D top-down con tap per selezionare pedina
- [ ] Transizione camera 2D→3D al tap
- [ ] Camera fissa dietro pedina, orientata verso pallone
- [ ] Flick drag-and-release con linea predittiva
- [ ] Fisica collisione pedina→pallone
- [ ] Logica turni + no-consecutivo
- [ ] WebSocket multiplayer sincrono
- [ ] Timer 2x2 minuti
- [ ] Slider portiere per tiri in porta
- [ ] Gol detection + score
- [ ] Rimessa laterale / calcio d'angolo / calcio dal fondo (posizionamento ball)
- [ ] Fallo detection (pedina→pedina)
- [ ] Free kick
- [ ] Integrazione Telegram Mini App (bot, WebApp launch)

### OUT OF SCOPE (v2+)
- Lobby matchmaking
- Ranking / leaderboard
- Animazioni pedine
- Suoni / musica
- Personalizzazione squadre
- Tornei
- Replay

---

## 6. STRUTTURA FILE PROGETTO

```
subbit/
├── client/
│   ├── index.html
│   ├── main.js              # entry point, Telegram WebApp init
│   ├── game/
│   │   ├── scene.js         # Three.js scene, camera, lights
│   │   ├── pitch.js         # campo, linee, porte
│   │   ├── figures.js       # pedine + fisica
│   │   ├── ball.js          # pallone + fisica
│   │   ├── camera.js        # logica switch 2D/3D
│   │   ├── input.js         # tap, drag, release
│   │   └── ui.js            # HUD timer, score, slider portiere
│   └── net/
│       └── socket.js        # WebSocket client
├── server/
│   ├── index.js             # entry point WebSocket server
│   ├── game/
│   │   ├── state.js         # GameState management
│   │   ├── rules.js         # validazione mosse, falli, regole
│   │   ├── physics.js       # validazione fisica server-side
│   │   └── timer.js         # clock partita
│   └── lobby/
│       └── matchmaker.js    # pairing giocatori (semplice per MVP)
└── PLAN.md
```

---

## 7. MILESTONE PROTOTIPO

**M1 — Campo e fisica locale (no multiplayer)**
Rendering campo 3D, pedine, pallone. Flick funzionante con fisica. Switch camera 2D/3D. Un solo giocatore in locale.

**M2 — Multiplayer WebSocket**
Game server Node.js. Due browser/tab sincronizzati. Turni, timer, score.

**M3 — Regole complete**
No-consecutivo, 3-flick rule, falli, rimesse, free kick, rigori, slider portiere.

**M4 — Telegram Mini App**
Bot Telegram, WebApp launch, UI ottimizzata mobile, test su device reali.

**M5 — Deploy**
subbit.app live, HTTPS, dominio configurato, primo match pubblico.

---

## 8. NOTE DI DESIGN

- Pedine MVP: cilindri colorati (home=rosso, away=blu). Modelli 3D dettagliati in v2.
- Il portiere si distingue visivamente (colore diverso, leggermente più grande)
- La linea predittiva del flick è fondamentale per l'UX — deve essere precisa
- Suoni minimi ma presenti: flick, gol, parata
- Su mobile il campo deve essere sempre leggibile anche in 3D — mai angoli troppo obliqui
