// Post utility functions
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '@/utils/i18n';
import { SUPPORTED_LANGS } from '@/utils/i18n';
import { categorySlug, tagSlug } from '@/utils/translations';

export type PostEntry = CollectionEntry<'post'>;
export const CATEGORY_KEYS = ['education', 'skills', 'safety', 'ai', 'research'] as const;
export type CategoryKey = (typeof CATEGORY_KEYS)[number];
export const TAG_KEYS = [
  'ai-literacy',
  'parenting',
  'future-ready',
  'protection',
  'wellbeing',
  'tools',
  'deep-dive',
] as const;
export type TagKey = (typeof TAG_KEYS)[number];

const publishedPostsPromise = getCollection('post', (entry) => !entry.data.draft);

export function sortPostsByDate(posts: readonly PostEntry[]): Array<PostEntry> {
  return [...posts].sort(
    (a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime(),
  );
}

export function postSlug(entry: PostEntry, lang: Lang): string {
  const idWithoutExt = entry.id.replace(/\.(md|mdx|markdown)$/i, '');
  return idWithoutExt.replace(new RegExp(`^${lang}/`), '');
}

export function postUrl(entry: PostEntry, lang: Lang): string {
  return `/${lang}/posts/${postSlug(entry, lang)}/`;
}

function imageIdentity(entry: PostEntry): string | undefined {
  const img = entry.data.heroImage as unknown;
  if (typeof img === 'string') return img;
  if (img && typeof img === 'object' && 'src' in img) {
    const src = (img as { src?: unknown }).src;
    if (typeof src === 'string') return src;
  }
  return undefined;
}

function createLangBuckets<K extends string>(
  keys: readonly K[],
): Record<Lang, Record<K, Array<PostEntry>>> {
  return SUPPORTED_LANGS.reduce<Record<Lang, Record<K, Array<PostEntry>>>>(
    (acc, lang) => {
      acc[lang] = keys.reduce<Record<K, Array<PostEntry>>>(
        (bucketAcc, key) => {
          bucketAcc[key] = [];
          return bucketAcc;
        },
        {} as Record<K, Array<PostEntry>>,
      );
      return acc;
    },
    {} as Record<Lang, Record<K, Array<PostEntry>>>,
  );
}

function createLangLists(): Record<Lang, Array<PostEntry>> {
  return SUPPORTED_LANGS.reduce<Record<Lang, Array<PostEntry>>>(
    (acc, lang) => {
      acc[lang] = [];
      return acc;
    },
    {} as Record<Lang, Array<PostEntry>>,
  );
}

function sortPostsByDateInPlace(posts: Array<PostEntry>): void {
  posts.sort((a, b) => new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime());
}

function buildPostIndexes(posts: readonly PostEntry[]) {
  const postsByLang = createLangLists();
  const postsByCategory = createLangBuckets(CATEGORY_KEYS);
  const postsByTag = createLangBuckets(TAG_KEYS);
  const postsByLangAndSlug = SUPPORTED_LANGS.reduce<Record<Lang, Record<string, PostEntry>>>(
    (acc, lang) => {
      acc[lang] = {};
      return acc;
    },
    {} as Record<Lang, Record<string, PostEntry>>,
  );

  for (const post of posts) {
    const lang = post.data.locales as Lang;
    if (!(SUPPORTED_LANGS as readonly string[]).includes(lang)) continue;
    postsByLang[lang].push(post);
    postsByLangAndSlug[lang][postSlug(post, lang)] = post;

    const categoryKey = categorySlug(lang, post.data.category);
    if (categoryKey && categoryKey in postsByCategory[lang]) {
      postsByCategory[lang][categoryKey as CategoryKey].push(post);
    }

    const seenTags = new Set<string>();
    for (const tag of post.data.tags || []) {
      const tagKey = tagSlug(lang, tag);
      if (!tagKey || seenTags.has(tagKey) || !(tagKey in postsByTag[lang])) continue;
      seenTags.add(tagKey);
      postsByTag[lang][tagKey as TagKey].push(post);
    }
  }

  for (const lang of SUPPORTED_LANGS) {
    sortPostsByDateInPlace(postsByLang[lang]);
    for (const key of CATEGORY_KEYS) {
      sortPostsByDateInPlace(postsByCategory[lang][key]);
    }
    for (const key of TAG_KEYS) {
      sortPostsByDateInPlace(postsByTag[lang][key]);
    }
  }

  return { postsByLang, postsByCategory, postsByTag, postsByLangAndSlug };
}

const postIndexes = await publishedPostsPromise.then((posts) => buildPostIndexes(posts));

export function getPublishedPosts(): Promise<Array<PostEntry>> {
  return publishedPostsPromise;
}

export function getPublishedPostsByLang(): Record<Lang, Array<PostEntry>> {
  return postIndexes.postsByLang;
}

export function getPostBySlug(lang: Lang, slug: string): PostEntry | undefined {
  return postIndexes.postsByLangAndSlug[lang]?.[slug];
}

export function getLocalizedPost(source: PostEntry, targetLang: Lang): PostEntry | undefined {
  const sourceLang = source.data.locales as Lang;
  if (sourceLang === targetLang) return source;

  const sameSlug = getPostBySlug(targetLang, postSlug(source, sourceLang));
  if (sameSlug) return sameSlug;

  const targetPosts = postIndexes.postsByLang[targetLang] ?? [];
  const sourceDate = new Date(source.data.pubDate).getTime();
  const sourceCategory = source.data.category;
  const sourceAuthor = source.data.author;
  const sourceFeatured = source.data.featured;
  const sourceImage = imageIdentity(source);
  const sourceTags = new Set(source.data.tags ?? []);

  const sameDate = targetPosts.filter((p) => new Date(p.data.pubDate).getTime() === sourceDate);
  if (sameDate.length === 0) return undefined;

  const scored = sameDate
    .map((candidate) => {
      let score = 0;
      if (candidate.data.category === sourceCategory) score += 3;
      if (candidate.data.author === sourceAuthor) score += 2;
      if (candidate.data.featured === sourceFeatured) score += 1;
      if (imageIdentity(candidate) === sourceImage) score += 2;
      const overlap = (candidate.data.tags ?? []).filter((tag) => sourceTags.has(tag)).length;
      score += overlap;
      return { candidate, score };
    })
    .sort((a, b) => b.score - a.score);

  return scored[0]?.candidate;
}

export function getPostsForLang(lang: Lang): Array<PostEntry> {
  return postIndexes.postsByLang[lang] ?? [];
}

export function getPostsByCategory(lang: Lang, slug: string): Array<PostEntry> {
  const key = categorySlug(lang, slug);
  return key && key in postIndexes.postsByCategory[lang]
    ? postIndexes.postsByCategory[lang][key as CategoryKey]
    : [];
}

export function getPostsByTag(lang: Lang, slug: string): Array<PostEntry> {
  const key = tagSlug(lang, slug);
  return key && key in postIndexes.postsByTag[lang] ? postIndexes.postsByTag[lang][key as TagKey] : [];
}

export function countPostsByCategory(lang: Lang, slug: string): number {
  return getPostsByCategory(lang, slug).length;
}

export function countPostsByTag(lang: Lang, slug: string): number {
  return getPostsByTag(lang, slug).length;
}

export function getLatestPosts(lang: Lang, limit = 3): Array<PostEntry> {
  return getPostsForLang(lang).slice(0, limit);
}

export function getRelatedPosts(
  lang: Lang,
  category: string,
  excludeId?: string,
  limit = 3,
): Array<PostEntry> {
  return getPostsByCategory(lang, category)
    .filter((post) => !excludeId || post.id !== excludeId)
    .slice(0, limit);
}
