import type { MarkdownHeading } from 'astro';

/**
 * Slugify a heading's text into a stable anchor id. Mirrors GitHub-style
 * slugs: lowercase, strip diacritics, keep only alphanumerics/space/hyphen,
 * collapse runs of separators into a single hyphen.
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function nodeText(node: any): string {
  if (!node) return '';
  if (node.type === 'text') return node.text || '';
  if (Array.isArray(node.children)) return node.children.map(nodeText).join('');
  return '';
}

/**
 * Extract headings (H2–H4) from a Payload Lexical rich-text root, returning
 * the `MarkdownHeading[]` shape the theme's TableOfContents component expects.
 * Slug generation matches the ids emitted by `RichText.astro`, so anchors line
 * up between the TOC links and the headings in the article body.
 */
export function extractHeadings(content: any): MarkdownHeading[] {
  const children = content?.root?.children;
  if (!Array.isArray(children)) return [];

  const headings: MarkdownHeading[] = [];
  const used = new Set<string>();

  for (const node of children) {
    if (!node || node.type !== 'heading') continue;
    const tag = node.tag || 'h2';
    const depth = Number.parseInt(tag.slice(1), 10);
    if (![2, 3, 4].includes(depth)) continue;

    const text = nodeText(node).trim();
    if (!text) continue;

    const base = slugify(text);
    let slug = base;
    let i = 2;
    while (used.has(slug)) {
      slug = `${base}-${i}`;
      i += 1;
    }
    used.add(slug);

    headings.push({ depth: depth as MarkdownHeading['depth'], slug, text });
  }

  return headings;
}

/**
 * Plain-text rendering of a Lexical rich-text root — used to estimate reading
 * time without markup noise.
 */
export function getPlainText(content: any): string {
  const children = content?.root?.children;
  if (!Array.isArray(children)) return '';
  return children.map(nodeText).join('\n');
}
