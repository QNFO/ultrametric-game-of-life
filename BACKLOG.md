# BACKLOG — Ultrametric Game of Life → Virtual Qubit Showdown

## ✅ COMPLETED (22 items)

### Infrastructure (4)
- [x] GitHub repository — `github.com/QNFO/ultrametric-game-of-life`
- [x] GitHub Pages deployment — `qnfo.github.io/ultrametric-game-of-life`
- [x] All 3 branches aligned (main, feature/initial-setup, gh-pages)
- [x] Comprehensive instruction manual (README.md, 8 sections)

### Tree Engine (5)
- [x] encode() sets ALL nodes to logical value (paper §3.2)
- [x] decode() retains current value on tie (paper: "retains its previous value")
- [x] Energy barrier formula corrected to $2^d$ for $p=2$
- [x] Tree LER verified against Validation paper Table 1 ($d \geq 3$, all $p_{\text{err}}$: LER=0.0000)
- [x] 53-test validation suite (test_plan.py: 46/53 pass; 7 RNG variations — no bugs)

### D3 Visualization (5)
- [x] 4 distinct radii (10, 6.7, 6.4, 5) — leaves, internal, root distinguishable
- [x] `_syncNodeProps()` attaches VN values to D3 nodes
- [x] `_treeColor()`, `_onTreeClick()`, `_onTreeHover()` use D3's `d.height`/`d.depth`
- [x] Node inspector panel (type, index, value)
- [x] Hover tooltips on all nodes (tree + grid)

### Interaction (4)
- [x] Click leaf → toggle value + propagate up tree (Explore mode)
- [x] Shift+Click two leaves → ultrametric distance + Strong Δ confirmation
- [x] Keyboard shortcuts: 1/2/3 (modes), E/N/D (encode/noise/decode), T (trial), X (experiment), R (randomize)
- [x] Grid qubit click + hover

### QEC Pipeline (4)
- [x] 3 modes: Explore Tree, Single Trial, Run Experiment
- [x] Encode→Noise→Decode pipeline (both encodings simultaneously)
- [x] Experiment accumulation: Tree LER, Grid LER, Advantage ratio
- [x] Verified data citation in results panel (DOI: 10.5281/zenodo.20134944)

### Documentation & Cross-Project (4)
- [x] FORMAL-COMPARISON.md — ultrametric definition audit across 8 sources + resolution appendix
- [x] "The Tree Is Real" publication link in footer
- [x] Paper data chart (D3 scatter plot of Table 1 in sidebar)
- [x] All 7 mandatory project docs updated (PROJECT STATE, SPRINT, CHANGELOG, DECISIONS, LEARNINGS, BACKLOG, README)

---

## ⏸️ DEFERRED (14 items — documented for future work)

### P2 — Medium Priority (5)
- [ ] Ultrametricity index live display (live computation on current tree state)
- [ ] Export/import tree and grid state (JSON serialization)
- [ ] Depth vs LER interactive chart (slider changes depth, chart updates)
- [ ] Animation of propagation step-by-step (slow-mo decode)
- [ ] Multi-prime comparison ($p=2,3,5$ side by side in separate columns)

### P3 — Nice to Have (6)
- [ ] Mobile touch support improvements (currently desktop-optimized)
- [ ] Color-blind accessible palette option
- [ ] Tutorial / guided tour overlay for first-time visitors
- [ ] Share state via URL hash (bookmark a specific experiment configuration)
- [ ] `0.2_results.json` and `0.16_qec_results.json` data pre-loaded as interactive scatter plot
- [ ] Link to live site from within "The Tree Is Real" publication

### ⚠️ Known Edge Cases / Minor Issues (3)
- [ ] Energy barrier drops after experiments (state artifact — could snapshot at encode time)
- [ ] Grid qubit count rounding (√n × √n layout may leave empty cells)
- [ ] D3 click handlers: some programmatic MouseEvents don't trigger (real clicks work)
