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

  // On mount, check URL for ?filter=tag from article page tag clicks
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const f = params.get('filter');
    if (f) {
      // Go straight to grid with that tag active
      setShowBubbles(false);
      setActiveFilter(f);
      setGridVisible(true);
      setCanvasOpacity(0);
      // Clean the URL without reloading
      window.history.replaceState({}, '', base + '/');
    }
  }, []);

  const allLanguagesSelected = selectedLanguages.length >= allLanguages.length;

  const filteredPosts = useMemo(() => {
    let list;
    if (activeFilter === 'bubbles' || activeFilter === 'order') {
      list = posts;
    } else {
      list = posts.filter((p) => p.tags?.includes(activeFilter));
    }

    // Apply language filter only when not all languages are selected
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

  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  const navigate = useCallback((path) => {
    window.location.href = base + path;
  }, [base]);

  const goToBubbles = useCallback(() => {
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
    // Bubble view only works with all languages — switch to order if any unchecked
    const allSelected = newSelected.length >= allLanguages.length;
    if (!allSelected && showBubbles) {
      goToGrid('order');
    }
  }, [allLanguages.length, showBubbles, goToGrid]);

  const isGrid = !showBubbles && gridVisible;
  const isProjects = isGrid && activeFilter === 'projects';

  // Label for what's currently shown in grid
  const gridLabel = useMemo(() => {
    if (activeFilter === 'projects') return `Projects (${PROJECTS.length})`;
    if (activeFilter === 'order') return `All posts (${filteredPosts.length})`;
    return `#${activeFilter} (${filteredPosts.length})`;
  }, [activeFilter, filteredPosts.length]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
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
          Welcome to the world of
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
          Dentist. Builder. Writer. Explorer of ideas across borders and disciplines.
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

      {/* Grid label — shown when in grid mode */}
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

      {/* Content area */}
      <div style={{ flex: 1, position: 'relative', overflow: showBubbles ? 'hidden' : 'auto' }}>
        {/* Bubble canvas */}
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

        {/* Grid / Projects view */}
        {gridVisible && (
          <div style={{
            position: 'absolute',
            inset: 0,
            overflowY: 'auto',
            animation: 'fadeIn 0.4s ease',
          }}>
            {isProjects
              ? <ProjectsView projects={PROJECTS} />
              : <GridView posts={filteredPosts} onNavigate={navigate} />
            }
          </div>
        )}
      </div>
    </div>
  );
}
