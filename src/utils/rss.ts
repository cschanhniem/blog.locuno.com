import rss from '@astrojs/rss';
import type { Lang } from './i18n';
import { t } from './translations';
import { getPostsForLang, postUrl, type PostEntry } from './posts';
import { LANGUAGE_TAGS } from './seo';

function toItem(entry: PostEntry) {
  const lang = entry.data.locales as Lang;
  return {
    title: entry.data.title,
    description: entry.data.description,
    pubDate: entry.data.updatedDate ?? entry.data.pubDate,
    link: postUrl(entry, lang),
    categories: [entry.data.category, ...entry.data.tags],
  };
}

export async function generateRssForLang(lang: Lang, site: URL, feedPath = `/${lang}/rss.xml`) {
  const items = getPostsForLang(lang).map(toItem);

  const title = `${t(lang, 'site.name')} · ${lang.toUpperCase()}`;
  const description = t(lang, 'site.description');
  const feedUrl = new URL(feedPath, site).href;

  return rss({
    title,
    description,
    site,
    items,
    customData: [
      `<language>${LANGUAGE_TAGS[lang] ?? lang}</language>`,
      `<atom:link href="${feedUrl}" rel="self" type="application/rss+xml" />`,
    ].join(''),
    xmlns: {
      atom: 'http://www.w3.org/2005/Atom',
    },
  });
}
