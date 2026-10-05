import { visit } from 'unist-util-visit';

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

// Turn ```mermaid fences into <pre class="mermaid"> so the client script can
// render them, instead of letting Shiki highlight them as plain text.
export function remarkMermaid() {
  return (tree) => {
    visit(tree, 'code', (node) => {
      if (node.lang !== 'mermaid') return;
      node.type = 'html';
      node.value = `<pre class="mermaid" aria-label="Diagram">${escapeHtml(node.value)}</pre>`;
    });
  };
}
