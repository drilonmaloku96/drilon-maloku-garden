import { useState, useEffect, useRef } from 'react';

const FLAG = {
  english:  '🇬🇧',
  albanian: '🇦🇱',
  german:   '🇩🇪',
  french:   '🇫🇷',
  italian:  '🇮🇹',
};

function label(lang) {
  return lang.charAt(0).toUpperCase() + lang.slice(1);
}

export default function LanguageDropdown({ posts, selected, onChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Derive languages present in posts
  const languages = [...new Set(posts.map(p => p.language || 'english'))].sort();

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const allSelected = selected.length === 0;

  function toggle(lang) {
    if (selected.includes(lang)) {
      const next = selected.filter(l => l !== lang);
      onChange(next.length === languages.length ? [] : next);
    } else {
      const next = [...selected, lang];
      onChange(next.length === languages.length ? [] : next);
    }
  }

  // Button label
  const btnLabel = allSelected
    ? 'All languages'
    : selected.length === 1
      ? `${FLAG[selected[0]] ?? '🌐'} ${label(selected[0])}`
      : `${selected.length} languages`;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          padding: '5px 12px',
          borderRadius: '20px',
          border: open
            ? '1px solid rgba(196,160,80,0.7)'
            : '1px solid rgba(200,180,140,0.35)',
          background: open
            ? 'rgba(196,160,80,0.12)'
            : 'rgba(255,255,255,0.35)',
          color: allSelected ? '#a0906a' : '#c4a050',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          backdropFilter: 'blur(6px)',
          whiteSpace: 'nowrap',
        }}
      >
        {btnLabel} {open ? '▲' : '▼'}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(250,244,228,0.96)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(200,180,140,0.4)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(80,60,20,0.18)',
          padding: '10px 8px',
          minWidth: '160px',
          zIndex: 100,
          animation: 'fadeIn 0.15s ease',
        }}>
          {/* All languages option */}
          <button
            onClick={() => { onChange([]); setOpen(false); }}
            style={{
              display: 'block',
              width: '100%',
              textAlign: 'left',
              padding: '7px 12px',
              borderRadius: '10px',
              border: 'none',
              background: allSelected ? 'rgba(196,160,80,0.15)' : 'transparent',
              color: allSelected ? '#c4a050' : '#6a5d45',
              fontFamily: "'Courier New', monospace",
              fontSize: '11px',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              cursor: 'pointer',
              marginBottom: '4px',
            }}
          >
            {allSelected ? '✓ ' : '  '}All languages
          </button>

          <div style={{ height: '1px', background: 'rgba(200,180,140,0.3)', margin: '4px 8px' }} />

          {languages.map(lang => {
            const active = selected.includes(lang);
            return (
              <button
                key={lang}
                onClick={() => toggle(lang)}
                style={{
                  display: 'block',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: active ? 'rgba(196,160,80,0.15)' : 'transparent',
                  color: active ? '#c4a050' : '#6a5d45',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  cursor: 'pointer',
                }}
              >
                {active ? '✓ ' : '  '}{FLAG[lang] ?? '🌐'} {label(lang)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
