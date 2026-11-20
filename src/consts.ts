export const SITE = {
  url: 'https://www.mindpatch.net',
  title: 'MindPatch — Khaled Nassar',
  blogTitle: 'MindPatch Blog',
  description: 'Khaled Nassar (MindPatch) — security engineer.',
  blogDescription: 'Notes on security research, bug hunting, vulnerabilities and Rust by Khaled Nassar (MindPatch).',
  author: 'Khaled Nassar',
  role: 'Security Engineer',
  tagline: 'Sharing his thoughts and stuff.',
  // Homepage. The name is the headline; `bio` is one plain sentence and
  // `facts` fill the ID card next to it (post count and last post date are
  // added automatically).
  hero: {
    label: 'Security research',
    bio: 'Write-ups on malware, supply-chain attacks and container escapes, with the detection rules that come out of them.',
    facts: [
      { k: 'Handle', v: 'MindPatch' },
      { k: 'Role', v: 'Security engineer' },
      { k: 'Focus', v: 'Malware · Supply chain · Containers' },
      { k: 'Detections', v: '2 YARA rules' },
    ],
  },
  twitter: '@mindpatchsec',
  email: 'hello@mindpatch.net',
  ogImage: '/og.png',
  links: [
    { label: 'github', name: 'GitHub', href: 'https://github.com/MindPatch', handle: '@MindPatch' },
    { label: 'medium', name: 'Medium', href: 'https://mindpatch.medium.com/', handle: '@mindpatch' },
    { label: 'twitter', name: 'Twitter', href: 'https://twitter.com/mindpatchsec', handle: '@mindpatchsec' },
    { label: 'linkedin', name: 'LinkedIn', href: 'https://www.linkedin.com/in/knassar702/', handle: 'knassar702' },
    { label: 'email', name: 'Email', href: 'mailto:hello@mindpatch.net', handle: 'Write to me' },
  ],
  sameAs: [
    'https://github.com/MindPatch',
    'https://mindpatch.medium.com/',
    'https://twitter.com/mindpatchsec',
    'https://www.linkedin.com/in/knassar702/',
  ],
};
