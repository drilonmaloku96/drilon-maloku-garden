import { useState, useEffect, useMemo, useCallback } from 'react';
import BubbleCanvas from './BubbleCanvas.jsx';
import GridView from './GridView.jsx';
import ProjectsView from './ProjectsView.jsx';
import FilterBar from './FilterBar.jsx';
import LanguageDropdown from './LanguageDropdown.jsx';

import { PROJECTS } from '../lib/projects';

export default function KnowledgeGarden({ posts }) {
  const allLanguages = useMemo(
    () => [...new Set(posts.map(p => p.language || 'english'))].sort(),
    [posts]
  );

  const [activeFilter, setActiveFilter] = useState('bubbles');
  const [sortOrder, setSortOrder] = useState('newest');
  const [selectedLanguages, setSelectedLanguages] = useState(() =>
    [...new Set(posts.map(p => p.language || 'english'))].sort()
  );
  const [showBubbles, setShowBubbles] = useState(true);
  const [canvasOpacity, setCanvasOpacity] = useState(1);
  const [gridVisible, setGridVisible] = useState(false);

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  // On mount, check URL for ?filter=tag from article page tag clicks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    if (f) {
      setShowBubbles(false);
      setActiveFilter(f);
      setGridVisible(true);
      setCanvasOpacity(0);
      window.history.replaceState({}, '', base + '/');
    }
  }, []);

  // Reset scroll to top when entering grid mode
  useEffect(() => {
    if (!showBubbles) {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
  }, [showBubbles]);

  const allLanguagesSelected = selectedLanguages.length >= allLanguages.length;

  const filteredPosts = useMemo(() => {
    let list;
    if (activeFilter === 'bubbles' || activeFilter === 'order') {
      list = posts;
    } else {
      list = posts.filter((p) => p.tags?.includes(activeFilter));
    }

    if (!allLanguagesSelected) {
      list = list.filter((p) => selectedLanguages.includes(p.language ?? 'english'));
    }

    switch (sortOrder) {
      case 'oldest': return [...list].sort((a, b) => a.date.localeCompare(b.date));
      case 'a-z':    return [...list].sort((a, b) => a.title.localeCompare(b.title));
      case 'random': return [...list].sort(() => Math.random() - 0.5);
      default:       return [...list].sort((a, b) => b.date.localeCompare(a.date));
    }
  }, [posts, activeFilter, sortOrder, selectedLanguages, allLanguagesSelected]);

  const navigate = useCallback((path) => {
    window.location.href = base + path;
  }, [base]);

  const goToBubbles = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    setGridVisible(false);
    setTimeout(() => {
      setActiveFilter('bubbles');
      setCanvasOpacity(1);
      setShowBubbles(true);
    }, 220);
  }, []);

  const goToGrid = useCallback((filter) => {
    if (showBubbles) {
      setCanvasOpacity(0);
      setTimeout(() => {
        setShowBubbles(false);
        setActiveFilter(filter);
        setGridVisible(true);
      }, 500);
    } else {
      setActiveFilter(filter);
    }
  }, [showBubbles]);

  const handleFilter = useCallback((filter) => {
    if (filter === 'bubbles') {
      goToBubbles();
    } else {
      goToGrid(filter);
    }
  }, [goToBubbles, goToGrid]);

  const handleLanguageChange = useCallback((newSelected) => {
    setSelectedLanguages(newSelected);
    const allSelected = newSelected.length >= allLanguages.length;
    if (!allSelected && showBubbles) {
      goToGrid('order');
    }
  }, [allLanguages.length, showBubbles, goToGrid]);

  const isGrid = !showBubbles && gridVisible;
  const isProjects = isGrid && activeFilter === 'projects';

  const gridLabel = useMemo(() => {
    if (activeFilter === 'projects') return `Projects (${PROJECTS.length})`;
    if (activeFilter === 'order') return `All posts (${filteredPosts.length})`;
    return `#${activeFilter} (${filteredPosts.length})`;
  }, [activeFilter, filteredPosts.length]);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      // Bubble mode: fixed viewport. Grid mode: natural height, window scrolls.
      height: showBubbles ? '100vh' : undefined,
      overflow: showBubbles ? 'hidden' : undefined,
    }}>

      {/* Header */}
      <header style={{ padding: '28px 24px 16px', textAlign: 'center', flexShrink: 0 }}>
        <p style={{
          fontFamily: "'Courier New', monospace",
          fontSize: '11px',
          letterSpacing: '4px',
          textTransform: 'uppercase',
          color: '#a0906a',
          marginBottom: '6px',
        }}>
          Welcome to the thoughts of
        </p>
        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif",
          fontSize: 'clamp(28px, 5vw, 44px)',
          fontWeight: 400,
          fontStyle: 'italic',
          color: '#2a2318',
          lineHeight: 1.1,
          marginBottom: '10px',
        }}>
          Drilon Maloku
        </h1>
        <p style={{
          fontFamily: 'Georgia, serif',
          fontSize: '14px',
          lineHeight: 1.6,
          color: '#6a5d45',
          maxWidth: '440px',
          margin: '0 auto 12px',
        }}>
          Dentist. Thinker. Writer. Explorer of ideas across borders and disciplines.
        </p>
        <LanguageDropdown
          languages={allLanguages}
          selected={selectedLanguages}
          onChange={handleLanguageChange}
        />
      </header>

      {/* Filter bar */}
      <div style={{ flexShrink: 0, padding: '12px 0 8px' }}>
        <FilterBar
          posts={posts}
          activeFilter={activeFilter}
          onFilter={handleFilter}
          showSort={isGrid}
          sortOrder={sortOrder}
          onSort={setSortOrder}
          onBack={goToBubbles}
        />
      </div>

      {/* Grid label */}
      {isGrid && (
        <div style={{
          flexShrink: 0,
          textAlign: 'center',
          fontFamily: "'Courier New', monospace",
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          color: '#a0906a',
          paddingBottom: '4px',
        }}>
          {gridLabel}
        </div>
      )}

      {/* Canvas container — collapses to nothing in grid mode */}
      <div style={{
        flex: showBubbles ? 1 : 0,
        minHeight: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute',
          inset: 0,
          opacity: canvasOpacity,
          transition: 'opacity 0.5s ease',
          pointerEvents: showBubbles ? 'auto' : 'none',
        }}>
          <BubbleCanvas
            posts={filteredPosts}
            onNavigate={navigate}
            visible={showBubbles}
          />
        </div>
      </div>

      {/* Grid / Projects — in normal flow, window scrolls */}
      {gridVisible && (
        <div style={{ animation: 'fadeIn 0.4s ease' }}>
          {isProjects
            ? <ProjectsView projects={PROJECTS} />
            : <GridView posts={filteredPosts} onNavigate={navigate} />
          }
        </div>
      )}

    </div>
  );
}
