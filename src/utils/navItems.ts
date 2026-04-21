export type NavKey = 'education' | 'skills' | 'safety';

export const NAV_ITEMS: Array<{ key: NavKey; tags: string[] }> = [
  { key: 'education', tags: ['ai-literacy', 'future-ready'] },
  { key: 'skills', tags: ['tools', 'future-ready'] },
  { key: 'safety', tags: ['parenting', 'protection', 'wellbeing'] },
];
