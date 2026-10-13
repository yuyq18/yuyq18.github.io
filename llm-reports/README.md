# LLM technical report reading notes

Published at https://yuyq18.github.io/llm-reports/.

Edit `source/reports.md`, then run (Node.js 20 or newer) `node llm-reports/tools/build.mjs` from the repository root. Commit the source and generated `index.html` together. GitHub Pages serves the generated page without a Node build step.

Styles and navigation behavior live in `assets/style.css` and `assets/app.js`. Formula rendering uses locally bundled KaTeX 0.16.22 (MIT); Markdown generation uses bundled Marked 17.0.5 (MIT). Their licenses are included alongside the components.
