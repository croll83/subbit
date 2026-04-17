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