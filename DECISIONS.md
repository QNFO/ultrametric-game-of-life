# DECISIONS — Ultrametric Tree Game of Life

## Architecture / Design Decisions

### D1: Vanilla JS + D3.js (2026-05-20)
**Decision:** No framework — pure HTML/CSS/JS with D3.js v7 loaded from CDN.
**Rationale:** GitHub Pages deployment requires zero build step. D3.js provides all needed visualization primitives (tree layout, SVG manipulation, zoom/pan). A framework (React, Vue) would add build complexity without meaningful benefit for a single visualization.
**Alternatives Considered:** React + D3, Svelte, Canvas-based rendering. Rejected — build step incompatible with direct GitHub Pages deployment.

### D2: Client-side tree computation (2026-05-20)
**Decision:** All tree algorithms (construction, propagation, distance, energy barrier) run in the browser.
**Rationale:** Tree sizes are bounded (depth ≤ 5 = at most ~363 nodes for p=2). JavaScript can handle this comfortably. No server needed.
**Alternatives Considered:** Pre-compute on server, WASM for performance. Rejected — unnecessary for the scale.

### D3: Three interaction modes (2026-05-20)
**Decision:** Interact (manual toggle), Game of Life (automaton), Noise Lab (error confinement demo).
**Rationale:** These three modes cover the key research concepts: ultrametric distance measurement, hierarchical dynamics, and error confinement. Each mode targets a different user persona (learner, explorer, researcher).
**Alternatives Considered:** Single unified mode with all features always active. Rejected — would be overwhelming and visually cluttered.

### D4: Dark theme with cyan/green accent colors (2026-05-20)
**Decision:** Dark background (#0a0a1a) with cyan (#06b6d4) and green (#10b981) accents.
**Rationale:** The tree visualization benefits from high contrast. The color scheme evokes quantum/tech aesthetic while maintaining readability. Green = alive, dark gray = dead matches Conway's Game of Life conventions.
**Alternatives Considered:** Light theme, monochrome, different accent colors. Rejected — dark theme superior for data visualization.
