import type { APIRoute } from 'astro';
import { getPosts, type Post } from '../../lib/posts';
import { coverPng, tldrPng } from '../../lib/cards';

// /covers/<slug>.png is the generated cover, /covers/<slug>-tldr.png the TL;DR card.
export async function getStaticPaths() {
  const posts = await getPosts();
  return posts.flatMap((post) => [
    { params: { file: post.id }, props: { post, kind: 'cover' } },
    { params: { file: `${post.id}-tldr` }, props: { post, kind: 'tldr' } },
  ]);
}

export const GET: APIRoute = async ({ props }) => {
  const { post, kind } = props as { post: Post; kind: 'cover' | 'tldr' };
  const body = kind === 'cover' ? await coverPng(post) : await tldrPng(post);
  return new Response(new Uint8Array(body), { headers: { 'Content-Type': 'image/png' } });
};
