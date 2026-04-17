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