# CMS Post: Related Posts + "Síguenos" CTA — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a "Related Posts" section (backend `relatedPosts` field with tag-based fallback, max 3) and the existing "Síguenos" CTA to CMS-driven post pages (`PostLayout.astro`).

**Architecture:** Extract the tag-based related-posts selection currently inline in `RelatedPosts.astro` into a reusable helper `getRelatedByTags` in `src/lib/blog.ts`. `PostLayout.astro` resolves the post's manual `relatedPosts` by slug, fills remaining slots with `getRelatedByTags`, renders cards with the existing `BlogCard`, then renders the existing "Síguenos" CTA block copied from `BlogLayout.astro`.

**Tech Stack:** Astro 7, TypeScript, Vitest, Payload CMS REST client (`@/lib/payload-client`).

## Global Constraints

- Show at most **3** related posts.
- Source priority: manual `relatedPosts` field (backend) first, then tag-based fallback.
- If the final result is empty, do NOT render the section.
- Render related cards with the existing `BlogCard` component.
- Reuse i18n keys already present: `blog.relatedPosts`, `blog.followAlong`, `blog.followAlongLead`, `blog.rssFeed`, `blog.emailLabel` (es + en). No new locale keys.
- CTA is the simple `CTA.astro` variant (`variant="default"`, `glow={false}`), no LetterGlitch.
- Respect `prefers-reduced-motion` (use existing `data-reveal` only, no new animation).
- Run `pnpm test` (website) after each task; `pnpm build` at the end.
- Commits use conventional style: `feat(blog): ...`, `refactor(blog): ...`.

---

### Task 1: Add `rankRelatedPosts` + `getRelatedByTags` helpers to `src/lib/blog.ts`

**Files:**
- Modify: `website/src/lib/blog.ts` (append after `collectTags`, line 43)
- Test: `website/src/__tests__/related-posts.test.ts` (create)

**Interfaces:**
- Produces:
  - `rankRelatedPosts(posts: Post[], currentSlug: string, tags: string[]): Post[]` — pure function: filters out `currentSlug`, keeps posts sharing any tag, sorts by match count desc then `publishedAt` desc. Returns unsliced.
  - `getRelatedByTags(currentSlug: string, tags: string[], locale?: string, max?: number): Promise<Post[]>` — returns `[]` when `tags` is empty; otherwise `rankRelatedPosts(...).slice(0, max)`. Default `locale = defaultLocale`, `max = 3`. Catches API errors and returns `[]`.

- [ ] **Step 1: Write the failing test**

Create `website/src/__tests__/related-posts.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import { rankRelatedPosts } from '@/lib/blog';
import type { Post } from '@/lib/payload-types';

function makePost(partial: Partial<Post> & { slug: string }): Post {
  return { id: 1, title: partial.slug, publishedAt: '2026-01-01T00:00:00.000Z', tags: [], ...partial } as Post;
}

const a = makePost({ slug: 'a', tags: [{ id: 1, name: 'voip' } as never], publishedAt: '2026-01-02T00:00:00.000Z' });
const b = makePost({ slug: 'b', tags: [{ id: 1, name: 'voip' }, { id: 2, name: 'redes' } as never], publishedAt: '2026-01-03T00:00:00.000Z' });
const c = makePost({ slug: 'c', tags: [{ id: 2, name: 'redes' } as never], publishedAt: '2026-01-01T00:00:00.000Z' });
const current = makePost({ slug: 'current', tags: [{ id: 1, name: 'voip' } as never] });

describe('rankRelatedPosts', () => {
  it('excludes the current post', () => {
    const result = rankRelatedPosts([a, current, b], 'current', ['voip']);
    expect(result.map((p) => p.slug)).toEqual(['b', 'a']);
  });

  it('orders by number of shared tags first, then by publishedAt desc', () => {
    const result = rankRelatedPosts([a, c, b], 'x', ['voip', 'redes']);
    expect(result.map((p) => p.slug)).toEqual(['b', 'a', 'c']);
  });

  it('drops posts with no shared tags', () => {
    const unrelated = makePost({ slug: 'z', tags: [{ id: 3, name: 'seo' } as never] });
    const result = rankRelatedPosts([a, unrelated], 'x', ['voip']);
    expect(result.map((p) => p.slug)).toEqual(['a']);
  });

  it('returns an empty array when tags is empty', () => {
    expect(rankRelatedPosts([a, b], 'x', [])).toEqual([]);
  });
});
```

Note: tag objects are cast `as never` to satisfy the `Tag` type without importing it — they only need `name`. Alternative if the cast trips the linter: define `{ id: 1, name: 'voip', generateSlug: false, slug: 'voip', updatedAt: '2026-01-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z' }`.

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/__tests__/related-posts.test.ts`
Expected: FAIL — `Cannot find name 'rankRelatedPosts'` / module import error.

- [ ] **Step 3: Implement the helpers**

Append to `website/src/lib/blog.ts`:

```ts
export function rankRelatedPosts(posts: Post[], currentSlug: string, tags: string[]): Post[] {
  if (!tags.length) return []
  return posts
    .filter((post) => post.slug !== currentSlug)
    .filter((post) => (post.tags ?? []).some((t) => tags.includes(getTagName(t))))
    .sort((a, b) => {
      const aMatches = (a.tags ?? []).filter((t) => tags.includes(getTagName(t))).length
      const bMatches = (b.tags ?? []).filter((t) => tags.includes(getTagName(t))).length
      if (bMatches !== aMatches) return bMatches - aMatches
      return (
        (b.publishedAt ? new Date(b.publishedAt).getTime() : 0) -
        (a.publishedAt ? new Date(a.publishedAt).getTime() : 0)
      )
    })
}

export async function getRelatedByTags(
  currentSlug: string,
  tags: string[],
  locale = defaultLocale,
  max = 3,
): Promise<Post[]> {
  if (!tags.length) return []
  try {
    const allPosts = await payload.posts().getAll(locale)
    return rankRelatedPosts(allPosts, currentSlug, tags).slice(0, max)
  } catch {
    return []
  }
}
```

`getTagName`, `payload`, `defaultLocale`, `Post` are already imported in `blog.ts` (see lines 5-9).

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/__tests__/related-posts.test.ts`
Expected: PASS — 4 tests green.

- [ ] **Step 5: Run the full suite + typecheck**

Run: `pnpm test` then `pnpm check`
Expected: 42 tests pass (38 + 4), 0 errors.

- [ ] **Step 6: Commit**

```bash
git add website/src/lib/blog.ts website/src/__tests__/related-posts.test.ts
git commit -m "feat(blog): extract tag-based related posts helpers"
```

---

### Task 2: Refactor `RelatedPosts.astro` to use `getRelatedByTags`

**Files:**
- Modify: `website/src/components/blog/RelatedPosts.astro:15-31`

**Interfaces:**
- Consumes: `getRelatedByTags` from `@/lib/blog` (Task 1).

- [ ] **Step 1: Replace the inline fetch/filter/sort/slice block**

In `RelatedPosts.astro`, replace lines 17-31 (the `allPosts` fetch through `relatedPosts` slice) with:

```astro
const relatedPosts = await getRelatedByTags(currentSlug, tags, locale, maxPosts);
```

- [ ] **Step 2: Update imports**

Change the import on line 4 from:

```astro
import { getPostUrl, getTagName } from '@/lib/blog';
```

to:

```astro
import { getPostUrl, getTagName, getRelatedByTags } from '@/lib/blog';
```

The rest of the file (render block, `BlogCard` props with `getTagName`/`getPostUrl`) stays unchanged. Behavior is identical — the extracted helper reproduces the exact filter/sort/slice.

- [ ] **Step 3: Verify no behavior change**

Run: `pnpm test` then `pnpm check`
Expected: 42 tests pass, 0 errors.

- [ ] **Step 4: Manual smoke test**

With backend (3000) and website (4321) running, open an MDX-tagged route that previously rendered related posts, e.g. `http://localhost:4321/blog/tag/voip` (list) and a CMS post that has shared tags. Confirm related cards still appear. (The MDX `BlogLayout` path is not touched by this task; smoke-test the tag route only as a sanity check.)

- [ ] **Step 5: Commit**

```bash
git add website/src/components/blog/RelatedPosts.astro
git commit -m "refactor(blog): use getRelatedByTags in RelatedPosts"
```

---

### Task 3: Add Related Posts section + "Síguenos" CTA to `PostLayout.astro`

**Files:**
- Modify: `website/src/layouts/PostLayout.astro`

**Interfaces:**
- Consumes:
  - `getRelatedByTags` from `@/lib/blog` (Task 1)
  - `payload.posts().getBySlug(slug, locale)` (existing, `src/lib/payload-client.ts:118`)
  - `CTA` from `@/components/ui/marketing/CTA/CTA.astro` (existing)
  - `BlogCard` from `@/components/blog/BlogCard.astro` (existing)
  - `resolveSocialLinks` from `@/lib/utils` (existing)
  - `siteConfig` (already imported in PostLayout line 12)

**Design decisions (verified against the approved spec):**
- The existing "Volver al Blog" footer stays at the end of the article content column (line 132-137), matching the Astro Rocket example where the back-link precedes Related Posts.
- Related Posts section + CTA are added **after `</article>`** (line 151), before the layout ends.

- [ ] **Step 1: Add imports**

At the top of `PostLayout.astro`, extend the import block:

```astro
import { getBlogBaseUrl, getTagName, getPostUrl, getRelatedByTags } from '@/lib/blog'
import { resolveSocialLinks } from '@/lib/utils'
import BlogCard from '@/components/blog/BlogCard.astro'
import CTA from '@/components/ui/marketing/CTA/CTA.astro'
```

(`getBlogBaseUrl` and `getTagName` are already imported — merge `getRelatedByTags` and `getPostUrl` into that line; `Button`/`Icon` already imported.)

- [ ] **Step 2: Compute related posts in the frontmatter**

After the `breadcrumbs` const (line 66), add:

```astro
const socialLinks = resolveSocialLinks(siteConfig.socialLinks)

// Resolve manual relatedPosts (backend field) to full posts by slug.
const manualRelated: Post[] = []
for (const rel of post.relatedPosts ?? []) {
  if (typeof rel !== 'number' && rel?.slug) {
    const full = await payload.posts().getBySlug(rel.slug, locale)
    if (full) manualRelated.push(full)
  }
}

// Fill remaining slots with tag-based fallback (excludes the post itself
// and anything already picked manually).
const tagRelated = (await getRelatedByTags(post.slug, tags, locale, 3)).filter(
  (p) => !manualRelated.some((m) => m.slug === p.slug),
)

const relatedPosts = [...manualRelated, ...tagRelated].slice(0, 3)
```

`Post` is already imported (line 13). `locale` is a prop (line 31). `tags` already computed (line 34).

- [ ] **Step 3: Render the Related Posts section + CTA**

After the closing `</article>` (line 151), add:

```astro
{relatedPosts.length > 0 && (
  <section class="border-t border-border py-[var(--space-section-sm)]">
    <h2 class="font-display text-2xl font-bold text-foreground mb-[var(--space-stack-lg)] text-center">
      {t('blog.relatedPosts', locale)}
    </h2>
    <div class="mx-auto max-w-6xl px-6 grid gap-[var(--space-stack-lg)] md:grid-cols-2 lg:grid-cols-3">
      {relatedPosts.map((rp) => (
        <BlogCard
          title={rp.title}
          description={rp.excerpt || ''}
          href={getPostUrl(rp, locale)}
          publishedAt={rp.publishedAt ? new Date(rp.publishedAt) : new Date()}
          tags={(rp.tags ?? []).map((t) => getTagName(t))}
          author={rp.populatedAuthors?.[0]?.name || 'Viptel'}
          imageUrl={
            rp.heroImage && typeof rp.heroImage !== 'number'
              ? payload.resolveMediaUrl(rp.heroImage.url ?? '')
              : undefined
          }
        />
      ))}
    </div>
  </section>
)}

<CTA variant="default" size="md" maxWidth="lg" glow={false} data-reveal>
  <h2 slot="heading" class="!text-4xl">{t('blog.followAlong', locale)}</h2>
  <p slot="description" class="!text-lg text-balance">{t('blog.followAlongLead', locale)}</p>
  <div class="flex flex-wrap items-center justify-center gap-3">
    <a
      href="/rss.xml"
      class="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-background px-4 py-2 text-sm font-medium text-brand-700 dark:text-brand-400 transition-colors hover:border-brand-500/80"
    >
      <Icon name="rss" size="sm" />
      {t('blog.rssFeed', locale)}
    </a>
    {socialLinks.map((link) => (
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-background px-4 py-2 text-sm font-medium text-brand-700 dark:text-brand-400 transition-colors hover:border-brand-500/80"
      >
        <Icon name={link.icon} size="sm" />
        {link.label}
      </a>
    ))}
    <a
      href={`mailto:${siteConfig.email}`}
      class="inline-flex items-center gap-2 rounded-full border border-brand-500/40 bg-background px-4 py-2 text-sm font-medium text-brand-700 dark:text-brand-400 transition-colors hover:border-brand-500/80"
    >
      <Icon name="mail" size="sm" />
      {t('blog.emailLabel', locale)}
    </a>
  </div>
</CTA>
```

`getPostUrl` is used here and was added to the `@/lib/blog` import in Step 1.

- [ ] **Step 4: Typecheck**

Run: `pnpm check`
Expected: 0 errors. If `getPostUrl` is missing from imports, add it to the `@/lib/blog` import line.

- [ ] **Step 5: Run tests**

Run: `pnpm test`
Expected: 42 tests pass.

- [ ] **Step 6: Manual verification (backend + website running)**

Open `http://localhost:4321/blog/redes-5g-wifi7` (has 1 manual `relatedPosts` entry) and its EN version `http://localhost:4321/en/blog/redes-5g-wifi7`:
- Related Posts heading "Artículos relacionados" / "Related Posts" renders below the content.
- Manual post (VoIP guide) appears; if fewer than 3, tag-based fallback fills the rest (the post has tags Redes/Conectividad).
- Max 3 cards.
- Below it, the "Síguenos" CTA renders with RSS + social links + mail.
- A CMS post with no manual related posts and few tags still renders CTA; if zero related posts, section is absent but CTA remains.

- [ ] **Step 7: Commit**

```bash
git add website/src/layouts/PostLayout.astro
git commit -m "feat(blog): related posts and follow CTA on CMS post pages"
```

---

### Task 4: Final build verification

**Files:** none (verification only)

- [ ] **Step 1: Full build**

Run: `pnpm build` from `website/`
Expected: Build completes ("Complete!"), no errors. Link validation and content-collection schemas pass.

- [ ] **Step 2: Root build**

Run: `pnpm build` from repo root
Expected: Both `backend` and `website` build without errors.

- [ ] **Step 3: Final test run**

Run: `pnpm test`
Expected: 42 tests pass.

- [ ] **Step 4: Report**

Summarize the three changed files, the verification results (build + 42 tests), and the routes checked.