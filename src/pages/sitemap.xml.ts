import type { APIRoute } from 'astro';
import { DEFAULT_LANG, SUPPORTED_LANGS, type Lang } from '@/utils/i18n';
import { LANGUAGE_TAGS } from '@/utils/seo';
import {
  getLocalizedPost,
  getPostsByCategory,
  getPostsByTag,
  getPostsForLang,
  getPublishedPosts,
  postUrl,
  CATEGORY_KEYS,
  TAG_KEYS,
  type PostEntry,
} from '@/utils/posts';

export const prerender = true;

const HOME_PAGE_SIZE = 12;
const POSTS_PAGE_SIZE = 20;
const TAXONOMY_PAGE_SIZE = 12;

type Alternate = {
  hrefLang: string;
  href: string;
};

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function absolute(path: string, site: URL): string {
  return new URL(path, site).href;
}

function localizedAlternates(pathForLang: (lang: Lang) => string, site: URL): Array<Alternate> {
  const alternates = SUPPORTED_LANGS.map((lang) => ({
    hrefLang: LANGUAGE_TAGS[lang] ?? lang,
    href: absolute(pathForLang(lang), site),
  }));
  return [
    ...alternates,
    {
      hrefLang: 'x-default',
      href: absolute(pathForLang(DEFAULT_LANG), site),
    },
  ];
}

function postAlternates(entry: PostEntry, site: URL): Array<Alternate> {
  const alternates = SUPPORTED_LANGS.flatMap((lang) => {
    const localizedPost = getLocalizedPost(entry, lang);
    return localizedPost
      ? [
          {
            hrefLang: LANGUAGE_TAGS[lang] ?? lang,
            href: absolute(postUrl(localizedPost, lang), site),
          },
        ]
      : [];
  });
  const defaultPost = getLocalizedPost(entry, DEFAULT_LANG);
  return [
    ...alternates,
    {
      hrefLang: 'x-default',
      href: absolute(
        postUrl(defaultPost ?? entry, defaultPost ? DEFAULT_LANG : (entry.data.locales as Lang)),
        site,
      ),
    },
  ];
}

function urlEntry(loc: string, alternates: Array<Alternate> = [], lastmod?: Date): string {
  const alternateXml = alternates
    .map(
      (alternate) =>
        `<xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hrefLang)}" href="${escapeXml(alternate.href)}"/>`,
    )
    .join('');
  const lastmodXml = lastmod ? `<lastmod>${lastmod.toISOString()}</lastmod>` : '';
  return `<url><loc>${escapeXml(loc)}</loc>${lastmodXml}${alternateXml}</url>`;
}

function paginationCount(total: number, size: number): number {
  return Math.max(1, Math.ceil(total / size));
}

export const GET: APIRoute = async ({ site, url }) => {
  const base = site ?? url;
  const urls: Array<string> = [];

  for (const lang of SUPPORTED_LANGS) {
    urls.push(
      urlEntry(
        absolute(`/${lang}/`, base),
        localizedAlternates((l) => `/${l}/`, base),
      ),
    );
    urls.push(
      urlEntry(
        absolute(`/${lang}/about/`, base),
        localizedAlternates((l) => `/${l}/about/`, base),
      ),
    );
    urls.push(
      urlEntry(
        absolute(`/${lang}/author/`, base),
        localizedAlternates((l) => `/${l}/author/`, base),
      ),
    );
    urls.push(
      urlEntry(
        absolute(`/${lang}/posts/`, base),
        localizedAlternates((l) => `/${l}/posts/`, base),
      ),
    );
    urls.push(
      urlEntry(
        absolute(`/${lang}/category/`, base),
        localizedAlternates((l) => `/${l}/category/`, base),
      ),
    );
    urls.push(
      urlEntry(
        absolute(`/${lang}/tags/`, base),
        localizedAlternates((l) => `/${l}/tags/`, base),
      ),
    );

    const homeLastPage = paginationCount(getPostsForLang(lang).length, HOME_PAGE_SIZE);
    for (let page = 2; page <= homeLastPage; page += 1) {
      urls.push(
        urlEntry(
          absolute(`/${lang}/${page}/`, base),
          localizedAlternates((l) => `/${l}/${page}/`, base),
        ),
      );
    }

    const postsLastPage = paginationCount(getPostsForLang(lang).length, POSTS_PAGE_SIZE);
    for (let page = 2; page <= postsLastPage; page += 1) {
      urls.push(
        urlEntry(
          absolute(`/${lang}/posts/${page}/`, base),
          localizedAlternates((l) => `/${l}/posts/${page}/`, base),
        ),
      );
    }

    for (const category of CATEGORY_KEYS) {
      urls.push(
        urlEntry(
          absolute(`/${lang}/category/${category}/`, base),
          localizedAlternates((l) => `/${l}/category/${category}/`, base),
        ),
      );
      const lastPage = paginationCount(
        getPostsByCategory(lang, category).length,
        TAXONOMY_PAGE_SIZE,
      );
      for (let page = 2; page <= lastPage; page += 1) {
        urls.push(
          urlEntry(
            absolute(`/${lang}/category/${category}/${page}/`, base),
            localizedAlternates((l) => `/${l}/category/${category}/${page}/`, base),
          ),
        );
      }
    }

    for (const tag of TAG_KEYS) {
      urls.push(
        urlEntry(
          absolute(`/${lang}/tags/${tag}/`, base),
          localizedAlternates((l) => `/${l}/tags/${tag}/`, base),
        ),
      );
      const lastPage = paginationCount(getPostsByTag(lang, tag).length, TAXONOMY_PAGE_SIZE);
      for (let page = 2; page <= lastPage; page += 1) {
        urls.push(
          urlEntry(
            absolute(`/${lang}/tags/${tag}/${page}/`, base),
            localizedAlternates((l) => `/${l}/tags/${tag}/${page}/`, base),
          ),
        );
      }
    }
  }

  const posts = await getPublishedPosts();
  for (const post of posts) {
    const lang = post.data.locales as Lang;
    const lastmod = post.data.updatedDate ?? post.data.pubDate;
    urls.push(urlEntry(absolute(postUrl(post, lang), base), postAlternates(post, base), lastmod));
  }

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>` +
      `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">` +
      `${urls.join('')}` +
      `</urlset>`,
    {
      headers: {
        'content-type': 'application/xml; charset=utf-8',
        'cache-control': 'public, max-age=3600',
      },
    },
  );
};
