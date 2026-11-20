// Build-time PNG cards for posts: the cover (also the Open Graph / Twitter
// image) and the shareable TL;DR card. Laid out with satori, rasterized with
// resvg, in the site's charcoal palette. Nothing here runs in the browser.
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import { SITE } from '../consts';
import { category, formatDate, tldr, type Post } from './posts';

export const CARD_W = 1200;
export const CARD_H = 630;

const C = {
  bg: '#0e0f13',
  soft: '#15161c',
  raised: '#1b1d24',
  border: '#262833',
  borderStrong: '#363946',
  fg: '#cfd2db',
  strong: '#f5f6f9',
  muted: '#989dab',
  faint: '#696d7c',
  accent: '#a9b2ff',
};

const root = process.cwd();
const font = (pkg: string, file: string) => readFileSync(join(root, 'node_modules/@fontsource', pkg, 'files', file));
let fonts: Parameters<typeof satori>[1]['fonts'] | undefined;
function loadFonts() {
  fonts ??= [
    { name: 'Inter', data: font('inter', 'inter-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'Inter', data: font('inter', 'inter-latin-500-normal.woff'), weight: 500, style: 'normal' },
    { name: 'Inter', data: font('inter', 'inter-latin-600-normal.woff'), weight: 600, style: 'normal' },
    { name: 'JetBrains Mono', data: font('jetbrains-mono', 'jetbrains-mono-latin-400-normal.woff'), weight: 400, style: 'normal' },
    { name: 'JetBrains Mono', data: font('jetbrains-mono', 'jetbrains-mono-latin-600-normal.woff'), weight: 600, style: 'normal' },
  ];
  return fonts;
}

let avatar: string | undefined;
const avatarSrc = () => (avatar ??= `data:image/jpeg;base64,${readFileSync(join(root, 'public/images/avatar.jpg')).toString('base64')}`);

// A dot grid over the right side of the card. A few dots, picked from a hash
// of the post's slug, are lit in the accent colour, so every post gets its
// own quiet fingerprint (the same pixel language as the favicon).
function pattern(seed: string, w = CARD_W, h = CARD_H): string {
  const bytes = createHash('sha256').update(seed).digest();
  const bit = (i: number) => (bytes[(i >> 3) % bytes.length] >> (i & 7)) & 1;
  const step = 30;
  const cols = Math.floor(w / step);
  const rows = Math.floor(h / step);
  const start = Math.floor(cols * 0.52);
  // The lit glyph: a 7x7 symmetric block, like an identicon, top right.
  const gx = cols - 9;
  const gy = 2;
  const lit = new Set<string>();
  for (let y = 0; y < 7; y++) for (let x = 0; x < 4; x++) if (bit(y * 4 + x)) { lit.add(`${gx + x},${gy + y}`); lit.add(`${gx + 6 - x},${gy + y}`); }
  let dots = '';
  for (let y = 0; y < rows; y++) {
    for (let x = start; x < cols; x++) {
      const cx = x * step + step / 2;
      const cy = y * step + step / 2;
      // Fade the grid in from the text side.
      const t = (x - start) / (cols - start);
      if (lit.has(`${x},${y}`)) {
        dots += `<rect x="${cx - 5}" y="${cy - 5}" width="10" height="10" rx="1.5" fill="${C.accent}" fill-opacity="${(0.55 + 0.35 * bit(x * 7 + y)).toFixed(2)}"/>`;
      } else {
        dots += `<circle cx="${cx}" cy="${cy}" r="1.6" fill="${C.borderStrong}" fill-opacity="${(0.25 + 0.75 * t).toFixed(2)}"/>`;
      }
    }
  }
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${dots}</svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

// Tiny hyperscript for satori's element tree.
type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, ...children: unknown[]): Node => ({
  type,
  props: { style: { display: 'flex', ...style }, children: children.length === 1 ? children[0] : children },
});
const img = (src: string, style: Record<string, unknown>): Node => ({ type: 'img', props: { src, style } });

const host = new URL(SITE.url).host.replace(/^www\./, '');

function footer(post: Post): Node {
  return h('div', { alignItems: 'center', justifyContent: 'space-between', width: '100%' },
    h('div', { alignItems: 'center', gap: 16 },
      img(avatarSrc(), { width: 44, height: 44, borderRadius: 10 }),
      h('div', { flexDirection: 'column' },
        h('div', { fontSize: 22, fontWeight: 600, color: C.strong }, SITE.author),
        h('div', { fontSize: 17, fontFamily: 'JetBrains Mono', color: C.muted }, formatDate(post.data.pubDate)),
      ),
    ),
    h('div', { fontSize: 19, fontFamily: 'JetBrains Mono', color: C.muted }, host),
  );
}

function frame(seed: string, ...children: Node[]): Node {
  return h('div', { position: 'relative', width: CARD_W, height: CARD_H, backgroundColor: C.bg, fontFamily: 'Inter', color: C.fg },
    img(pattern(seed), { position: 'absolute', top: 0, left: 0, width: CARD_W, height: CARD_H }),
    // A hairline accent along the top edge, like the TOC's current marker.
    h('div', { position: 'absolute', top: 0, left: 72, width: 96, height: 3, backgroundColor: C.accent }),
    h('div', { position: 'absolute', top: 60, left: 72, width: CARD_W - 144, height: CARD_H - 112, flexDirection: 'column', justifyContent: 'space-between' },
      ...children,
    ),
  );
}

const kicker = (text: string) =>
  h('div', { fontFamily: 'JetBrains Mono', fontSize: 20, fontWeight: 600, letterSpacing: 2.5, textTransform: 'uppercase', color: C.accent }, text);

function coverTree(post: Post): Node {
  const { title, tags } = post.data;
  const size = title.length > 70 ? 54 : title.length > 45 ? 62 : 70;
  return frame(post.id,
    h('div', { flexDirection: 'column', gap: 26, maxWidth: 820 },
      kicker(category(post) || 'Writing'),
      h('div', { fontSize: size, fontWeight: 600, lineHeight: 1.12, letterSpacing: -1.8, color: C.strong }, title),
      h('div', { flexWrap: 'wrap', gap: 10, marginTop: 6 },
        ...tags.slice(0, 5).map((t) =>
          h('div', { padding: '4px 14px', border: `1px solid ${C.border}`, borderRadius: 999, backgroundColor: C.raised, fontFamily: 'JetBrains Mono', fontSize: 17, color: C.muted },
            h('span', { color: C.faint }, '#'), t),
        ),
      ),
    ),
    footer(post),
  );
}

function tldrTree(post: Post): Node {
  const points = tldr(post);
  const long = points.join(' ').length > 260;
  return frame(`${post.id}:tldr`,
    h('div', { flexDirection: 'column', gap: 20, maxWidth: 830 },
      h('div', { alignItems: 'center', gap: 18 },
        h('div', { padding: '5px 12px', borderRadius: 6, backgroundColor: C.accent, color: C.bg, fontFamily: 'JetBrains Mono', fontSize: 19, fontWeight: 600, letterSpacing: 1 }, 'TL;DR'),
        h('div', { fontSize: 22, fontWeight: 500, color: C.muted, maxWidth: 700 }, post.data.title),
      ),
      h('div', { flexDirection: 'column', gap: long ? 10 : 16, marginTop: 6 },
        ...points.slice(0, 5).map((p) =>
          h('div', { gap: 18, fontSize: long ? 23 : 28, lineHeight: 1.36, color: C.strong },
            h('div', { width: 8, height: 8, marginTop: long ? 12 : 15, flexShrink: 0, borderRadius: 2, backgroundColor: C.accent }),
            h('div', { flex: 1 }, p),
          ),
        ),
      ),
    ),
    footer(post),
  );
}

async function png(tree: Node): Promise<Buffer> {
  const svg = await satori(tree as never, { width: CARD_W, height: CARD_H, fonts: loadFonts() });
  return new Resvg(svg, { fitTo: { mode: 'width', value: CARD_W } }).render().asPng();
}

export const coverPng = (post: Post) => png(coverTree(post));
export const tldrPng = (post: Post) => png(tldrTree(post));

// Where a post's cards are published.
export const coverPath = (post: Post) => `/covers/${post.id}.png`;
export const tldrPath = (post: Post) => `/covers/${post.id}-tldr.png`;
