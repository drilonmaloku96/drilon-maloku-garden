import { getCollection } from 'astro:content';
export { getTagColor } from './colors';

export interface Post {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  type: 'article' | 'project' | 'creative' | 'note';
  tags: string[];
  related: string[];          // wikilinks + frontmatter, bidirectional (shown on article page)
  wikilinkRelated: string[];  // same as related — kept as explicit alias for article page clarity
  wikilinks: string[];        // raw [[...]] targets found in body
  language: string;
}


export function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function extractWikilinks(body: string): string[] {
  const regex = /\[\[([^\]]+)\]\]/g;
  const links: string[] = [];
  let match;
  while ((match = regex.exec(body)) !== null) {
    const target = match[1].split('|')[0].trim();
    links.push(target);
  }
  return [...new Set(links)];
}

export function stripWikilinks(body: string): string {
  return body.replace(/\[\[([^\]]+)\]\]/g, (_match, inner) => {
    const parts = inner.split('|');
    return parts.length > 1 ? parts[1].trim() : parts[0].trim();
  });
}

function makeExcerpt(body: string): string {
  const cleaned = body
    .replace(/\[\[([^\]]+)\]\]/g, (_m, t) => t.split('|').pop() ?? t)
    .replace(/#{1,6}\s/g, '')
    .replace(/\*{1,2}([^*]+)\*{1,2}/g, '$1')
    .replace(/`[^`]+`/g, '')
    .replace(/\n+/g, ' ')
    .trim();
  return cleaned.length > 150 ? cleaned.slice(0, 150).replace(/\s\S*$/, '') + '…' : cleaned;
}

export async function getAllPosts(): Promise<Post[]> {
  const entries = await getCollection('posts');

  const slugMap = new Map<string, string>();
  const titleMap = new Map<string, string>();

  for (const entry of entries) {
    slugMap.set(entry.id, entry.id);
    const title = (entry.data.title as string) ?? entry.id;
    titleMap.set(title.toLowerCase(), entry.id);
    titleMap.set(titleToSlug(title), entry.id);
  }

  function resolveWikilink(target: string): string | null {
    const lower = target.toLowerCase();
    if (slugMap.has(lower)) return lower;
    if (titleMap.has(lower)) return titleMap.get(lower)!;
    const asSlug = titleToSlug(target);
    if (titleMap.has(asSlug)) return titleMap.get(asSlug)!;
    return null;
  }

  // First pass: gather explicit connections (wikilinks + frontmatter related)
  const posts: Post[] = entries.map((entry) => {
    const body = entry.body ?? '';
    const rawLinks = extractWikilinks(body);
    const frontmatterRelated: string[] = (entry.data.related as string[]) ?? [];

    const wikilinkSlugs = rawLinks
      .map(resolveWikilink)
      .filter((s): s is string => s !== null);

    const allRelated = [...new Set([...frontmatterRelated, ...wikilinkSlugs])].filter(
      (s) => s !== entry.id
    );

    return {
      slug: entry.id,
      title: (entry.data.title as string) ?? entry.id,
      date: entry.data.date
        ? new Date(entry.data.date as string | Date).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0],
      excerpt: makeExcerpt(body),
      type: (entry.data.type as Post['type']) ?? 'article',
      tags: (entry.data.tags as string[]) ?? [],
      language: (entry.data.language as string) ?? 'english',
      related: allRelated,
      wikilinkRelated: allRelated, // will be updated to bidirectional below
      wikilinks: rawLinks,
    };
  });

  // Second pass: enforce bidirectionality
  const relatedMap = new Map<string, Set<string>>();
  for (const post of posts) {
    if (!relatedMap.has(post.slug)) relatedMap.set(post.slug, new Set());
    for (const rel of post.related) {
      relatedMap.get(post.slug)!.add(rel);
      if (!relatedMap.has(rel)) relatedMap.set(rel, new Set());
      relatedMap.get(rel)!.add(post.slug);
    }
  }

  // Apply bidirectional related to both fields
  for (const post of posts) {
    const bidirectional = [...(relatedMap.get(post.slug) ?? new Set())];
    post.related = bidirectional;
    post.wikilinkRelated = bidirectional;
  }

  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

// Returns all unique tags across all posts, sorted by frequency
export async function getAllTags(): Promise<Array<{ tag: string; count: number }>> {
  const posts = await getAllPosts();
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) {
      counts.set(tag, (counts.get(tag) ?? 0) + 1);
    }
  }
  return [...counts.entries()]
    .map(([tag, count]) => ({ tag, count }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag));
}
