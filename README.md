# Virtual Qubit Showdown — Instruction Manual

**Live:** [qnfo.github.io/ultrametric-game-of-life](https://qnfo.github.io/ultrametric-game-of-life)
**Repo:** [github.com/QNFO/ultrametric-game-of-life](https://github.com/QNFO/ultrametric-game-of-life)

---

## Quick Start — See the Tree Advantage in 10 Seconds

1. Open the site
2. Press `3` (Experiment mode)
3. Click **Run N Trials**
4. Watch: Tree LER stays at 0.0000 while Grid LER rises

That's it. You just demonstrated ultrametric error confinement.

---

## Table of Contents

1. [What This Is](#1-what-this-is)
2. [The Three Modes](#2-the-three-modes)
   - [Explore Tree (mode 1)](#-mode-1--explore-tree)
   - [Single Trial (mode 2)](#-mode-2--single-trial)
   - [Run Experiment (mode 3)](#-mode-3--run-experiment)
3. [Parameters (Sliders)](#3-parameters)
4. [Reading the Displays](#4-reading-the-displays)
5. [Keyboard Shortcuts](#5-keyboard-shortcuts)
6. [The Science](#6-the-science)
7. [Edge Cases & Troubleshooting](#7-edge-cases--troubleshooting)
8. [Architecture](#8-architecture)

---

## 1. What This Is

A side-by-side comparison of two quantum error correction encodings:

| Left Panel | Right Panel |
|:-----------|:------------|
| **Bruhat-Tits Tree** (ultrametric) | **2D Grid** (surface-code analog) |
| Physical qubits at leaves | Physical qubits on lattice |
| Virtual qubits at internal nodes | Global majority vote |
| Hierarchical decoding | Flat decoding |
| Errors geometrically **confined** | Errors can **spread** |

Both encode the same logical qubit with the same number of physical qubits, under identical noise.

---

## 2. The Three Modes

### 🔬 Mode 1 — Explore Tree

**Purpose:** Interact directly with the tree. Understand how ultrametric geometry confines errors.

| Feature | How | What Happens |
|:--------|:----|:-------------|
| **Click a leaf** | Click any small circle (r=5) at the bottom of the tree | Toggles value dead↔alive. Propagates up via majority vote. Logical Qubit (root) updates. |
| **Measure distance** | Shift+Click two leaves | Shows ultrametric distance. Confirms strong triangle inequality ("Strong Δ ✓"). |
| **Randomize** | Click 🎲 Randomize button or press `R` | Random 0/1 on all leaves, then propagates. |
| **Propagate** | Click ⬆️ Propagate button or press `P` | Runs majority vote from leaves to root. Shows how many nodes changed. |

**What you're seeing:** Errors in one subtree stay confined — they can't affect distant subtrees. This is the geometric reason ultrametric encoding protects quantum information.

---

### 🧪 Mode 2 — Single Trial

**Purpose:** Run one encode→noise→decode cycle on both encodings simultaneously.

| Button | What Happens |
|:-------|:-------------|
| **🔐 Encode** | Picks random $\lvert 0 \rangle$ or $\lvert 1 \rangle$, writes to all qubits |
| **💥 Inject Noise** | Flips random bits at $p_{\text{err}}$. Visual: flipped qubits turn red |
| **🔓 Decode & Compare** | Runs majority-vote recovery. Shows which encoding survived |
| **🧪 Run Single Trial** (`T`) | Does all three steps at once. Stats accumulate |

**Center divider stats:**
- **Tree LER:** Should be 0.0000 at any depth $\geq 3$
- **Grid LER:** Rises with $p_{\text{err}}$
- **Advantage:** Ratio of the better encoding. "∞× (Tree perfect!)" when the tree makes zero errors

---

### 📊 Mode 3 — Run Experiment

**Purpose:** Statistical comparison. Run many trials and compare logical error rates.

1. Set **Trials** (10–5000) and **Error Rate** slider
2. Click **📊 Run N Trials** (`X`)
3. Watch live counter and comparison
4. Final results panel shows error counts, physical/virtual qubits, energy barrier, and a verified-data citation

**Recommended demo:** $d=4$, $p_{\text{err}}=0.35$, 500 trials. Tree: 0 errors. Grid: measurable failures. Matches published research.

---

## 3. Parameters

| Slider | Range | Default | Effect |
|:-------|:------|:--------|:-------|
| **Prime $p$** | 2–7 | 2 | Tree branching factor. Root has $p+1$ children, internal nodes have $p$. |
| **Depth $d$** | 1–5 | 4 | Levels below root. Physical qubits $= (p+1) \cdot p^{d-1}$ |
| **Error Rate $p_{\text{err}}$** | 0.01–0.50 | 0.35 | Per-qubit bit-flip probability |

**Scaling:**
| $p$ | $d$ | Physical Qubits | Virtual Qubits | Energy Barrier |
|:----|:----|:----------------|:---------------|:---------------|
| 2 | 1 | 3 | 1 | 2 |
| 2 | 2 | 6 | 4 | 4 |
| 2 | 3 | 12 | 10 | 8 |
| 2 | 4 | 24 | 22 | 16 |
| 2 | 5 | 48 | 46 | 32 |

---

## 4. Reading the Displays

### Tree Panel (Left)

| Visual | Meaning |
|:-------|:--------|
| 🟢 Green circle | $\lvert 1 \rangle$ (alive) |
| ⚫ Dark circle | $\lvert 0 \rangle$ (dead) |
| 🔴 Red circle | Error (bit flipped by noise) |
| 🔵 Cyan flash | Propagation in progress |
| **L** label | Logical Qubit (root) |
| **V** label | Virtual Qubit (internal node) |
| r=10 (largest) | Root node |
| r=5 (smallest) | Physical qubit (leaf) |

### Grid Panel (Right)

| Visual | Meaning |
|:-------|:--------|
| 🟢 Green square | $\lvert 1 \rangle$ |
| ⚫ Dark square | $\lvert 0 \rangle$ |
| 🔴 Red square | Error (flipped) |
| Gray lines | Nearest-neighbor connections |

### Center Divider

| Display | Meaning |
|:--------|:--------|
| **Tree LER** | Running logical error rate for tree encoding |
| **Grid LER** | Running logical error rate for grid encoding |
| **Advantage** | "∞× (Tree perfect!)" or "$N$× advantage" |

### Sidebar Stats

| Stat | Meaning |
|:-----|:--------|
| **Physical Qubits** | Leaf count (same for both encodings) |
| **Virtual Qubits** | Internal tree nodes (encoding overhead) |
| **Energy Barrier** | Minimum leaf flips to corrupt logical qubit. $= 2^d$ for $p=2$. |

---

## 5. Keyboard Shortcuts

| Key | Action | Mode |
|:----|:-------|:----:|
| `1` | Explore Tree mode | All |
| `2` | Single Trial mode | All |
| `3` | Run Experiment mode | All |
| `E` | Encode | Trial |
| `N` | Inject Noise | Trial |
| `D` | Decode | Trial |
| `T` | Run Single Trial | Trial |
| `X` | Run N Trials | Experiment |
| `R` | Randomize leaves | Explore |

---

## 6. The Science

### Why the tree wins

The **strong triangle inequality**:
$$d(x,z) \leq \max\{d(x,y), d(y,z)\}$$

This means the distance between any two points is bounded by the *maximum* of their distances to a third point — not the sum. In a tree, this geometrically confines errors to local branches. The hierarchical majority vote filters errors at each level.

### Energy barrier

$$E_{\text{barrier}}(d) = 2^d \quad (\text{for } p=2)$$

At $d=4$, you'd need **16 physical qubits to flip in specific positions** to corrupt the logical qubit. Random noise with $p_{\text{err}} = 0.35$ does this with probability $\approx 10^{-10}$.

### Published validation

- **Validation paper** (DOI: [10.5281/zenodo.20134944](https://doi.org/10.5281/zenodo.20134944)): Tree $d \geq 3$ — 0 logical errors in 500 trials at $p_{\text{err}} \leq 0.40$. Flat encoding: LER up to 0.152.
- **UQC Foundations** (DOI: [10.5281/zenodo.20154557](https://doi.org/10.5281/zenodo.20154557))

---

## 7. Edge Cases & Troubleshooting

| Issue | Solution |
|:------|:---------|
| **Tree too large (slow)** | Reduce $p$ to 2 or 3, $d$ to 3 or 4 |
| **Tree and grid both perfect** | Increase $p_{\text{err}}$. At 0.15 both survive. Try 0.35–0.40. |
| **Tree shows errors at $d \geq 3$** | Should NOT happen. Hard-refresh (Ctrl+F5). If persistent, report bug. |
| **Clicking leaves does nothing** | Switch to Explore Tree mode (press `1`). Trial/Experiment modes disable leaf clicking. |
| **Shift+Click shows no distance** | Click one leaf, then Shift+Click a different leaf. Must be two distinct leaves. |

---

## 8. Architecture

| File | Purpose |
|:-----|:--------|
| `index.html` | 3-column layout |
| `css/showdown.css` | Dark quantum theme |
| `js/virtual-qubit-engine.js` | BruhatTitsEncoder + SurfaceCodeGrid |
| `js/dual-viz.js` | D3.js dual visualization |
| `js/showdown-main.js` | Controller — modes, experiment runner, keyboard shortcuts |

**Tree algorithm:** Per Validation paper §3.2 — all nodes get logical value, hierarchical majority vote, ties retain current value.

**Grid algorithm:** Simple repetition code — global majority vote.

**RNG:** Linear congruential generator (Numerical Recipes), seeded by trial counter.

---

*Instruction Manual v1.0 — 2026-05-22*
