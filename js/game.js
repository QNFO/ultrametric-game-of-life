/**
 * Game of Life Engine — Cellular Automaton on Ultrametric Trees
 *
 * Adapts Conway's Game of Life principles to the Bruhat-Tits tree structure.
 * The key insight: "neighbors" are defined by ultrametric proximity.
 *
 * Game of Life Rules (adapted for tree):
 *   1. A leaf becomes alive (1) if the majority of its siblings are alive
 *   2. A leaf stays alive if exactly half of its siblings are alive (stasis)
 *   3. A leaf dies (0) if it has too few alive siblings (isolation)
 *   4. After leaf updates, values propagate up via hierarchical majority vote
 *
 * The ultrametric structure provides:
 *   - Local neighborhoods (siblings under same parent)
 *   - Hierarchical influence (parent state affects/reflects children)
 *   - Error confinement (changes in one subtree don't affect distant subtrees)
 */

class GameOfLifeEngine {
    /**
     * @param {BruhatTitsTree} tree - The ultrametric tree to run on
     */
    constructor(tree) {
        this.tree = tree;
        this.generation = 0;
        this.history = [];       // Snapshots of leaf states
        this.maxHistory = 50;
        this.running = false;
        this.intervalId = null;

        // Configurable rules
        this.rules = {
            // For Conway-style: survive if 2-3 neighbors, born if 3 neighbors
            // For tree: survive if majority of sibling group, born if
            // at least threshold fraction of parent subtree is alive
            birthThreshold: 0.5,    // Fraction of siblings alive to trigger birth
            survivalMin: 0.25,      // Minimum sibling fraction to survive
            survivalMax: 0.75,      // Maximum sibling fraction to survive
            useTreeRules: true,     // Use tree-adapted rules vs classic Conway
        };
    }

    /** Take a snapshot of current leaf states */
    snapshot() {
        return {
            generation: this.generation,
            leafValues: this.tree.leaves.map(l => l.value),
            rootValue: this.tree.root.value,
            timestamp: Date.now()
        };
    }

    /** Save current state to history */
    saveHistory() {
        this.history.push(this.snapshot());
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        }
    }

    /**
     * Apply one generation of Game of Life rules.
     * Returns the new leaf values and propagation changes.
     */
    step() {
        this.saveHistory();

        // Phase 1: Apply rules to each leaf based on its siblings
        const changes = [];
        const parentGroups = new Map();

        // Group leaves by their parent
        for (const leaf of this.tree.leaves) {
            const parent = leaf.parent;
            if (!parent) continue;
            const key = parent.index;
            if (!parentGroups.has(key)) {
                parentGroups.set(key, { parent, leaves: [] });
            }
            parentGroups.get(key).leaves.push(leaf);
        }

        // Apply rules per sibling group
        for (const [, group] of parentGroups) {
            const siblings = group.leaves;
            const aliveCount = siblings.reduce((sum, l) => sum + l.value, 0);
            const total = siblings.length;
            const aliveFraction = aliveCount / total;

            for (const leaf of siblings) {
                const oldValue = leaf.value;
                let newValue;

                if (this.rules.useTreeRules) {
                    // Tree-adapted Conway rules
                    if (oldValue === 1) {
                        // Survival: stay alive if enough siblings are alive
                        newValue = (aliveFraction >= this.rules.survivalMin &&
                                    aliveFraction <= this.rules.survivalMax) ? 1 : 0;
                    } else {
                        // Birth: become alive if enough siblings are alive
                        newValue = (aliveFraction >= this.rules.birthThreshold) ? 1 : 0;
                    }
                } else {
                    // Classic Conway rules adapted for 1D sibling ring
                    // Find position in sibling list
                    const idx = siblings.indexOf(leaf);
                    const left = siblings[(idx - 1 + total) % total];
                    const right = siblings[(idx + 1) % total];
                    const neighborAlive = left.value + right.value;

                    if (oldValue === 1) {
                        newValue = (neighborAlive === 1 || neighborAlive === 2) ? 1 : 0;
                    } else {
                        newValue = (neighborAlive === 2) ? 1 : 0;
                    }
                }

                if (newValue !== oldValue) {
                    leaf.value = newValue;
                    changes.push(leaf);
                }
            }
        }

        // Phase 2: Propagate upward
        const propChanges = this.tree.propagateUp();
        this.generation++;

        return {
            leafChanges: changes,
            propChanges,
            generation: this.generation,
            rootValue: this.tree.root.value
        };
    }

    /** Apply noise to random leaves */
    applyNoise(rate, rng = Math.random) {
        const flipped = [];
        for (const leaf of this.tree.leaves) {
            if (rng() < rate) {
                leaf.value = 1 - leaf.value;
                flipped.push(leaf);
            }
        }
        // Propagate after noise
        const propChanges = this.tree.propagateUp();
        return { flipped, propChanges };
    }

    /**
     * Check if the system has reached a stable state (no changes
     * between consecutive generations).
     */
    isStable() {
        if (this.history.length < 2) return false;
        const last = this.history[this.history.length - 1];
        const prev = this.history[this.history.length - 2];
        return last.leafValues.every((v, i) => v === prev.leafValues[i]);
    }

    /** Reset the engine */
    reset() {
        this.generation = 0;
        this.history = [];
        this.tree.resetValues(0);
    }
}
