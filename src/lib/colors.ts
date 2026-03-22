// Shared color logic — importable by both Astro pages and React components

const KNOWN: Record<string, { bg: string; text: string }> = {
  dentistry:          { bg: 'rgba(200,160,80,0.12)',   text: '#c4a050' },
  programming:        { bg: 'rgba(100,180,200,0.10)',  text: '#64b4c8' },
  projects:           { bg: 'rgba(80,160,120,0.10)',   text: '#50a078' },
  politics:           { bg: 'rgba(180,60,60,0.10)',    text: '#b43c3c' },
  philosophy:         { bg: 'rgba(180,140,200,0.10)',  text: '#b48cc8' },
  history:            { bg: 'rgba(160,140,100,0.10)',  text: '#a08c64' },
  'creative-writing': { bg: 'rgba(200,120,120,0.10)', text: '#c87878' },
  business:           { bg: 'rgba(106,154,80,0.10)',   text: '#6a9a50' },
  kosovo:             { bg: 'rgba(200,96,64,0.10)',    text: '#c86040' },
  education:          { bg: 'rgba(120,160,200,0.10)',  text: '#78a0c8' },
  ai:                 { bg: 'rgba(160,120,200,0.10)',  text: '#a078c8' },
  writing:            { bg: 'rgba(200,140,100,0.10)',  text: '#c88c64' },
  medicine:           { bg: 'rgba(100,180,140,0.10)',  text: '#64b48c' },
};

// djb2-style hash — fast, deterministic, no deps
function hashStr(s: string): number {
  let h = 5381;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) + h + s.charCodeAt(i)) & 0x7fffffff;
  }
  return h;
}

// For unknown tags: derive a muted hue from the tag name
// Keeps sat low (25-45%) and lightness in readable range (36-50%)
function autoColor(tag: string): { bg: string; text: string } {
  const h = hashStr(tag);
  const hue  = h % 360;
  const sat  = 25 + (h % 20);        // 25–45 %
  const text = 36 + ((h >> 4) % 14); // 36–50 % lightness for text
  return {
    text: `hsl(${hue}, ${sat}%, ${text}%)`,
    bg:   `hsla(${hue}, ${sat}%, ${text}%, 0.10)`,
  };
}

export function getTagColor(tag: string): { bg: string; text: string } {
  return KNOWN[tag.toLowerCase()] ?? autoColor(tag.toLowerCase());
}

// Returns a small deterministic hue offset (±12°) derived from the set of tag
// names on a post — used to slightly differentiate bubble colors across posts
// that share the same tag count.
export function tagsHueOffset(tags: string[]): number {
  if (!tags.length) return 0;
  const combined = tags.map(t => t.toLowerCase()).sort().join('|');
  const h = hashStr(combined);
  return (h % 25) - 12; // –12 … +12 degrees
}
