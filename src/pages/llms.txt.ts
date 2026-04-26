import type { APIRoute } from 'astro';
import { DEFAULT_LANG, SUPPORTED_LANGS, type Lang } from '@/utils/i18n';
import { t } from '@/utils/translations';
import { getPostsForLang, postUrl } from '@/utils/posts';

export const prerender = true;

function sectionForLang(lang: Lang, site: URL): string {
  const posts = getPostsForLang(lang)
    .slice(0, 12)
    .map((post) => {
      const url = new URL(postUrl(post, lang), site).href;
      return `- [${post.data.title}](${url}): ${post.data.description}`;
    })
    .join('\n');

  return `## ${lang.toUpperCase()} content

- Home: ${new URL(`/${lang}/`, site).href}
- Posts RSS: ${new URL(`/${lang}/rss.xml`, site).href}
- Search: ${new URL(`/${lang}/search/`, site).href}

### Recent articles

${posts}`;
}

export const GET: APIRoute = ({ site, url }) => {
  const base = site ?? url;
  const siteName = t(DEFAULT_LANG, 'site.name');
  const description = t(DEFAULT_LANG, 'site.description');
  const body = `# ${siteName}

> ${description}

Locuno publishes bilingual analysis about AI literacy, education, digital wellbeing, future-ready skills, and trustworthy technology adoption.

## Site metadata

- Canonical site: ${new URL('/', base).href}
- Sitemap: ${new URL('/sitemap.xml', base).href}
- Default RSS: ${new URL('/rss.xml', base).href}
- Languages: ${SUPPORTED_LANGS.join(', ')}

${SUPPORTED_LANGS.map((lang) => sectionForLang(lang, base)).join('\n\n')}`;

  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
