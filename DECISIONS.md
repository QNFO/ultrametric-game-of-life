# Ultrametric Game of Life — DECISIONS

**Last updated:** 2026-05-20

### D1: Ternary tree as default topology
- **Decision:** Use $p=3$ ternary Bruhat-Tits tree as the default simulation substrate.
- **Rationale:** Ternary is the smallest symmetric prime family ($p=2$ is asymmetric, deprecated). Consistent with QWAV's computational validation choice.

### D2: Simulation-first, publication-optional
- **Decision:** The primary deliverable is a working simulation. Publication is optional and depends on results.
- **Rationale:** If the simulation produces null results (ultrametric GoL behaves identically to Euclidean), document honestly but don't force a publication.
