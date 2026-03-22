import { getTagColor } from '../lib/colors';

const STATUS_LABEL = {
  live:          { text: 'Live',        color: '#50a078' },
  beta:          { text: 'Beta',        color: '#c4a050' },
  'in-progress': { text: 'In progress', color: '#a0906a' },
};

export default function ProjectsView({ projects }) {
  return (
    <div style={{
      padding: '24px 24px 48px',
      maxWidth: '1000px',
      margin: '0 auto',
    }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr',
        gap: '14px',
        maxWidth: '680px',
        margin: '0 auto',
      }}>
        {projects.map((project, i) => {
          const status = STATUS_LABEL[project.status] ?? STATUS_LABEL['in-progress'];
          const isLive = project.url && project.url !== '#';

          return (
            <a
              key={project.title}
              href={isLive ? project.url : undefined}
              target={isLive ? '_blank' : undefined}
              rel={isLive ? 'noopener noreferrer' : undefined}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '20px',
                borderRadius: '16px',
                border: '1px solid rgba(130, 50, 60, 0.18)',
                background: 'rgba(255,255,255,0.42)',
                backdropFilter: 'blur(8px)',
                textDecoration: 'none',
                color: 'inherit',
                cursor: isLive ? 'pointer' : 'default',
                transition: 'transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease',
                animation: `fadeSlideUp 0.35s ease both`,
                animationDelay: `${i * 50}ms`,
              }}
              onMouseEnter={isLive ? (e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 8px 28px rgba(130,50,60,0.12)';
                e.currentTarget.style.borderColor = 'rgba(130,50,60,0.35)';
              } : undefined}
              onMouseLeave={isLive ? (e) => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.borderColor = 'rgba(130,50,60,0.18)';
              } : undefined}
            >
              {/* Title row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                <h3 style={{
                  fontFamily: 'Georgia, serif',
                  fontSize: '16px',
                  fontWeight: 700,
                  color: '#2a2318',
                  lineHeight: 1.3,
                }}>
                  {project.title}
                </h3>
                <span style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '10px',
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  color: status.color,
                  whiteSpace: 'nowrap',
                  paddingTop: '2px',
                }}>
                  {status.text}
                </span>
              </div>

              {/* Description */}
              <p style={{
                fontFamily: 'Georgia, serif',
                fontSize: '13px',
                lineHeight: 1.65,
                color: '#6a5d45',
                flex: 1,
              }}>
                {project.description}
              </p>

              {/* Tags */}
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                {project.tags.map(tag => {
                  const { bg, text } = getTagColor(tag);
                  return (
                    <span key={tag} style={{
                      fontFamily: "'Courier New', monospace",
                      fontSize: '10px',
                      letterSpacing: '0.5px',
                      textTransform: 'lowercase',
                      padding: '2px 8px',
                      borderRadius: '10px',
                      background: bg,
                      color: text,
                      border: `1px solid ${text}44`,
                    }}>
                      {tag}
                    </span>
                  );
                })}
              </div>

              {/* Link indicator */}
              {isLive && (
                <div style={{
                  fontFamily: "'Courier New', monospace",
                  fontSize: '10px',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: 'rgba(130,50,60,0.6)',
                  marginTop: '2px',
                }}>
                  Open →
                </div>
              )}
            </a>
          );
        })}
      </div>
    </div>
  );
}
