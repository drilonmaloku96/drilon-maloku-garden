import { useState } from 'react';
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

export default function FilterBar({ posts, activeFilter, onFilter, showSort, sortOrder, onSort, onBack }) {
  const [showAllTags, setShowAllTags] = useState(false);

  const tagCounts = deriveTagCounts(posts);
  const topTags = tagCounts.slice(0, TOP_TAGS);
  const moreTags = tagCounts.slice(TOP_TAGS);

  function specialBtn(key) {
    const isActive = activeFilter === key;
    return {
      fontFamily: "'Courier New', monospace",
      fontSize: '12px',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      padding: '8px 18px',
      borderRadius: '20px',
      border: isActive
        ? '2px solid rgba(196,160,80,0.9)'
        : '2px solid rgba(196,160,80,0.55)',
      background: isActive
        ? 'rgba(196,160,80,0.22)'
        : 'rgba(196,160,80,0.10)',
      color: isActive ? '#8a6518' : '#b08830',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      fontWeight: '700',
      boxShadow: isActive
        ? '0 2px 10px rgba(196,160,80,0.25)'
        : '0 1px 4px rgba(196,160,80,0.10)',
    };
  }

  function projectsBtn(isActive) {
    return {
      fontFamily: "'Courier New', monospace",
      fontSize: '12px',
      letterSpacing: '1.5px',
      textTransform: 'uppercase',
      padding: '8px 20px',
      borderRadius: '20px',
      border: isActive
        ? '2px solid rgba(130,50,60,0.85)'
        : '2px solid rgba(130,50,60,0.45)',
      background: isActive
        ? 'rgba(130,50,60,0.18)'
        : 'rgba(130,50,60,0.09)',
      color: isActive ? '#9a2535' : '#8c3040',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      whiteSpace: 'nowrap',
      fontWeight: '700',
      boxShadow: isActive
        ? '0 2px 10px rgba(130,50,60,0.22)'
        : '0 1px 4px rgba(130,50,60,0.10)',
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

  const expandBtn = {
    fontFamily: "'Courier New', monospace",
    fontSize: '11px',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    padding: '4px 12px',
    borderRadius: '20px',
    border: '1.5px solid rgba(160,144,106,0.55)',
    background: showAllTags ? 'rgba(160,144,106,0.14)' : 'rgba(160,144,106,0.07)',
    color: '#7a6d52',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    fontWeight: '700',
  };

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

      {/* Top tags + inline expand */}
      {tagCounts.length > 0 && (
        <div style={{
          display: 'flex',
          gap: '6px',
          flexWrap: 'wrap',
          justifyContent: 'center',
          alignItems: 'center',
          maxWidth: '760px',
        }}>
          {topTags.map(({ tag }) => (
            <button key={tag} onClick={() => onFilter(tag)} style={tagBtn(tag)}>
              {tag}
            </button>
          ))}
          {moreTags.length > 0 && !showAllTags && (
            <button onClick={() => setShowAllTags(true)} style={expandBtn}>
              +{moreTags.length} more
            </button>
          )}
          {showAllTags && moreTags.map(({ tag }) => (
            <button key={tag} onClick={() => onFilter(tag)} style={tagBtn(tag)}>
              {tag}
            </button>
          ))}
          {showAllTags && (
            <button onClick={() => setShowAllTags(false)} style={expandBtn}>
              ✕ less
            </button>
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
