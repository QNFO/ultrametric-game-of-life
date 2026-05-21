# DECISIONS — Ultrametric Game of Life → Virtual Qubit Showdown

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
**Decision:** Interact (manual toggle), Trial (single automated), Experiment (N trials with LER comparison).
**Rationale:** These three modes cover the key research concepts: interactive exploration, single-trial verification, and statistical comparison. Each mode targets a different user persona.
**Alternatives Considered:** Single unified mode. Rejected — would be overwhelming and visually cluttered.

### D4: Dark theme with cyan/green accent colors (2026-05-20)
**Decision:** Dark background (#0a0a1a) with cyan (#06b6d4) and green (#10b981) accents.
**Rationale:** High contrast for data visualization. Color scheme evokes quantum/tech aesthetic. Green = alive/logical |1⟩, dark = dead/logical |0⟩, red = error.
**Alternatives Considered:** Light theme, monochrome. Rejected — dark theme superior for data visualization.

### D5: Pivot from Game of Life to Virtual Qubit Showdown (2026-05-20)
**Decision:** Abandoned cellular automaton focus. Rebuilt as split-screen QEC comparison tool: Bruhat-Tits tree vs surface code grid.
**Rationale:** User directive to "showcase ultrametric virtual qubits" and "visually/interactively demonstrate advantages of ultrametric computational geometry over traditional surface-code QEC." The Game of Life metaphor was fun but didn't directly demonstrate the ultrametric advantage. The QEC comparison does — with actual experimental data backing the claims.
**Alternatives Considered:** Keep Game of Life and add QEC mode. Rejected — would dilute focus. Clean pivot was better for user comprehension.

### D6: Formal Comparison Audit (2026-05-20)
**Decision:** Conducted systematic audit of ultrametric definitions across 8 sources (5 published papers, 1 codebase, 1 roadmap, 1 web app). Documented in FORMAL-COMPARISON.md.
**Rationale:** The user asked "Are there discrepancies or ambiguities in ultrametric definition or operationalization?" A rigorous answer required reading every source and comparing definitions term-by-term. The audit found 1 critical discrepancy, 3 partial discrepancies, and 3 consistent areas.
**Alternatives Considered:** Quick summary without systematic comparison. Rejected — would miss the critical finding that the Convergence Consilience paper contains zero ultrametric formalism.

### D7: Resolution by Computational Ultrametricity Publication (2026-05-22)
**Decision:** All FORMAL-COMPARISON.md discrepancies are now resolved by the completed "Computational Ultrametricity" project (archived at `G:\My Drive\Archive\projects\2026\05\Computational-Ultrametricity\`) and its publication "The Tree Is Real: Computational Validation of Ultrametric Convergence" (DOI: `10.5281/zenodo.20325850`).
**Rationale:** The 8-module computational pipeline implemented every underspecified concept flagged in the audit: coarse-graining (Module 4), cophenetic correlation (ultrametric.py), convergence dynamics (Module 2), and the two-tier citation structure (thesis + formalism + evidence). The publication explicitly distinguishes between the narrative framework (Convergence Consilience paper, DOI: `10.5281/zenodo.20302276`) and the mathematical formalism (Cophenetic paper, DOI: `10.5281/zenodo.20213043`; Geometry paper, DOI: `10.5281/zenodo.20265907`).
**Implications:** The formal comparison audit is now a historical audit trail — documenting how gaps were identified and resolved, not a list of open issues.
