import { getCollection, type CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'blog'>;

// Drafts show up in `npm run dev` but never in the built site.
export async function getPosts(): Promise<Post[]> {
  const posts = await getCollection('blog', ({ data }) => import.meta.env.DEV || !data.draft);
  return posts.sort((a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf());
}

export function readingTime(body = ''): number {
  const words = body.replace(/```[\s\S]*?```/g, ' ').split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 220));
}

export function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

export function byYear(posts: Post[]): [number, Post[]][] {
  const groups = new Map<number, Post[]>();
  for (const p of posts) {
    const y = p.data.pubDate.getUTCFullYear();
    groups.set(y, [...(groups.get(y) ?? []), p]);
  }
  return [...groups.entries()];
}

export function formatShort(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', timeZone: 'UTC' });
}

// 2026.10.07, the date format used on listings.
export function formatDot(d: Date): string {
  return d.toISOString().slice(0, 10).replace(/-/g, '.');
}

// "Oct 2026"
export function formatMonth(d: Date): string {
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function category(p: Post): string {
  return p.data.category ?? p.data.tags.slice(0, 2).join(' · ');
}

export const pad = (n: number) => String(n).padStart(2, '0');

// Posts are numbered oldest-first, so a post keeps its number as new ones land.
export function postNumber(p: Post, all: Post[]): number {
  return all.length - all.findIndex((x) => x.id === p.id);
}

export const slugTag = (t: string) => t.toLowerCase().replace(/\s+/g, '-');
