function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function visit(node, callback, index = null, parent = null) {
  callback(node, index, parent);
  if (!node || typeof node !== 'object' || !Array.isArray(node.children)) return;
  node.children.forEach((child, childIndex) => visit(child, callback, childIndex, node));
}

function buildImageUrl(src, width) {
  const url = new URL('/_image/', 'https://astro.invalid');
  url.searchParams.set('href', src);
  url.searchParams.set('w', String(width));
  url.searchParams.set('f', 'avif');
  return url.pathname + url.search;
}

export function remarkRemoteImages() {
  return function transformer(tree) {
    visit(tree, (node, index, parent) => {
      if (!parent || index === null) return;
      if (node?.type !== 'image' || typeof node.url !== 'string') return;
      if (!/^https?:\/\//i.test(node.url)) return;

      const widths = [640, 800, 1080];
      const src = buildImageUrl(node.url, 800);
      const srcset = widths.map((width) => `${buildImageUrl(node.url, width)} ${width}w`).join(', ');

      const attrs = [
        `src="${escapeHtml(src)}"`,
        `srcset="${escapeHtml(srcset)}"`,
        'sizes="(min-width: 1024px) 768px, 100vw"',
        `alt="${escapeHtml(node.alt || '')}"`,
        'loading="lazy"',
        'decoding="async"',
      ];

      if (node.title) {
        attrs.push(`title="${escapeHtml(node.title)}"`);
      }

      parent.children[index] = {
        type: 'html',
        value: `<img ${attrs.join(' ')} />`,
      };
    });
  };
}
