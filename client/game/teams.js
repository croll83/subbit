// Teams Configuration
// Each team has: name, shortName, flag (SVG), kit style and colors

// Kit styles: 'solid', 'vertical_stripes', 'horizontal_stripes', 'vertical_halves'

export const TEAMS = {
  ITA: {
    name: 'Italia',
    shortName: 'ITA',
    // SVG flag as data URI
    flag: `<svg viewBox="0 0 18 18"><rect width="6" height="18" fill="#009246"/><rect x="6" width="6" height="18" fill="#fff"/><rect x="12" width="6" height="18" fill="#ce2b37"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',           // solid, vertical_stripes, horizontal_stripes, vertical_halves
      primary: '#0066cc',       // blu azzurro
      secondary: '#0066cc',     // non usato per solid
      collar: '#ffffff',
      shorts: '#ffffff',
    }
  },
  
  BRA: {
    name: 'Brasile',
    shortName: 'BRA',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="18" fill="#009c3b"/><polygon points="9,3 16,9 9,15 2,9" fill="#ffdf00"/><circle cx="9" cy="9" r="2.6" fill="#002776"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',
      primary: '#ffdf00',       // giallo canarinho
      secondary: '#ffdf00',
      collar: '#009c3b',        // verde
      shorts: '#009c3b',
    }
  },
  
  ARG: {
    name: 'Argentina',
    shortName: 'ARG',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="6" fill="#74acdf"/><rect y="6" width="18" height="6" fill="#fff"/><rect y="12" width="18" height="6" fill="#74acdf"/><circle cx="9" cy="9" r="2" fill="#f6b40e"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'vertical_stripes',
      primary: '#74acdf',       // celeste
      secondary: '#ffffff',
      collar: '#74acdf',
      shorts: '#000000',
    }
  },
  
  GER: {
    name: 'Germania',
    shortName: 'GER',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="6" fill="#000"/><rect y="6" width="18" height="6" fill="#dd0000"/><rect y="12" width="18" height="6" fill="#ffcc00"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',
      primary: '#ffffff',
      secondary: '#ffffff',
      collar: '#000000',
      shorts: '#000000',
    }
  },
  
  FRA: {
    name: 'Francia',
    shortName: 'FRA',
    flag: `<svg viewBox="0 0 18 18"><rect width="6" height="18" fill="#002395"/><rect x="6" width="6" height="18" fill="#fff"/><rect x="12" width="6" height="18" fill="#ed2939"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',
      primary: '#002395',       // blu
      secondary: '#002395',
      collar: '#ed2939',        // rosso
      shorts: '#ffffff',
    }
  },
  
  ESP: {
    name: 'Spagna',
    shortName: 'ESP',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="4.5" fill="#c60b1e"/><rect y="4.5" width="18" height="9" fill="#ffc400"/><rect y="13.5" width="18" height="4.5" fill="#c60b1e"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',
      primary: '#c60b1e',       // rosso
      secondary: '#c60b1e',
      collar: '#ffc400',        // giallo
      shorts: '#002395',        // blu navy
    }
  },
  
  ENG: {
    name: 'Inghilterra',
    shortName: 'ENG',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="18" fill="#fff"/><rect x="7.5" width="3" height="18" fill="#c8102e"/><rect y="7.5" width="18" height="3" fill="#c8102e"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(200,200,200,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',
      primary: '#ffffff',
      secondary: '#ffffff',
      collar: '#002395',        // blu navy
      shorts: '#002395',
    }
  },
  
  NED: {
    name: 'Olanda',
    shortName: 'NED',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="6" fill="#ae1c28"/><rect y="6" width="18" height="6" fill="#fff"/><rect y="12" width="18" height="6" fill="#21468b"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',
      primary: '#f36c21',       // arancione
      secondary: '#f36c21',
      collar: '#000000',
      shorts: '#000000',
    }
  },
  
  POR: {
    name: 'Portogallo',
    shortName: 'POR',
    flag: `<svg viewBox="0 0 18 18"><rect width="7" height="18" fill="#006600"/><rect x="7" width="11" height="18" fill="#ff0000"/><circle cx="7" cy="9" r="3" fill="#ffcc00"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',
      primary: '#ff0000',       // rosso
      secondary: '#ff0000',
      collar: '#006600',        // verde
      shorts: '#006600',
    }
  },
  
  BEL: {
    name: 'Belgio',
    shortName: 'BEL',
    flag: `<svg viewBox="0 0 18 18"><rect width="6" height="18" fill="#000"/><rect x="6" width="6" height="18" fill="#ffd90c"/><rect x="12" width="6" height="18" fill="#f31830"/><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',
      primary: '#ff0000',       // rosso
      secondary: '#ff0000',
      collar: '#000000',
      shorts: '#000000',
    }
  },
  
  // Club teams examples
  JUV: {
    name: 'Juventus',
    shortName: 'JUV',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="18" fill="#000"/><text x="9" y="13" text-anchor="middle" fill="#fff" font-size="10" font-weight="bold">J</text><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'vertical_stripes',
      primary: '#000000',
      secondary: '#ffffff',
      collar: '#000000',
      shorts: '#000000',
    }
  },
  
  MIL: {
    name: 'AC Milan',
    shortName: 'MIL',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="18" fill="#9c1b29"/><text x="9" y="13" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">ACM</text><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'vertical_stripes',
      primary: '#ff0000',
      secondary: '#000000',
      collar: '#ffffff',
      shorts: '#ffffff',
    }
  },
  
  INT: {
    name: 'Inter',
    shortName: 'INT',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="18" fill="#010e80"/><text x="9" y="13" text-anchor="middle" fill="#fff" font-size="8" font-weight="bold">INT</text><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'vertical_stripes',
      primary: '#010e80',       // blu
      secondary: '#000000',
      collar: '#010e80',
      shorts: '#000000',
    }
  },
  
  BAR: {
    name: 'Barcelona',
    shortName: 'BAR',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="18" fill="#004d98"/><text x="9" y="13" text-anchor="middle" fill="#a50044" font-size="8" font-weight="bold">FCB</text><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(255,255,255,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'vertical_stripes',
      primary: '#a50044',       // granata
      secondary: '#004d98',     // blu
      collar: '#a50044',
      shorts: '#004d98',
    }
  },
  
  RMA: {
    name: 'Real Madrid',
    shortName: 'RMA',
    flag: `<svg viewBox="0 0 18 18"><rect width="18" height="18" fill="#fff"/><text x="9" y="13" text-anchor="middle" fill="#000" font-size="8" font-weight="bold">RM</text><circle cx="9" cy="9" r="8.2" fill="none" stroke="rgba(200,200,200,0.85)" stroke-width="1"/></svg>`,
    kit: {
      style: 'solid',
      primary: '#ffffff',
      secondary: '#ffffff',
      collar: '#000000',
      shorts: '#ffffff',
    }
  },
};

// Get team by shortName
export function getTeam(shortName) {
  return TEAMS[shortName] || TEAMS.ITA;
}

// Generate kit pattern CSS/SVG for a team
export function getKitPattern(team, width = 100, height = 100) {
  const kit = team.kit;
  
  switch (kit.style) {
    case 'vertical_stripes':
      // 5 stripes alternating
      return `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <rect x="0" width="${width/5}" height="${height}" fill="${kit.primary}"/>
          <rect x="${width/5}" width="${width/5}" height="${height}" fill="${kit.secondary}"/>
          <rect x="${width*2/5}" width="${width/5}" height="${height}" fill="${kit.primary}"/>
          <rect x="${width*3/5}" width="${width/5}" height="${height}" fill="${kit.secondary}"/>
          <rect x="${width*4/5}" width="${width/5}" height="${height}" fill="${kit.primary}"/>
        </svg>
      `;
      
    case 'horizontal_stripes':
      // 5 horizontal stripes
      return `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <rect y="0" width="${width}" height="${height/5}" fill="${kit.primary}"/>
          <rect y="${height/5}" width="${width}" height="${height/5}" fill="${kit.secondary}"/>
          <rect y="${height*2/5}" width="${width}" height="${height/5}" fill="${kit.primary}"/>
          <rect y="${height*3/5}" width="${width}" height="${height/5}" fill="${kit.secondary}"/>
          <rect y="${height*4/5}" width="${width}" height="${height/5}" fill="${kit.primary}"/>
        </svg>
      `;
      
    case 'vertical_halves':
      // Split vertically in two
      return `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <rect x="0" width="${width/2}" height="${height}" fill="${kit.primary}"/>
          <rect x="${width/2}" width="${width/2}" height="${height}" fill="${kit.secondary}"/>
        </svg>
      `;
      
    case 'solid':
    default:
      return `
        <svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
          <rect width="${width}" height="${height}" fill="${kit.primary}"/>
        </svg>
      `;
  }
}

// Default match setup
export const DEFAULT_MATCH = {
  home: 'ITA',
  away: 'BRA',
};
