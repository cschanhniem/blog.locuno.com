export type NavKey = 'education' | 'skills' | 'safety' | 'research';

export const NAV_ITEMS: Array<{ key: NavKey; href: string; tags: string[] }> = [
  { key: 'education', href: '/category/education/', tags: ['ai-literacy', 'future-ready'] },
  { key: 'skills', href: '/category/skills/', tags: ['tools', 'future-ready'] },
  { key: 'safety', href: '/category/safety/', tags: ['parenting', 'protection', 'wellbeing'] },
  { key: 'research', href: '/category/research/', tags: [] },
];
