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