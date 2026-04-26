import type { Lang } from '@/utils/i18n';

export type LanguageAlternate = {
  hrefLang: string;
  href: string;
};

export type BreadcrumbItem = {
  name: string;
  item: string;
};

export const LANGUAGE_TAGS: Record<Lang, string> = {
  vi: 'vi-VN',
  en: 'en-US',
};

export const OG_LOCALES: Record<Lang, string> = {
  vi: 'vi_VN',
  en: 'en_US',
};

export const DEFAULT_OG_IMAGE = '/open-graph.webp';
export const ORGANIZATION_LOGO = '/icon-full-color.png';

export function absoluteUrl(pathOrUrl: string, site: URL): string {
  return pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')
    ? pathOrUrl
    : new URL(pathOrUrl, site).href;
}

export function canonicalizeUrl(pathOrUrl: string, site: URL): string {
  const url = new URL(pathOrUrl, site);
  if (!url.pathname.endsWith('/') && !url.pathname.split('/').pop()?.includes('.')) {
    url.pathname += '/';
  }
  url.hash = '';
  url.search = '';
  return url.href;
}
