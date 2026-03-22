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

  const languages = [...new Set(posts.map(p => p.language || 'english'))].sort();
  const allSelected = selected.length === 0;

  // Close on outside click — use 'click' not 'mousedown' to avoid race with button
  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  function toggleOpen(e) {
    e.stopPropagation(); // prevent document click handler from immediately closing
    setOpen(o => !o);
  }

  function toggle(lang) {
    if (selected.includes(lang)) {
      const next = selected.filter(l => l !== lang);
      onChange(next.length === languages.length ? [] : next);
    } else {
      const next = [...selected, lang];
      onChange(next.length === languages.length ? [] : next);
    }
  }

  const btnLabel = allSelected
    ? 'All languages'
    : selected.length === 1
      ? `${FLAG[selected[0]] ?? '🌐'} ${label(selected[0])}`
      : `${selected.length} languages`;

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={toggleOpen}
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          padding: '5px 14px',
          borderRadius: '20px',
          border: open || !allSelected
            ? '1px solid rgba(196,160,80,0.7)'
            : '1px solid rgba(200,180,140,0.35)',
          background: open || !allSelected
            ? 'rgba(196,160,80,0.12)'
            : 'rgba(255,255,255,0.35)',
          color: allSelected ? '#a0906a' : '#c4a050',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background 0.15s, color 0.15s',
          backdropFilter: 'blur(6px)',
          minWidth: '140px',   // fixed width prevents jitter when label changes
          textAlign: 'center',
        }}
      >
        {btnLabel} {open ? '▲' : '▼'}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: '50%',
          transformOrigin: 'top center',
          background: 'rgba(250,244,228,0.97)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(200,180,140,0.4)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(80,60,20,0.18)',
          padding: '10px 8px',
          minWidth: '170px',
          zIndex: 100,
          animation: 'dropdownOpen 0.22s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
        }}>
          {/* All languages */}
          <button
            onClick={(e) => { e.stopPropagation(); onChange([]); setOpen(false); }}
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
            {allSelected ? '✓ ' : '\u00a0\u00a0'}All languages
          </button>

          <div style={{ height: '1px', background: 'rgba(200,180,140,0.3)', margin: '4px 8px' }} />

          {languages.map(lang => {
            const active = selected.includes(lang);
            return (
              <button
                key={lang}
                onClick={(e) => { e.stopPropagation(); toggle(lang); }}
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
                  transition: 'background 0.12s, color 0.12s',
                }}
              >
                {active ? '✓ ' : '\u00a0\u00a0'}{FLAG[lang] ?? '🌐'} {label(lang)}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
