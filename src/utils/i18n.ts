export const SUPPORTED_LANGS = ['vi', 'en'] as const;

export type Lang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';

const localePrefixPattern = new RegExp(`^/(${SUPPORTED_LANGS.join('|')})(?=/|$)`);

export function stripLocalePrefix(pathname: string): string {
  const normalizedPath = pathname.replace(localePrefixPattern, '');
  return normalizedPath || '/';
}
