# Virtual Qubit Showdown — Instruction Manual

**Live:** [qnfo.github.io/ultrametric-game-of-life](https://qnfo.github.io/ultrametric-game-of-life)

---

## Quick Reference Card

| Action | Key | Mode |
|:-------|:---:|:----:|
| Switch mode | `1` `2` `3` | All |
| Encode logical qubit | `E` | Trial |
| Single Trial | `T` | Trial |
| Run N Trials | `X` | Experiment |
| Toggle leaf on tree | **Click** leaf | Explore |
| Measure distance | **Shift+Click** two leaves | Explore |
| Randomize leaves | `R` | Explore |
| Propagate up tree | `P` | All |

---

## 1. What This App Is

A side-by-side comparison of two quantum error correction encodings:

| Left Panel | Right Panel |
|:-----------|:------------|
| **Bruhat-Tits Tree** (ultrametric) | **2D Grid** (surface-code analog) |
| Physical qubits at leaves | Physical qubits on lattice |
| Virtual qubits at internal nodes | Global majority vote |
| Hierarchical decoding | Flat decoding |
| Errors geometrically **confined** | Errors can **spread** |

Both encode the same logical qubit with the same number of physical qubits under identical noise. The question: **does ultrametric geometry actually protect quantum information better?**

**Answer (from published research): Yes — at depth $d \geq 3$, the tree shows zero logical errors while the grid fails.**

---

## 2. The Three Modes

### 🔬 Mode 1 — Explore Tree (`1`)

**Purpose:** Interact directly with the tree structure. Understand how ultrametric error confinement works geometrically.

| Feature | How |
|:--------|:----|
| **Click a leaf** | Toggles value between dead (dark) and alive (green). The tree **propagates** the change upward via majority vote — you'll see the Logical Qubit (root) update. |
| **Shift+Click two leaves** | Measures **ultrametric distance** between them. A flash message shows the distance and confirms the strong triangle inequality ("Strong Δ ✓"). Siblings under the same parent are closest; leaves in different root branches are farthest. |
| **Randomize** (`R`) | Assigns random 0/1 values to all leaves and propagates. Useful for seeing how the tree "cleans up" noise. |
| **Propagate** (`P`) | Runs hierarchical majority vote from leaves up to root. Shows how many nodes changed. |

**What you're seeing:** The tree's hierarchical structure means errors in one subtree stay *confined* — they can't flip votes in distant subtrees. When you toggle a single leaf, it only affects its local branch.

---

### 🧪 Mode 2 — Single Trial (`2`)

**Purpose:** Run one complete encode→noise→decode cycle on both encodings simultaneously.

| Button | What Happens |
|:-------|:-------------|
| **Encode** (`E`) | Picks a random logical $\lvert 0 \rangle$ or $\lvert 1 \rangle$, writes it to all physical qubits on both tree and grid. |
| **Noise** (`N`) | Flips random bits at the error rate $p_{\text{err}}$ (slider). Visual: flipped qubits turn red. |
| **Decode** (`D`) | Runs majority-vote recovery. The Logical Qubit displays show whether each encoding survived or errored. |
| **Single Trial** (`T`) | Does encode→noise→decode in one click. Results accumulate in the stats panel. |

**Reading the results:** After each trial, the center divider shows:
- **Tree LER:** Logical error rate for the tree (should be 0.0000 at any depth ≥ 3)
- **Grid LER:** Logical error rate for the grid (rises with $p_{\text{err}}$)
- **Advantage:** How many times better the better encoding is

---

### 📊 Mode 3 — Run Experiment (`3`)

**Purpose:** Statistical comparison. Run many trials and compare logical error rates.

1. Set **Trials** (10–5000) and **Error Rate** ($p_{\text{err}}$)
2. Click **Run N Trials** (`X`)
3. Watch the live counter and comparison stats update
4. The final results panel shows:
   - Tree LER and Grid LER with error counts
   - Physical qubits, virtual qubits, and energy barrier
   - A citation to the published research if the data matches

**Recommended demo:** Set $d=4$, $p_{\text{err}}=0.35$, 500 trials. The tree shows 0 errors while the grid shows measurable failures — exactly as published.

---

## 3. Parameters (Sliders)

| Slider | Range | Default | What It Does |
|:-------|:------|:--------|:-------------|
| **Prime $p$** | 2–7 | 2 | Tree branching. Root has $p+1$ children; all other internal nodes have $p$ children. |
| **Depth $d$** | 1–5 | 4 | How many levels below the root. Physical qubits = $(p+1) \cdot p^{d-1}$. For $p=2$, $d=4$: 24 physical qubits + 22 virtual qubits. |
| **Error Rate $p_{\text{err}}$** | 0.01–0.50 | 0.35 | Probability each physical qubit flips. Realistic for noisy quantum hardware. |

**⚠️ Performance note:** At $p=7$, $d=5$, the tree has 13,720 nodes. Rendering may be slow. Stick to $p \in \{2,3\}$ for smooth interaction.

---

## 4. Reading the Displays

### Tree Panel (Left)
| Element | Meaning |
|:--------|:--------|
| **Green circles** | Logical $\lvert 1 \rangle$ (alive) |
| **Dark circles** | Logical $\lvert 0 \rangle$ (dead) |
| **Red circles** | Error (bit flipped) |
| **Cyan flash** | Propagation in progress |
| **L** label | Logical Qubit (root) |
| **V label** | Virtual Qubit (internal node) |
| **Largest circle (r=10)** | Root |
| **Smallest circles (r=5)** | Physical qubits (leaves) |

### Grid Panel (Right)
| Element | Meaning |
|:--------|:--------|
| **Green squares** | Physical qubit $\lvert 1 \rangle$ |
| **Dark squares** | Physical qubit $\lvert 0 \rangle$ |
| **Red squares** | Error (flipped) |
| **Gray lines** | Nearest-neighbor connections |

### Center Divider
| Display | Meaning |
|:--------|:--------|
| **Tree LER** | Running logical error rate for the tree |
| **Grid LER** | Running logical error rate for the grid |
| **Advantage** | Ratio: "∞× (Tree perfect!)" or "$N$× Tree advantage" |

### Stats Panel (Sidebar)
| Stat | What |
|:-----|:-----|
| **Physical Qubits** | Number of leaf qubits (each encoding uses this many) |
| **Virtual Qubits** | Internal nodes in the tree (the encoding overhead) |
| **Energy Barrier** | Minimum leaf flips to flip the logical qubit. Scales as $2^d$ for $p=2$. |

---

## 5. Keyboard Shortcuts (Complete)

| Key | Action |
|:----|:-------|
| `1` | Switch to **Explore Tree** mode |
| `2` | Switch to **Single Trial** mode |
| `3` | Switch to **Run Experiment** mode |
| `E` | Encode a random logical qubit |
| `N` | Inject bit-flip noise |
| `D` | Decode via majority vote |
| `T` | Run one complete trial (encode→noise→decode) |
| `X` | Run N trials (Experiment mode) |
| `R` | Randomize all leaf values |
| `P` | Propagate values up the tree |
| `Space` | Not used (reserved for future auto-step) |

---

## 6. The Science (What the Numbers Mean)

### Why does the tree outperform the grid?

The **strong triangle inequality** $d(x,z) \leq \max\{d(x,y), d(y,z)\}$ means errors in one subtree are geometrically confined — they can't propagate to distant branches. The hierarchical majority vote filters errors at each level before they reach the root.

### What is a "virtual qubit"?

Every internal node in the Bruhat-Tits tree is a **virtual qubit** — it doesn't correspond to a physical qubit, but its value is computed from its children via majority vote. The virtual qubits form the encoding layers that protect the logical qubit at the root.

### What's the energy barrier?

The **minimum number of physical qubit flips** needed to flip the logical qubit. For $p=2$: $E_{\text{barrier}}(d) = 2^d$. At $d=4$: **16 qubits must flip in specific positions** to corrupt the logical qubit. Random noise almost never achieves this configuration.

### Published Data

- **Validation of Ultrametric Error Confinement** — DOI: [10.5281/zenodo.20134944](https://doi.org/10.5281/zenodo.20134944)
- **Ultrametric Quantum Computing Foundations** — DOI: [10.5281/zenodo.20154557](https://doi.org/10.5281/zenodo.20154557)
- Tree $d \geq 3$, $p_{\text{err}} \leq 0.40$: **0 observed logical errors in 500 trials**
- Flat encoding at same rate: **LER up to 0.152**

---

## 7. Edge Cases & Troubleshooting

| Issue | Solution |
|:------|:---------|
| **Tree too large (slow)** | Reduce $p$ to 2 or 3, depth to 3 or 4 |
| **Tree and grid both perfect** | Increase $p_{\text{err}}$ — at 0.15 both survive. Try 0.35 or 0.40 |
| **Tree shows errors at d=3** | This should NOT happen. Hard-refresh (Ctrl+F5). If persistent, report a bug. |
| **Clicking leaves does nothing** | Make sure you're in **Explore Tree** mode (mode `1`). In Trial/Experiment modes, clicking is disabled. |
| **Grid has different qubit count than tree** | The grid is sized to match the tree's leaf count, rounded to a √n × √n layout. Some grid cells may be empty. |

---

## 8. Architecture (For Developers)

| File | Purpose |
|:-----|:--------|
| `index.html` | Main page — 3-column layout (sidebar + tree + grid) |
| `css/showdown.css` | Dark quantum theme |
| `js/virtual-qubit-engine.js` | Tree encoder (BruhatTitsEncoder) + Grid engine (SurfaceCodeGrid) |
| `js/dual-viz.js` | D3.js dual visualization (radial tree + 2D grid) |
| `js/showdown-main.js` | Controller — modes, experiment runner, stats, keyboard shortcuts |

**Tree algorithm:** Encodes per Validation paper §3.2 — all nodes get logical value, hierarchical majority vote, ties retain current value.

**Grid algorithm:** Simple repetition code — global majority vote over all physical qubits.

**RNG:** Linear congruential generator (Numerical Recipes) seeded by trial counter for reproducibility.

---

*Instruction Manual v1.0 — Last updated 2026-05-22*
