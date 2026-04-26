import type { APIRoute } from 'astro';

export const prerender = true;

const getRobotsTxt = (sitemapURL: URL, llmsURL: URL) => `\
User-agent: *
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Perplexity-User
Allow: /

Sitemap: ${sitemapURL.href}
# LLMs: ${llmsURL.href}
`;

export const GET: APIRoute = ({ site, url }) => {
  const base = site ?? url;
  const sitemapURL = new URL('sitemap.xml', base);
  const llmsURL = new URL('llms.txt', base);
  return new Response(getRobotsTxt(sitemapURL, llmsURL), {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600',
    },
  });
};
