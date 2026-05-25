# Virtual Qubit Showdown — Ultrametric Tree vs Surface Code

**Interactive web application** demonstrating the advantages of ultrametric computational geometry over traditional surface-code quantum error correction.

🌐 **Live:** [qnfo.github.io/ultrametric-game-of-life](https://qnfo.github.io/ultrametric-game-of-life)
📦 **Repo:** [github.com/QNFO/ultrametric-game-of-life](https://github.com/QNFO/ultrametric-game-of-life)

---

## What This Is

A split-screen, interactive comparison of two quantum error correction encoding schemes:

| Left Panel | Right Panel |
|:-----------|:------------|
| 🌳 **Bruhat-Tits Tree** (ultrametric) | 🔲 **2D Euclidean Grid** (surface code analog) |
| Physical qubits at leaves | Physical qubits on lattice |
| Virtual qubits at internal nodes | Global majority vote |
| Hierarchical majority-vote decoding | Flat decoding |
| Errors geometrically confined to branches | Errors can propagate across entire surface |

Both encode the same logical qubit with the same number of physical qubits, under identical noise. The comparison answers: **does ultrametric geometry actually protect quantum information better?**

## Three Modes

| Mode | What It Does |
|:-----|:-------------|
| 🔬 **Interact** | Manual encode → noise → decode. Step through the QEC pipeline |
| 🧪 **Single Trial** | One-click automated trial on both encodings simultaneously |
| 📊 **Run Experiment** | N trials, live logical error rate comparison, tree-vs-grid advantage ratio |

## Research Backing

All claims backed by published, verified experimental data:

| Claim | Source | DOI |
|:------|:-------|:----|
| Tree d≥3, p_err≤0.40: zero logical errors | Validation paper | `10.5281/zenodo.20134944` |
| Flat encoding at same rate: LER up to 0.152 | Same | Same |
| Energy barrier E(d) = 2^d | Validation + barrier verification | Same |
| Strong triangle inequality: 0 violations in 15,000 trials | Validation paper | Same |
| Tree-vs-repetition LER comparison data | `0.16_qec_results.json` | Same repo |

## Also In This Repo

- **`FORMAL-COMPARISON.md`** — Systematic audit of ultrametric definitions across 8 sources (5 papers, 1 codebase, 1 roadmap, 1 web app). All discrepancies now resolved by the completed "Computational Ultrametricity" project and publication "The Tree Is Real" (DOI: `10.5281/zenodo.20325850`).
- **`test_tree.py`** — Python verification: 12 tree construction test cases, all pass.
- **Legacy code** (`js/tree.js`, `js/game.js`, `js/viz.js`, `js/main.js`) — Original Game of Life v0.1 (archived).

## Technical Stack

- Pure HTML/CSS/JS — no frameworks, no build step
- D3.js v7 — tree layout and SVG rendering
- GitHub Pages — hosted directly from this repository

## Cross-Project Integration

This project is one leg of a three-part argument:

| Leg | Project | Role | DOI |
|:----|:--------|:-----|:----|
| **Thesis** | Convergence, Consilience, and the Hierarchical Architecture of Reality | Narrative claim | `10.5281/zenodo.20302276` |
| **Formalism** | The Tree Distance Cophenetic + Ultrametric Geometry as Common Structure | Mathematical definitions | `10.5281/zenodo.20213043`, `10.5281/zenodo.20265907` |
| **Evidence** | Computational Ultrametricity (8-module pipeline) + This web app | Computational validation + interactive demo | `10.5281/zenodo.20325850` |

## Keyboard Shortcuts

| Key | Action |
|:----|:-------|
| `E` | Encode logical qubit |
| `N` | Inject noise |
| `D` | Decode & compare |
| `T` | Run single trial |
| `X` | Run experiment (N trials) |
| `1` / `2` / `3` | Switch modes |

---

**Author:** Rowan Brad Quni-Gudzinas · ORCID: [0009-0002-4317-5604](https://orcid.org/0009-0002-4317-5604)

---

*Part of the [QWAV research program](https://qnfo.github.io/QWAV/) -- Ultrametric Quantum Computing & AI.*
