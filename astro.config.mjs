import astroExpressiveCode from 'astro-expressive-code';
import { copyFile } from 'node:fs/promises';
import mdx from '@astrojs/mdx';
import partytown from '@astrojs/partytown';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';
import pagefind from 'astro-pagefind';
import { defineConfig } from 'astro/config';
import { remarkModifiedTime } from './src/utils/remark-modified-time.mjs';

const sitemapAlias = () => ({
  name: 'sitemap-alias',
  hooks: {
    'astro:build:done': async ({ dir }) => {
      const source = new URL('./sitemap-index.xml', dir);
      const target = new URL('./sitemap.xml', dir);
      await copyFile(source, target);
    },
  },
});

export default defineConfig({
  output: 'static',
  site: 'https://blog.locuno.com',
  trailingSlash: 'always',
  build: {
    concurrency: 6,
  },

  prefetch: {
    defaultStrategy: 'viewport',
  },

  vite: {
    plugins: [tailwindcss()],
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['vi', 'en'],
    routing: {
      prefixDefaultLocale: true,
      redirectToDefaultLocale: false,
    },
  },

  image: {
    responsiveStyles: true,
    layout: 'constrained',
    service: {
      config: {
        jpeg: { mozjpeg: true },
        webp: { effort: 6, alphaQuality: 80 },
        avif: { effort: 4, chromaSubsampling: '4:2:0' },
        png: { compressionLevel: 9 },
      },
    },
    remotePatterns: [{ protocol: 'https', hostname: '*.unsplash.com' }],
  },

  markdown: {
    remarkPlugins: [remarkModifiedTime],
  },

  integrations: [
    astroExpressiveCode({
      themes: ['github-dark', 'github-light'],
      themeCssSelector: (theme) => (theme.type === 'dark' ? '.dark' : ''),
    }),
    sitemap({
      filter: (page) => page !== 'https://blog.locuno.com/' && !page.endsWith('/search/'),
      i18n: {
        defaultLocale: 'en',
        locales: {
          vi: 'vi-VN',
          en: 'en-US',
        },
      },
    }),
    sitemapAlias(),
    mdx(),
    pagefind(),
    partytown({
      config: {
        forward: ['dataLayer.push'],
      },
    }),
    icon({
      include: {
        lucide: ['github', 'globe', 'menu', 'monitor', 'moon', 'rss', 'search', 'sun', 'x'],
      },
    }),
  ],
});
