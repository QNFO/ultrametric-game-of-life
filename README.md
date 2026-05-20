# Ultrametric Game of Life — README

**Project:** Computational simulation — Conway's Game of Life on an ultrametric (tree-based) grid
**Thesis:** Cellular automata on ultrametric geometry may produce qualitatively different emergent behavior than on Euclidean grids. The strong triangle inequality constrains neighbor interactions in ways that have no Euclidean analog — potentially producing novel patterns, different complexity classes, or unique phase transitions.

**Source:** Cross-agent handoff from QWAV Strategy Program Manager
**Handoff document:** `SPRINT.md` (this file contains all tasks)

## Core Deliverable

A working Python simulation of Conway's Game of Life adapted to Bruhat-Tits tree topology, with:
1. Tree-based grid construction (ternary $p=3$, configurable depth)
2. Adapted neighbor rules for tree topology
3. Visualization of tree-state evolution
4. Classification of emergent behavior (dead, stable, oscillating, glider-like, chaotic)
5. Comparison with Euclidean Game of Life baseline

## Prior Work References

- Conway's Game of Life (original rules on $\mathbb{Z}^2$ grid)
- QWAV ultrametric_v2 codebase: `G:\My Drive\projects\ultrametric_v2\` (Bruhat-Tits tree construction, noise injection, metrics)
- Bruhat-Tits tree theory: $p$ -adic numbers, strong triangle inequality

## Constraints

- Single LLM thread completable (D12)
- All code in Python, standard library only unless specified
- All math in LaTeX
- Feature branch only
