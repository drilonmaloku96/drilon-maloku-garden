import { useState } from 'react';
import { getTagColor } from '../lib/colors';

const TYPE_ICONS = { project: '◆', article: '◇', creative: '○', note: '▽' };

export default function PostCard({ post, index, onNavigate }) {
  const [hovered, setHovered] = useState(false);

  const icon = TYPE_ICONS[post.type] ?? '◇';
  const date = new Date(post.date).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });

  return (
    <article
      onClick={() => onNavigate(`/post/${post.slug}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'rgba(255,255,255,0.45)',
        backdropFilter: 'blur(8px)',
        border: `1px solid ${hovered ? 'rgba(200,160,80,0.5)' : 'rgba(200,180,140,0.3)'}`,
        borderRadius: '12px',
        padding: '20px 18px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-3px)' : 'translateY(0)',
        boxShadow: hovered ? '0 8px 24px rgba(100,80,40,0.1)' : '0 2px 8px rgba(100,80,40,0.04)',
        transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        animation: 'fadeSlideUp 0.4s ease both',
        animationDelay: `${index * 40}ms`,
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '10px',
          textTransform: 'uppercase',
          letterSpacing: '1px',
          color: '#a0906a',
          opacity: 0.8,
        }}>
          {icon} {post.type}
        </span>
        <span style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '10px',
          color: '#a0906a',
          opacity: 0.7,
        }}>
          {date}
        </span>
      </div>

      <h2 style={{
        fontFamily: 'Georgia, serif',
        fontSize: '16px',
        fontWeight: 400,
        lineHeight: 1.45,
        color: '#2a2318',
        margin: 0,
      }}>
        {post.title}
      </h2>

      {post.excerpt && (
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: '13px',
          lineHeight: 1.55,
          color: '#6a5d45',
          margin: 0,
          opacity: 0.85,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {post.excerpt}
        </p>
      )}

      {post.tags.length > 0 && (
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '2px' }}>
          {post.tags.slice(0, 4).map((tag) => {
            const { bg, text } = getTagColor(tag);
            return (
              <span
                key={tag}
                className="tag-chip"
                style={{ background: bg, color: text, borderColor: text }}
              >
                {tag}
              </span>
            );
          })}
        </div>
      )}
    </article>
  );
}
