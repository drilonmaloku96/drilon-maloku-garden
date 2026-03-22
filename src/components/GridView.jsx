import PostCard from './PostCard.jsx';

export default function GridView({ posts, onNavigate }) {
  if (!posts.length) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 24px',
        fontFamily: "'Courier New', monospace",
        fontSize: '13px',
        color: '#a0906a',
        letterSpacing: '1px',
      }}>
        No posts in this category yet.
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '20px 24px 60px',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '16px',
    }}>
      {posts.map((post, i) => (
        <PostCard
          key={post.slug}
          post={post}
          index={i}
          onNavigate={onNavigate}
        />
      ))}
    </div>
  );
}
