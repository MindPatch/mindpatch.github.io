const $ = s => document.querySelector(s);
const byId = Object.fromEntries(POSTS.map(p => [p.id, p]));

// Build the index: newest year first, newest post first within each year.
const groups = {};
[...POSTS].sort((a, b) => b.date.localeCompare(a.date)).forEach(p => {
  (groups[p.y] = groups[p.y] || []).push(p);
});
$("#list").innerHTML = Object.keys(groups).sort((a, b) => b - a).map(y =>
  `<li class="year">${y}</li>` + groups[y].map(p =>
    `<li><span class="date">${p.m}</span><span><a href="#/${p.id}">${p.title}</a>` +
    ((!p.full && p.src !== "mindpatch.net") ? ` <span class="src">${p.src}</span>` : "") +
    `</span></li>`
  ).join("")
).join("");

function isDark() {
  const t = document.documentElement.dataset.theme;
  return t === "dark" || (t !== "light" && matchMedia("(prefers-color-scheme: dark)").matches);
}

function runMermaid() {
  const nodes = [...document.querySelectorAll("#p-body .mermaid")];
  if (!nodes.length || !window.mermaid) return;
  mermaid.initialize({ startOnLoad: false, securityLevel: "strict", theme: isDark() ? "dark" : "default" });
  mermaid.run({ nodes }).catch(() => {});
}

function render() {
  const mt = location.hash.match(/^#\/(.+)$/);
  if (mt && byId[mt[1]]) {
    const p = byId[mt[1]];
    const full = !!p.full;
    $("#p-title").textContent = p.title;
    $("#p-meta").innerHTML = `${p.m}, ${p.y}` +
      (p.cve ? `<span class="tag">${p.cve}</span>` : "") +
      `<span class="tag">${p.tag}</span>`;
    $("#p-body").innerHTML = full ? p.full : p.body;
    const l = $("#p-link");
    l.hidden = full;
    if (!full) {
      l.href = p.url;
      l.textContent = `Read the full writeup on ${p.src} ↗`;
    }
    $("#p-note").textContent = full
      ? "Reproduced from the author's original post. References are listed at the end."
      : "Summary written for this page. Full technical detail, code and screenshots are in the original post.";
    $("#home").hidden = true;
    $("#post").hidden = false;
    window.scrollTo(0, 0);
    document.title = "MindPatch · " + p.title;
    if (full) runMermaid();
  } else {
    $("#post").hidden = true;
    $("#home").hidden = false;
    document.title = "MindPatch";
  }
}

addEventListener("hashchange", render);
if (document.readyState !== "loading") render();
else addEventListener("DOMContentLoaded", render);
