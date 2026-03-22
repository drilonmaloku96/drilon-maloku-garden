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

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [open]);

  function toggleOpen(e) {
    e.stopPropagation();
    setOpen(o => !o);
  }

  function toggle(lang, e) {
    e.stopPropagation();
    if (selected.includes(lang)) {
      onChange(selected.filter(l => l !== lang));
    } else {
      onChange([...selected, lang]);
    }
  }

  const anyActive = selected.length > 0;

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
          border: open || anyActive
            ? '1px solid rgba(196,160,80,0.7)'
            : '1px solid rgba(200,180,140,0.35)',
          background: open || anyActive
            ? 'rgba(196,160,80,0.12)'
            : 'rgba(255,255,255,0.35)',
          color: anyActive ? '#c4a050' : '#a0906a',
          cursor: 'pointer',
          transition: 'border-color 0.15s, background 0.15s, color 0.15s',
          backdropFilter: 'blur(6px)',
          minWidth: '110px',
          textAlign: 'center',
        }}
      >
        Language {open ? '▲' : '▼'}
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
          {languages.map(lang => {
            const checked = selected.includes(lang);
            return (
              <label
                key={lang}
                onClick={(e) => toggle(lang, e)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '8px 12px',
                  borderRadius: '10px',
                  background: checked ? 'rgba(196,160,80,0.12)' : 'transparent',
                  cursor: 'pointer',
                  transition: 'background 0.12s',
                  userSelect: 'none',
                }}
              >
                {/* Custom checkbox */}
                <span style={{
                  width: '16px',
                  height: '16px',
                  borderRadius: '4px',
                  border: checked
                    ? '1.5px solid rgba(196,160,80,0.9)'
                    : '1.5px solid rgba(160,140,100,0.45)',
                  background: checked ? 'rgba(196,160,80,0.25)' : 'rgba(255,255,255,0.5)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  fontSize: '10px',
                  color: '#c4a050',
                  transition: 'all 0.12s',
                }}>
                  {checked ? '✓' : ''}
                </span>
                <span style={{ fontSize: '16px', lineHeight: 1 }}>{FLAG[lang] ?? '🌐'}</span>
                <span style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '11px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: checked ? '#c4a050' : '#6a5d45',
                  transition: 'color 0.12s',
                }}>
                  {label(lang)}
                </span>
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}
