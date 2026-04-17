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