export const SUPPORTED_LANGS = ['vi', 'en'] as const;

export type Lang = (typeof SUPPORTED_LANGS)[number];

export const DEFAULT_LANG: Lang = 'en';
