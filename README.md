# MindPatch

Personal site for Khaled Nassar (MindPatch) — a security-engineer portfolio with
writeups, CVEs, and open-source tooling. Static, no build step.

## Structure

- `index.html` — page shell (home + post views), hash-routed client side
- `assets/style.css` — styles, with automatic light/dark theming
- `assets/posts.js` — the writeup data (`POSTS` array); edit this to add a post
- `assets/app.js` — renders the index and individual posts
- `assets/avatar.jpg` — profile image

## Adding a writeup

Add an entry to the `POSTS` array in `assets/posts.js`:

- Give it a `body` for a short summary + link to the original post, **or**
- Give it a `full` HTML string to render the whole article on this site.

Both `body` and `full` are plain HTML, so they support:

- **Images** — drop the file in `assets/img/` and reference it:
  ```html
  <img src="assets/img/screenshot.png" alt="What it shows">
  ```
  or with a caption:
  ```html
  <figure>
    <img src="assets/img/diagram.png" alt="Request flow">
    <figcaption>The request flow, end to end.</figcaption>
  </figure>
  ```
  Images are auto-sized, centered, and bordered.

- **Mermaid diagrams** — wrap the definition in `<pre class="mermaid">`:
  ```html
  <pre class="mermaid">flowchart LR
    A[Request] --> B[Server] --> C[Response]</pre>
  ```
  They render on load and re-theme automatically for light/dark mode.

## Deploy to GitHub Pages

1. Push these files to a GitHub repo.
2. **Settings → Pages → Build and deployment → Source: Deploy from a branch**,
   pick your branch and the `/ (root)` folder, save.
3. The site publishes at `https://<user>.github.io/<repo>/`.

For a user/organization site, name the repo `<user>.github.io` and it serves at
the root domain. The `.nojekyll` file tells Pages to serve the files as-is.
