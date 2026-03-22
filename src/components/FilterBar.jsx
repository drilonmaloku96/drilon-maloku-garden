import { getTagColor } from '../lib/colors';

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

export default function FilterBar({ posts, activeFilter, onFilter, showSort, sortOrder, onSort, onBack }) {
  const tagCounts = deriveTagCounts(posts);

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

      {/* Special golden buttons */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button onClick={() => onFilter('bubbles')} style={specialBtn('bubbles')}>
          ◎ Everything in Bubbles
        </button>
        <button onClick={() => onFilter('order')} style={specialBtn('order')}>
          ≡ Everything in Order
        </button>
      </div>

      {/* Tag pills — auto-derived from vault, auto-colored */}
      {tagCounts.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          maxWidth: '760px',
        }}>
          {tagCounts.map(({ tag, count }) => (
            <button key={tag} onClick={() => onFilter(tag)} style={tagBtn(tag)}>
              {tag} <span style={{ opacity: 0.6 }}>({count})</span>
            </button>
          ))}
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
          <button
            onClick={onBack}
            style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '10px',
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              padding: '3px 10px',
              borderRadius: '12px',
              border: '1px solid rgba(196,160,80,0.3)',
              color: '#c4a050',
              cursor: 'pointer',
              marginLeft: '6px',
              background: 'transparent',
              transition: 'all 0.15s',
            }}
          >
            ◎ Bubbles
          </button>
        </div>
      )}
    </div>
  );
}
