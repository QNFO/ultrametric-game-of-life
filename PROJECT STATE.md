# Virtual Qubit Showdown — PROJECT STATE

**For LLM Agents & Future Sessions:** Read this first.
**Last updated:** 2026-05-22 | **Status:** COMPLETE
**Git branch:** `main` | **Remote:** `github.com/QNFO/ultrametric-game-of-life`
**Live:** `https://qnfo.github.io/ultrametric-game-of-life/`

---

## What This Project IS (Definition of Done)

An **interactive web application** demonstrating the advantages of ultrametric computational geometry over traditional surface-code quantum error correction. Split-screen: Bruhat-Tits tree (left) vs 2D Euclidean grid (right), with synchronized noise injection, hierarchical majority-vote decoding, and live logical error rate comparison.

The project also houses a **formal comparison audit** (`FORMAL-COMPARISON.md`) that cross-references ultrametric definitions across 8 sources (5 papers, 1 codebase, 1 roadmap, 1 web app), and a **resolution addendum** documenting how the completed "Computational Ultrametricity" project (archived at `G:\My Drive\Archive\projects\2026\05\Computational-Ultrametricity\`, publication DOI: `10.5281/zenodo.20325850`) resolved every identified discrepancy.

## Evolution

| Phase | Date | Description |
|:------|:-----|:------------|
| **QWAV Handoff** | 2026-05-20 | Initial scaffolding: Game of Life on Bruhat-Tits trees |
| **Game of Life v0.1** | 2026-05-20 | Full cellular automaton: click-to-toggle, propagation, D3 visualization |
| **Formal Audit** | 2026-05-20 | `FORMAL-COMPARISON.md` — 1 critical, 3 partial, 3 consistent discrepancies identified across 8 sources |
| **Virtual Qubit Showdown v0.2** | 2026-05-20 | Complete pivot: split-screen tree vs surface code, experiment pipeline, verified data embedded |
| **Deployment** | 2026-05-22 | Pushed to `github.com/QNFO/ultrametric-game-of-life`, live on GitHub Pages |
| **Resolution** | 2026-05-22 | Computational Ultrametricity project completed — all FORMAL-COMPARISON discrepancies resolved by publication "The Tree Is Real" |

## Architecture

| File | Purpose | Status |
|:-----|:--------|:-------|
| `index.html` | Virtual Qubit Showdown — split-screen app | Live |
| `js/virtual-qubit-engine.js` | Bruhat-Tits encoder + Surface Code grid engine | Live |
| `js/dual-viz.js` | D3 dual visualization (radial tree + 2D grid) | Live |
| `js/showdown-main.js` | Controller — 3 modes, experiment runner, verified data | Live |
| `css/showdown.css` | Dark quantum theme | Live |
| `js/tree.js` | Legacy: original Game of Life tree engine | Archived (v0.1) |
| `js/game.js` | Legacy: original Game of Life engine | Archived (v0.1) |
| `js/viz.js` | Legacy: original D3 single-tree viz | Archived (v0.1) |
| `js/main.js` | Legacy: original controller | Archived (v0.1) |
| `css/style.css` | Legacy: original styles | Archived (v0.1) |
| `FORMAL-COMPARISON.md` | Cross-project audit + resolution appendix | Permanent |
| `test_tree.py` | Python verification: 12 construction cases, all pass | Permanent |

## Key Decisions

1. **Pivot from Game of Life → QEC comparison** — user directive to showcase ultrametric virtual qubits
2. **FORMAL-COMPARISON.md** — systematic audit of ultrametric definitions across the entire knowledge base
3. **Verified data embedding** — actual experimental results from QNFO/ultrametric-error-confinement hardcoded
4. **Two-tier citation structure** — thesis (Convergence Consilience) + formalism (Cophenetic, Geometry) + evidence (this app + Computational Ultrametricity pipeline)

## Prior Work Cross-References

| Source | Role | DOI |
|:-------|:-----|:----|
| Convergence, Consilience, and the Hierarchical Architecture of Reality | Thesis | `10.5281/zenodo.20302276` |
| The Tree Distance Cophenetic | Formalism | `10.5281/zenodo.20213043` |
| Ultrametric Geometry as Common Structure | Formalism | `10.5281/zenodo.20265907` |
| Ultrametric Quantum Computing Foundations | QEC formalism | `10.5281/zenodo.20154557` |
| Validation of Ultrametric Error Confinement | QEC data | `10.5281/zenodo.20134944` |
| The Tree Is Real: Computational Validation | Resolution | `10.5281/zenodo.20325850` |
