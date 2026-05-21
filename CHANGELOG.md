# CHANGELOG — Ultrametric Game of Life → Virtual Qubit Showdown

---

## 2026-05-22 — Cross-Project Resolution & Final Documentation

**What Changed:** All 7 project management docs updated to reflect complete definition of done. FORMAL-COMPARISON.md resolution appendix added — cross-references completed Computational Ultrametricity project and publication "The Tree Is Real" (DOI: `10.5281/zenodo.20325850`). All 5 discrepancies from the formal audit now resolved.

**Files Changed:**
- `PROJECT STATE.md` — Rewritten: project identity, evolution history, architecture, cross-references
- `SPRINT.md` — Rewritten: 22 tasks across 4 phases, all complete
- `CHANGELOG.md` — This file, updated with full history
- `DECISIONS.md` — Added D5 (Pivot), D6 (Formal Audit), D7 (Resolution)
- `README.md` — Rewritten: dual purpose (web app + formal grounding)
- `BACKLOG.md` — Updated: P1 items marked done, new P3 items
- `FORMAL-COMPARISON.md` — Resolution appendix added

**Git:** Committed on `main`

---

## 2026-05-22 — GitHub Deployment

**What Changed:** Repo pushed to `github.com/QNFO/ultrametric-game-of-life`. Live on GitHub Pages at `qnfo.github.io/ultrametric-game-of-life`.

---

## 2026-05-20 — Virtual Qubit Showdown (v0.2) — Pivot

**What Changed:** Complete pivot from cellular automaton to QEC comparison tool. Split-screen: Bruhat-Tits tree vs surface code grid. Implemented full experiment pipeline: encode → noise → decode with logical error rate tracking. Embedded verified research data from `0.16_qec_results.json` and `0.2_results.json`.

**Files Created:**
- `js/virtual-qubit-engine.js` — BruhatTitsEncoder + SurfaceCodeGrid
- `js/dual-viz.js` — D3 dual visualization (radial tree + 2D grid)
- `js/showdown-main.js` — Controller: 3 modes, experiment runner, verified data
- `css/showdown.css` — Dark quantum theme
- `extract_data.py`, `extract_data2.py` — Data extraction from research repo

**Files Changed:**
- `index.html` — Rewritten: split-screen layout

**Git:** Committed on `feature/initial-setup`

---

## 2026-05-20 — Formal Comparison Audit

**What Changed:** Systematic comparison of ultrametric formal definitions across 8 sources (5 papers, 1 codebase, 1 roadmap, 1 web app). Identified 1 critical discrepancy, 3 partial discrepancies, 3 consistent areas.

**Files Created:**
- `FORMAL-COMPARISON.md` — 9-section audit with recommendations

**Git:** Committed on `feature/initial-setup`

---

## 2026-05-20 — Game of Life v0.1

**What Changed:** Initial complete build. Click-to-toggle leaf states, majority vote propagation, Game of Life mode, Noise Lab mode, D3.js visualization.

**Files Created:**
- `index.html` — Main page with sidebar controls and SVG canvas
- `css/style.css` — Dark theme with cyan/green accents
- `js/tree.js` — Bruhat-Tits tree engine
- `js/game.js` — Game of Life engine (Conway-adapted)
- `js/viz.js` — D3.js tree visualization
- `js/main.js` — Controller (3 modes, keyboard shortcuts)
- `test_tree.py` — Python verification: 12 tree construction cases pass
- All 7 mandatory docs

**Git:** Committed on `feature/initial-setup`

---

## 2026-05-20 — Project Scaffolding (QWAV Handoff)

**What Changed:** Project initialized from QWAV Strategy Program Manager handoff. 7 mandatory docs created. 9 sprint tasks defined.

**Files Created:** `README.md`, `PROJECT STATE.md`, `SPRINT.md`, `CHANGELOG.md`, `BACKLOG.md`, `LEARNINGS.md`, `DECISIONS.md`

**Git:** `feature/initial-setup`, commit `89beb68`
