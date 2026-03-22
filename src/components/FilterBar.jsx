import { useState, useEffect, useRef } from 'react';
import { getTagColor } from '../lib/colors';

const TOP_TAGS = 3;

function deriveTagCounts(posts) {
  const counts = new Map();
  for (const post of posts) {
    for (const tag of post.tags ?? []) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}

function TagMoreDropdown({ tags, activeFilter, onFilter }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const anyActive = tags.some(({ tag }) => tag === activeFilter);

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '11px',
          letterSpacing: '0.5px',
          padding: '4px 11px',
          borderRadius: '20px',
          border: anyActive
            ? '1px solid rgba(196,160,80,0.8)'
            : '1px solid rgba(200,180,140,0.4)',
          background: anyActive
            ? 'rgba(196,160,80,0.15)'
            : 'rgba(255,255,255,0.3)',
          color: anyActive ? '#c4a050' : '#a0906a',
          cursor: 'pointer',
          transition: 'all 0.15s ease',
          backdropFilter: 'blur(6px)',
        }}
      >
        {open ? '✕' : `+${tags.length}`}
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: 'calc(100% + 8px)',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(250,244,228,0.97)',
          backdropFilter: 'blur(14px)',
          border: '1px solid rgba(200,180,140,0.4)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(80,60,20,0.18)',
          padding: '10px 8px',
          minWidth: '180px',
          zIndex: 100,
          animation: 'fadeIn 0.15s ease',
        }}>
          {tags.map(({ tag, count }) => {
            const isActive = activeFilter === tag;
            const { bg, text } = getTagColor(tag);
            return (
              <button
                key={tag}
                onClick={() => { onFilter(tag); setOpen(false); }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                  textAlign: 'left',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isActive ? bg.replace(/[\d.]+\)$/, '0.22)') : 'transparent',
                  color: isActive ? text : '#6a5d45',
                  fontFamily: "'Courier New', monospace",
                  fontSize: '11px',
                  letterSpacing: '0.5px',
                  textTransform: 'lowercase',
                  cursor: 'pointer',
                  gap: '8px',
                }}
              >
                <span>{isActive ? '✓ ' : ''}{tag}</span>
                <span style={{ opacity: 0.5, fontSize: '10px' }}>{count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function FilterBar({ posts, activeFilter, onFilter, showSort, sortOrder, onSort, onBack }) {
  const tagCounts = deriveTagCounts(posts);
  const topTags = tagCounts.slice(0, TOP_TAGS);
  const moreTags = tagCounts.slice(TOP_TAGS);

  function specialBtn(key) {
    const isActive = activeFilter === key;
    return {
      fontFamily: "'Courier New', monospace",
      fontSize: '12px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      padding: '7px 16px',
      borderRadius: '20px',
      border: isActive
        ? '1.5px solid rgba(196,160,80,0.8)'
        : '1.5px solid rgba(196,160,80,0.4)',
      background: isActive
        ? 'rgba(196,160,80,0.18)'
        : 'rgba(196,160,80,0.06)',
      color: isActive ? '#a07828' : '#c4a050',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      fontWeight: isActive ? '600' : '400',
    };
  }

  function projectsBtn(isActive) {
    return {
      fontFamily: "'Courier New', monospace",
      fontSize: '12px',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      padding: '7px 18px',
      borderRadius: '20px',
      border: isActive
        ? '1.5px solid rgba(130,50,60,0.75)'
        : '1.5px solid rgba(130,50,60,0.35)',
      background: isActive
        ? 'rgba(130,50,60,0.16)'
        : 'rgba(130,50,60,0.07)',
      color: isActive ? '#b8415a' : '#9e4455',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      fontWeight: '700',
    };
  }

  function tagBtn(tag) {
    const isActive = activeFilter === tag;
    const { bg, text } = getTagColor(tag);
    return {
      fontFamily: "'Courier New', monospace",
      fontSize: '11px',
      letterSpacing: '0.5px',
      textTransform: 'lowercase',
      padding: '4px 12px',
      borderRadius: '20px',
      border: isActive ? `1px solid ${text}` : `1px solid ${text}55`,
      background: isActive ? bg.replace(/[\d.]+\)$/, '0.22)') : bg,
      color: text,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      opacity: isActive ? 1 : 0.75,
    };
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '10px',
      padding: '0 24px',
    }}>

      {/* Special golden buttons + Projects */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => onFilter('bubbles')} style={specialBtn('bubbles')}>
          ◎ Thoughts in Bubbles
        </button>
        <button onClick={() => onFilter('order')} style={specialBtn('order')}>
          ≡ Thoughts in Order
        </button>
        <button onClick={() => onFilter('projects')} style={projectsBtn(activeFilter === 'projects')}>
          ◈ Projects
        </button>
      </div>

      {/* Top tags + more dropdown */}
      {tagCounts.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '760px',
        }}>
          {topTags.map(({ tag, count }) => (
            <button key={tag} onClick={() => onFilter(tag)} style={tagBtn(tag)}>
              {tag} <span style={{ opacity: 0.6 }}>({count})</span>
            </button>
          ))}
          {moreTags.length > 0 && (
            <TagMoreDropdown
              tags={moreTags}
              activeFilter={activeFilter}
              onFilter={onFilter}
            />
          )}
        </div>
      )}

      {/* Sort row — only in grid mode */}
      {showSort && (
        <div style={{
          display: 'flex',
          gap: '6px',
          alignItems: 'center',
          flexWrap: 'wrap',
          justifyContent: 'center',
          paddingTop: '2px',
        }}>
          <span style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '10px',
            color: '#a0906a',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            marginRight: '2px',
          }}>Sort:</span>
          {['newest', 'oldest', 'a-z', 'random'].map((s) => (
            <button
              key={s}
              onClick={() => onSort(s)}
              style={{
                fontFamily: "'Courier New', monospace",
                fontSize: '10px',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                padding: '3px 10px',
                borderRadius: '12px',
                border: `1px solid ${sortOrder === s ? 'rgba(60,50,35,0.35)' : 'rgba(160,140,100,0.2)'}`,
                background: sortOrder === s ? 'rgba(60,50,35,0.08)' : 'transparent',
                color: sortOrder === s ? '#4a3f2e' : '#a0906a',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {s === 'a-z' ? 'A→Z' : s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
