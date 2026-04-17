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