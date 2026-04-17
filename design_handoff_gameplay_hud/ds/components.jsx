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