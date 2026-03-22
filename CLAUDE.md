# CLAUDE.md — Drilon Maloku Knowledge Garden

Personal website for Drilon Maloku (dentist, programmer, writer). A physics-driven "knowledge garden" where posts bubble up from the bottom of the screen. Built with Astro v6 + React. Content is written locally in Obsidian and published by pushing to GitHub.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro v6 (static) | Zero-JS by default, React islands where needed, fast builds |
| UI | React 19 | Interactive bubble canvas + filter/grid state |
| Physics | Canvas 2D (custom) | Smooth 60fps with 15+ simultaneous bubbles |
| Styling | Plain CSS | Custom aesthetic is essential — no Tailwind |
| Fonts | Playfair Display (hero), Georgia (body), Courier New (UI) | From Google Fonts + system fallbacks |
| Content | Markdown files in `src/content/posts/` | Local Obsidian vault workflow |
| Hosting | GitHub Pages | Free, static, no server |
| CI/CD | GitHub Actions | Push to main → deploy |

---

## Project Structure

```
src/
  content/
    posts/               ← All Markdown posts live here (Obsidian vault)
  content.config.ts      ← Astro v6 content collection schema (glob loader)
  components/
    KnowledgeGarden.jsx  ← Root interactive component (state, transitions)
    BubbleCanvas.jsx     ← Canvas 2D physics engine
    GridView.jsx         ← Filtered card grid layout
    PostCard.jsx         ← Individual post card
    FilterBar.jsx        ← Filter buttons + sort controls
  lib/
    posts.ts             ← Core data layer: reads posts, resolves wikilinks,
                            enforces bidirectionality, fills tag suggestions
  pages/
    index.astro          ← Landing page (mounts KnowledgeGarden as React island)
    post/[slug].astro    ← Statically generated article page per post
  styles/
    global.css           ← All styles (article content, tag chips, animations)
public/
  favicon.svg
  textures/noise.svg     ← SVG noise for papyrus background texture
.github/
  workflows/deploy.yml   ← GitHub Actions: push to main → Pages deploy
astro.config.mjs
src/content.config.ts
```

---

## Content Authoring (Obsidian → Website)

### Post frontmatter

Every post needs this frontmatter:

```yaml
---
title: "Your Post Title"
date: 2026-03-22
type: article        # article | project | creative | note
tags: [dentistry, programming, kosovo]
---
```

- `title` — displayed in bubbles, cards, article header, and related posts
- `date` — ISO format (YYYY-MM-DD). Posts are sorted newest-first everywhere.
- `type` — controls which filter tab shows the post and which icon (◆ project, ◇ article, ○ creative, ▽ note)
- `tags` — array of lowercase strings. Built-in colors exist for: `dentistry`, `programming`, `projects`, `politics`, `philosophy`, `history`, `creative-writing`, `business`, `kosovo`, `education`, `ai`, `writing`, `medicine`. Unknown tags get a neutral grey color automatically.

### Linking posts with wikilinks

Use standard Obsidian wikilinks anywhere in the body:

```markdown
As I explored in [[Dentistry and Technology]], the parallels are clear.

See also: [[Kosovo and Identity|my thoughts on identity]]
```

- `[[Post Title]]` — links to the post whose filename or title matches
- `[[Post Title|display text]]` — alias syntax; the display text is shown in the rendered article, but the link still resolves to the target post
- Links are **bidirectional**: if A links to B, then B's "You might also enjoy" section also shows A — without you needing to add anything to B.
- Wikilinks are resolved by matching against: exact filename slug, exact title (case-insensitive), or slug form of title.
- Unresolved wikilinks (pointing to non-existent posts) are silently ignored.

### Slug derivation

The slug is the **filename without `.md`**:
- `cephalometric-ai.md` → slug `cephalometric-ai` → URL `/post/cephalometric-ai`
- Keep filenames lowercase with hyphens, matching Obsidian convention.
- If you rename a file, any wikilinks pointing to it by title will still resolve correctly (title matching is case-insensitive).

### Related posts logic (priority order)

1. Wikilinks in body text (bidirectional)
2. Explicit `related: [slug-a, slug-b]` in frontmatter (also bidirectional)
3. Tag-based suggestions (posts sharing the most tags) — fills up to 4 total

The "You might also enjoy" section shows max 4 posts.

---

## Data Flow (Build Time)

```
src/content/posts/*.md
        │
        ▼
  getAllPosts() in src/lib/posts.ts
        │
        ├─ Reads all entries via getCollection('posts')
        ├─ Builds slug map + title map for wikilink resolution
        ├─ Extracts [[wikilinks]] from body text
        ├─ Merges wikilinks + frontmatter related[]
        ├─ Enforces bidirectionality (two-pass)
        ├─ Fills remaining slots with tag suggestions (up to 4)
        └─ Returns Post[] sorted newest-first
        │
        ▼
  index.astro → passes posts[] to <KnowledgeGarden client:load />
  post/[slug].astro → renders each post as static HTML
```

The `Post` interface (from `src/lib/posts.ts`):

```typescript
interface Post {
  slug: string;       // filename without .md
  title: string;      // from frontmatter
  date: string;       // ISO date string (YYYY-MM-DD)
  excerpt: string;    // first ~150 chars of body, stripped of markdown
  type: 'article' | 'project' | 'creative' | 'note';
  tags: string[];     // from frontmatter
  related: string[];  // resolved slugs (wikilinks + frontmatter + tag fill)
  wikilinks: string[]; // raw [[...]] targets found in body
}
```

---

## UI Behaviour

### Bubble stream (default / "All" filter)

- Canvas fills the viewport below the header
- Bubbles spawn every ~2 seconds from the bottom, cycle through all posts in shuffled order
- Max 15 bubbles on screen simultaneously
- Physics: upward drift (vy: -0.3 to -0.5), horizontal wobble (sine wave), soft bubble-bubble repulsion, wall bounce
- Appearance: radial gradient fill (warm golden hue, hsla 28–60), thin border, specular highlight in upper-left quadrant
- Hover: scales up 8%, border brightens, cursor becomes pointer
- Click: navigates to `/post/[slug]`
- Lifecycle: fade in (0→1 opacity over ~2s), fade out when within 40px of top edge, removed when opacity hits 0

### Grid view (any filter except "All")

- Transition: bubbles fade out over 500ms, canvas unmounts, grid fades + slides in
- CSS Grid: `repeat(auto-fill, minmax(280px, 1fr))`, 16px gap, max-width 1000px centered
- Cards stagger-animate in (40ms delay between each)
- Sorting: Newest / Oldest / A→Z / Random (pill buttons below filter bar)
- "↑ Stream" returns to bubble mode

### Article page (`/post/[slug]`)

- Statically generated at build time
- Full Markdown rendered via Astro's `<Content />` component
- Wikilinks in body are rendered as plain text (the link target text, not `[[...]]`)
- Tag chips at top — clicking a tag navigates back to `/` (filter by that type is not implemented for tags, only for types)
- "You might also enjoy" section: up to 4 related posts
- "← Back to stream" link returns to homepage

---

## Visual Design

### Color palette

```
Background gradient: #f5eed5 → #ece3c8 → #e8ddc0 (170deg, fixed attachment)
Noise texture:       /public/textures/noise.svg, opacity 0.04 via body::before
Text primary:        #2a2318
Text secondary:      #6a5d45
Text tertiary:       #a0906a
Gold accent:         #c4a050
UI borders:          rgba(200, 180, 140, 0.3)
Glass card fill:     rgba(255, 255, 255, 0.45) + backdrop-filter: blur(8px)
```

### Typography

```
Hero name:        Playfair Display, italic, 400 weight
Body text:        Georgia, 17px, 1.75 line-height
UI labels:        Courier New, uppercase, letter-spacing
Bubble titles:    Georgia, 11–13px (adapts to bubble radius)
Tag chips:        Courier New, 11px, lowercase
```

### Type icons

```
◆  project
◇  article
○  creative
▽  note
```

### Tag colors

Defined in `TAG_COLORS` in `src/lib/posts.ts` and duplicated in `src/components/PostCard.jsx`. If you add a new tag that needs a specific color, add it to both locations. Unknown tags fall back to neutral grey `#a09682`.

To add a new tag color, add an entry to `TAG_COLORS` in both files:
```typescript
mytag: { bg: 'rgba(R,G,B,0.10)', text: '#hexcolor' },
```

---

## Adding New Features

### Adding a new post type

1. Add the value to the `type` enum in `src/content.config.ts`
2. Add the type icon to `TYPE_ICONS` in `BubbleCanvas.jsx`, `PostCard.jsx`, and `post/[slug].astro`
3. Add a filter button in `FilterBar.jsx` (the `FILTERS` array)
4. Update the `Post` interface type union in `src/lib/posts.ts`

### Changing the site URL

Update `site` in `astro.config.mjs`:
```js
export default defineConfig({
  site: 'https://yournewdomain.com',
  ...
});
```

### Changing bubble physics

All physics constants are at the top of `BubbleCanvas.jsx`:
- `MAX_BUBBLES` — maximum simultaneous bubbles (default 15)
- `SPAWN_INTERVAL` — milliseconds between spawns (default 2000)
- `vy` range: `randomBetween(0.3, 0.5)` — upward speed
- `vx` range: `randomBetween(-0.15, 0.15)` — horizontal drift
- Wobble amplitude: controlled by `Math.sin(b.wobbleOffset) * 0.008`
- Collision force: `(minDist - dist) / minDist * 0.3`
- Radius range: `randomBetween(55, 85)`

---

## Deploy

### GitHub Actions

`.github/workflows/deploy.yml` runs on every push to `main`:
1. `npm ci`
2. `npm run build`
3. Uploads `dist/` to GitHub Pages

### Setup (one-time)

1. Create a GitHub repo
2. Push this project to `main`
3. Go to repo Settings → Pages → Source: **GitHub Actions**
4. Push any commit to trigger first deploy

### Custom domain

Add a `CNAME` file to `public/`:
```
yourdomain.com
```
Then configure your DNS: CNAME `www` → `yourusername.github.io`, and A records for the apex domain pointing to GitHub's IPs.

---

## Development Commands

```bash
npm run dev      # Start dev server at localhost:4321 (hot reload)
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

---

## Important Constraints

- **No Tailwind** — all styling is in `src/styles/global.css` or inline styles in components. Do not add Tailwind.
- **No server-side runtime** — this is a fully static site. No API routes, no server endpoints, no databases. All data processing happens at build time in `src/lib/posts.ts`.
- **No admin panel** — post metadata (tags, type, related) lives in the Markdown frontmatter. Editing is done directly in Obsidian.
- **Astro v6 content collections** — the config file is `src/content.config.ts` (not `src/content/config.ts`). The collection uses `glob` loader, not the legacy `type: 'content'` API.
- **React islands only** — `index.astro` uses `client:load` for `KnowledgeGarden`. The article page (`post/[slug].astro`) is pure static Astro — no React needed there.
- **No RSS / Substack** — content is local-only. There is no RSS fetching, no `sanitize-html`, no external content sources.
