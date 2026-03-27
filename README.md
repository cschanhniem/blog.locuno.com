<div align="center">

# Astrology i18n

**A multilingual Astro 6 blog theme for content-first publishing**

[![Astro](https://img.shields.io/badge/Astro-6-BC52EE?logo=astro)](https://astro.build)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Node](https://img.shields.io/badge/Node-%E2%89%A5%2020-339933?logo=node.js)](https://nodejs.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Demo](https://img.shields.io/badge/Live_Demo-astrology.idimi.com-0f172a)](https://astrology.idimi.com)

A polished, responsive Astro theme built for multilingual blogs, editorial sites, and personal publishing. It ships with locale-aware routes, centralized translations, SEO-ready defaults, optimized images, and a clean reading experience out of the box.

<a href="https://pagespeed.web.dev/analysis/https-astrology-yo7bu6q1-edgeone-app/nij513nbyr?form_factor=mobile">
  <img src="public/astrology-i18n-lighthouse-score.svg" alt="Lighthouse Score" width="300" />
</a>

</div>

## Contents

- [Highlights](#highlights)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)
- [Internationalization](#internationalization)
- [Content Authoring](#content-authoring)
- [Configuration](#configuration)
- [Contributing](#contributing)
- [License](#license)

## Highlights

- **Multilingual by design**: language-prefixed routes, centralized dictionaries, and fallback-friendly localization.
- **Content collections**: typed frontmatter for posts, pages, and authors.
- **SEO ready**: canonical URLs, Open Graph tags, JSON-LD, sitemap, and RSS feeds.
- **Fast by default**: optimized images, prefetching, minimal client-side JavaScript, and Pagefind search.
- **Modern stack**: Astro 6, Tailwind CSS 4, MDX, Partytown, and Cloudflare-ready static output.
- **Editorial layout**: built for long-form reading, featured media, and clear content hierarchy.

## Quick Start

### Demo

- Live site: <https://astrology.idimi.com>
- Preview image: `public/screenshot.webp`

### Requirements

- Node.js 20 or newer
- pnpm

### Install

```bash
git clone https://github.com/idimilabs/Astrology-i18n.git
cd Astrology-i18n
pnpm install
```

### Run locally

```bash
pnpm run dev
```

Open [http://localhost:4321](http://localhost:4321) in your browser.

### Build and preview

```bash
pnpm run build
pnpm run preview
```

`pnpm run build` outputs the static site to `dist/`.

### Deploy

The project is configured for static deployment with Wrangler:

```bash
pnpm run deploy
```

## Project Structure

```text
.
├── public/                 # Static assets
├── src/
│   ├── assets/             # Optimized images and media
│   ├── components/         # Reusable UI pieces
│   ├── content/            # Posts, pages, and authors
│   ├── i18n/               # Translation dictionaries
│   ├── layouts/            # Page layouts
│   ├── pages/              # Route definitions
│   ├── styles/             # Global styles
│   ├── utils/              # Helpers and shared logic
│   └── content.config.ts   # Content collections schema
├── astro.config.mjs        # Astro configuration
└── package.json            # Scripts and dependencies
```

## Internationalization

The theme supports 10 locales:

`zh`, `en`, `fr`, `es`, `ru`, `ja`, `ko`, `pt`, `de`, `id`

`en` is the default locale.

### Add a new language

1. Add the locale code to `src/utils/i18n.ts`.
2. Update `src/content.config.ts` if the content schema needs to recognize the locale.
3. Create a matching dictionary in `src/i18n/<lang>.json`.
4. Adjust `astro.config.mjs` if you need sitemap or routing changes.

### Routing behavior

Locale-aware pages live under `src/pages/[lang]/`. If a localized page is missing, you can fall back to the default language while keeping the locale URL structure intact.

## Content Authoring

Posts live in `src/content/posts/[lang]/`. Pages and author profiles follow the same collection-driven pattern.

Example frontmatter:

```yaml
---
title: "The Art of Star Gazing"
description: "A guide to observing the night sky."
pubDate: 2024-03-21
category: "Astronomy"
tags: ["Stars", "Night"]
author: "Astro Learner"
heroImage: "../assets/stars.jpg"
locales: "en"
---
```

Recommended practices:

- Keep titles concise and descriptive.
- Use `description` for search and social previews.
- Add `heroImage` for posts that benefit from a strong visual lead.
- Use `locales` to filter or scope content by language when needed.

## Configuration

### GitHub activity calendar

The author page can show a contribution calendar.

```env
GITHUB_TOKEN=your_personal_access_token
```

- Set `GITHUB_TOKEN` locally for development.
- Add it to your deployment environment if you want live GitHub activity data in production.
- Without the token, the site falls back gracefully.

### Analytics

The project includes Partytown support for performance-friendly analytics. Configure your GTM or analytics IDs in `src/components/analytics`.

### Search

Search is powered by Pagefind and is generated automatically during `pnpm run build`.

### Formatting

Prettier is configured for the codebase.

```bash
pnpm run format
```

## Contributing

Contributions are welcome.

1. Fork the repository.
2. Create a branch for your change.
3. Commit with a clear Conventional Commit message.
4. Open a pull request.

## License

MIT. See [LICENSE](LICENSE) for details.

---

<div align="center">
  <p>Built with care by <a href="https://idimi.com">iDiMi</a></p>
</div>
