# CLAUDE.md — Drilon Maloku Knowledge Garden

Personal website for Drilon Maloku (dentist, programmer, writer). A physics-driven "knowledge garden" where posts bubble up from the bottom of the screen. Built with Astro v6 + React. Content is written locally in Obsidian and published via a desktop script that syncs and pushes to GitHub.

---

## Tech Stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Astro v6 (static) | Zero-JS by default, React islands where needed, fast builds |
| UI | React 19 | Interactive bubble canvas + filter/grid state |
| Physics | Canvas 2D (custom) | 60fps with 14 simultaneous bubbles, deceleration physics |
| Styling | Plain CSS | Custom aesthetic is essential — no Tailwind |
| Fonts | Playfair Display (hero), Georgia (body), Courier New (UI) | From Google Fonts + system fallbacks |
| Content | Markdown files in `src/content/posts/` | Synced from Obsidian vault by publish script |
| Hosting | GitHub Pages | Free, static, no server |
| CI/CD | GitHub Actions | Push to main → deploy |

---

## Project Structure

```
src/
  content/
    posts/               ← Markdown posts (synced from Obsidian vault by publish script)
  content.config.ts      ← Astro v6 content collection schema (glob loader)
  components/
    KnowledgeGarden.jsx  ← Root interactive component (state, transitions, language filter)
    BubbleCanvas.jsx     ← Canvas 2D physics engine
    GridView.jsx         ← Filtered card grid layout
    PostCard.jsx         ← Individual post card
    FilterBar.jsx        ← Top-3 tag pills + more-tags dropdown + sort controls
    LanguageDropdown.jsx ← Language selector popover (filters bubbles + grid)
  lib/
    posts.ts             ← Core data layer: reads posts, resolves wikilinks,
                            enforces bidirectionality, exposes language field
    colors.ts            ← Single source of truth for tag colors + tagsHueOffset()
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

### Obsidian vault location

Posts are written in:
```
/Users/drilon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Skrive/DRILON MALOKU WEBSITE/
```

The publish script (`~/Desktop/Publish Website.command`) syncs `.md` files from this folder into `src/content/posts/` via `rsync`, then commits and pushes.

- Files starting with `_` (e.g. `_template.md`) are excluded by the glob pattern `[!_]*.md`
- Files named `Untitled*` are excluded by the rsync `--exclude="Untitled*"` rule
- Do NOT use a symlink — GitHub Actions can't follow local Mac paths

### Post frontmatter

Every post needs this frontmatter (copy from `_template.md` in the vault):

```yaml
---
title: "Your Post Title"
date: 2026-03-22
type: article
language: english
tags: [dentistry, programming, kosovo]
related: []
---
```

- `title` — displayed in bubbles, cards, article header, and related posts
- `date` — ISO format (YYYY-MM-DD). Posts are sorted newest-first everywhere.
- `type` — controls filter and icon: `article` ◇ | `project` ◆ | `creative` ○ | `note` ▽
- `language` — used by the language selector dropdown. Common values: `english`, `albanian`, `german`. Any string works; unknown languages get a 🌐 icon.
- `tags` — array of lowercase strings. Built-in colors exist for: `dentistry`, `programming`, `projects`, `politics`, `philosophy`, `history`, `creative-writing`, `business`, `kosovo`, `education`, `ai`, `writing`, `medicine`, `language`. Unknown tags get an auto-color derived from the tag name (deterministic hash).
- `related` — leave as `[]`; wikilinks handle connections automatically.

### Linking posts with wikilinks

Use standard Obsidian wikilinks anywhere in the body:

```markdown
As I explored in [[Dentistry and Technology]], the parallels are clear.

See also: [[Kosovo and Identity|my thoughts on identity]]
```

- `[[Post Title]]` — links to the post whose filename or title matches
- `[[Post Title|display text]]` — alias syntax
- Links are **bidirectional**: if A links to B, B's "Connected writings" section also shows A automatically
- Unresolved wikilinks are silently ignored

### Slug derivation

The slug is the **filename without `.md`**, lowercased and slugified by Astro:
- `my-post.md` → `/post/my-post`
- Spaces and special chars in filenames are slugified automatically
- Wikilinks resolve by title (case-insensitive) so renaming files doesn't break links

### Related posts logic (priority order)

1. Wikilinks in body text (bidirectional)
2. Explicit `related: [slug-a, slug-b]` in frontmatter (also bidirectional)
3. Tag overlap (fills remaining slots up to 4)

---

## Data Flow (Build Time)

```
Obsidian vault/*.md
        │  (rsync by publish script)
        ▼
src/content/posts/*.md
        │
        ▼
  getAllPosts() in src/lib/posts.ts
        │
        ├─ getCollection('posts') via Astro glob loader
        ├─ Builds slug + title maps for wikilink resolution
        ├─ Extracts [[wikilinks]] from body
        ├─ Merges wikilinks + frontmatter related[]
        ├─ Enforces bidirectionality (two-pass)
        └─ Returns Post[] sorted newest-first
        │
        ▼
  index.astro → <KnowledgeGarden posts={posts} client:load />
  post/[slug].astro → static HTML per post
```

The `Post` interface (from `src/lib/posts.ts`):

```typescript
interface Post {
  slug: string;
  title: string;
  date: string;           // YYYY-MM-DD
  excerpt: string;        // first ~150 chars of body
  type: 'article' | 'project' | 'creative' | 'note';
  tags: string[];
  language: string;       // e.g. 'english', 'albanian'
  related: string[];      // bidirectional (wikilinks + frontmatter + tag fill)
  wikilinkRelated: string[];
  wikilinks: string[];
}
```

---

## UI Behaviour

### Bubble stream (default)

- Canvas fills the viewport below the header
- Bubbles spawn every ~900ms from 600–1000px below the visible bottom
- Max 14 bubbles on screen simultaneously
- Physics: burst upward fast (vy: −4.5 to −7.0), then decelerate toward a slow drift (−0.4 px/frame terminal velocity via `vy = vy * 0.978 + (−0.4) * 0.022`)
- Horizontal: wobble (sine wave, per-bubble amplitude) + occasional random kick + wall bounce
- Elastic bubble-bubble collision with restitution 0.75
- Color: hue driven by tag count (cool blue-grey → warm gold), ±12° identity offset per post
- Hover: scales up 6%, border brightens
- Click: navigates to `/drilon-maloku-garden/post/[slug]` (base path via `import.meta.env.BASE_URL`)
- Lifecycle: fade in as bubble enters screen, fade out near top edge

### Language filter

- Dropdown below the site description, always visible
- Derives available languages from all posts automatically
- "All languages" = no filter; selecting languages filters both bubbles and grid
- Flags: 🇬🇧 english, 🇦🇱 albanian, 🇩🇪 german, 🇫🇷 french, 🇮🇹 italian; 🌐 for anything else

### Tag filter bar

- Two golden special buttons: ◎ Everything in Bubbles | ≡ Everything in Order
- **Top 3 most-used tags** shown as colored pills
- **`+N` button** opens a floating popover with remaining tags (same bubble-style dropdown as language)
- Selecting a tag switches to grid view filtered by that tag

### Grid view

- Transition: bubbles fade out over 500ms, grid fades in
- CSS Grid: `repeat(auto-fill, minmax(280px, 1fr))`, 16px gap, max-width 1000px
- Sort controls: Newest / Oldest / A→Z / Random
- ◎ Bubbles button returns to stream

### Article page (`/post/[slug]`)

- Statically generated at build time
- Wikilinks in body render as plain text (not `[[...]]`)
- "Connected writings" section shows wikilink-based related posts
- Tag chips link back to `/?filter=tag`

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
Dropdown popover:    rgba(250, 244, 228, 0.97) + blur(14px) + border-radius 16px
```

### Typography

```
Hero name:        Playfair Display, italic, 400 weight
Body text:        Georgia, 17px, 1.75 line-height
UI labels:        Courier New, uppercase, letter-spacing
Bubble titles:    Georgia, bold 700, adapts to bubble radius
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

Single source of truth: `src/lib/colors.ts` → `getTagColor(tag)`.
Unknown tags get a deterministic auto-color from the tag name (no manual update needed).
`tagsHueOffset(tags)` gives ±12° bubble hue variation per post.

---

## Deploy

### Publish script (`~/Desktop/Publish Website.command`)

Double-click to publish. It:
1. `rsync` copies `.md` files from Obsidian vault → `src/content/posts/` (excludes `Untitled*` and `_*`)
2. `git add . && git commit && git push`
3. GitHub Actions builds and deploys to Pages (~1 minute)

### GitHub Actions

`.github/workflows/deploy.yml`: Node 22, `npm ci` → `npm run build` → upload `dist/` → deploy Pages.

### Base path

Site is at `https://drilonmaloku96.github.io/drilon-maloku-garden/`. The base `/drilon-maloku-garden` is set in `astro.config.mjs`. Navigation uses `import.meta.env.BASE_URL` — do not hardcode `/post/...` paths.

### Custom domain (future)

Add `CNAME` to `public/` with the domain, configure DNS accordingly, remove `base` from `astro.config.mjs`.

---

## Development Commands

```bash
npm run dev      # Start dev server at localhost:4321
npm run build    # Production build → dist/
npm run preview  # Preview production build locally
```

---

## Important Constraints

- **No Tailwind** — all styling in `src/styles/global.css` or inline component styles
- **No server runtime** — fully static; all data processing at build time in `posts.ts`
- **No symlinks for content** — GitHub Actions can't resolve local Mac paths; rsync copies actual files
- **Astro v6** — config at `src/content.config.ts` (not `src/content/config.ts`); uses glob loader
- **React islands only** — `index.astro` uses `client:load`; article page is pure static Astro
- **Base path navigation** — always use `import.meta.env.BASE_URL` for internal links in React components
