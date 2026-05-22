/**
 * Virtual Qubit Engine — Bruhat-Tits Tree + Surface Code Comparison
 *
 * Implements the full experiment pipeline from:
 *   - QNFO/ultrametric-error-confinement (simulations/_0_1_btree.py)
 *   - Validation of Ultrametric Error Confinement (DOI: 10.5281/zenodo.20134944)
 *
 * ARCHITECTURE:
 *   Each leaf = physical qubit (stores 0 or 1)
 *   Each internal node = virtual qubit (computed via majority vote from children)
 *   Root = logical qubit (final decoded value)
 *
 * This is the "repetition code on a tree" — the simplest ultrametric encoding.
 * The hierarchical majority vote at each level provides error correction:
 * errors confined to one subtree cannot flip votes in distant subtrees.
 */

class VirtualQubitNode {
    constructor() {
        this.value = 0;           // Current state
        this.original = 0;        // State before noise (for comparison)
        this.children = [];
        this.parent = null;
        this.index = -1;
        this.id = '';
        this.error = false;       // True if this node's value differs from encoded
        this.propagationFlash = 0; // For animation: how recently this changed
    }

    get isLeaf() { return this.children.length === 0; }
    get isRoot() { return this.parent === null; }
    get depth() { return this.isRoot ? 0 : this.parent.depth + 1; }
}

class BruhatTitsEncoder {
    /**
     * @param {number} p - Prime for p-adic tree
     * @param {number} depth - Tree depth (leaves at level depth)
     */
    constructor(p = 2, depth = 3) {
        this.p = p;
        this.depth = depth;
        this.root = null;
        this.allNodes = [];
        this.leaves = [];
        this._nextId = 1;
        this._build();
    }

    _build() {
        this.root = this._makeNode();
        this._buildSubtree(this.root, this.p + 1, 0);
    }

    _makeNode() {
        const node = new VirtualQubitNode();
        node.index = this.allNodes.length;
        node.id = 't' + this._nextId++;
        this.allNodes.push(node);
        return node;
    }

    _buildSubtree(node, branching, currentDepth) {
        if (currentDepth >= this.depth) {
            this.leaves.push(node);
            return;
        }
        for (let i = 0; i < branching; i++) {
            const child = this._makeNode();
            child.parent = node;
            node.children.push(child);
            this._buildSubtree(child, this.p, currentDepth + 1);
        }
    }

    get numPhysicalQubits() { return this.leaves.length; }
    get numVirtualQubits() { return this.allNodes.length - this.leaves.length; }
    get numTotalQubits() { return this.allNodes.length; }

    /** Encode a logical value (0 or 1) across ALL nodes — paper Section 3.2 */
    encode(logicalValue) {
        for (const node of this.allNodes) {
            node.value = logicalValue;
            node.original = logicalValue;
            node.error = false;
            node.propagationFlash = 0;
        }
    }

    /** Apply independent bit-flip noise to each physical qubit */
    applyNoise(errorRate, rng = Math.random) {
        const flipped = [];
        for (const leaf of this.leaves) {
            if (rng() < errorRate) {
                leaf.value = 1 - leaf.value;
                leaf.error = true;
                flipped.push(leaf);
            } else {
                leaf.error = false;
            }
        }
        return flipped;
    }

    /**
     * Decode via hierarchical majority vote.
     * Returns {logicalValue, changedNodes, logicalError}
     */
    decode(tieBreaker = 0) {
        const changed = [];
        // Process from leaves-up: depth-1 down to 0
        for (let d = this.depth - 1; d >= 0; d--) {
            for (const node of this.allNodes) {
                if (node.depth !== d || node.isLeaf) continue;
                const ones = node.children.reduce((s, c) => s + c.value, 0);
                const zeros = node.children.length - ones;
                if (ones > zeros) {
                    if (node.value !== 1) {
                        node.value = 1;
                        node.propagationFlash = 3;
                        changed.push(node);
                    }
                } else if (zeros > ones) {
                    if (node.value !== 0) {
                        node.value = 0;
                        node.propagationFlash = 3;
                        changed.push(node);
                    }
                }
                // else: tie — retain current value (paper Section 3.2)
            }
        }
        const logicalError = (this.root.value !== this.leaves[0].original);
        return {
            logicalValue: this.root.value,
            changedNodes: changed,
            logicalError
        };
    }

    /** Full encode → noise → decode roundtrip. Returns {logicalError, flipped, changed} */
    runTrial(logicalValue, errorRate, rng) {
        this.encode(logicalValue);
        const flipped = this.applyNoise(errorRate, rng);
        const decoded = this.decode();
        return { ...decoded, flipped };
    }

    /** Get ultrametric distance between two leaves */
    ultrametricDistance(a, b) {
        // Walk up from both to same depth
        let na = a, nb = b;
        while (na.depth > nb.depth) na = na.parent;
        while (nb.depth > na.depth) nb = nb.parent;
        while (na !== nb) { na = na.parent; nb = nb.parent; }
        return this.depth - na.depth;
    }

    /** Energy barrier: minimum leaf flips needed to flip the root */
    computeEnergyBarrier() {
        const targetValue = 1 - this.root.value;
        const memo = new Map();

        const minFlips = (node) => {
            if (node.isLeaf) {
                return node.value === targetValue ? 0 : 1;
            }
            const key = node.index;
            if (memo.has(key)) return memo.get(key);
            const costs = node.children.map(c => minFlips(c)).sort((a, b) => a - b);
            const needed = Math.ceil((node.children.length + 1) / 2);
            let total = 0;
            for (let i = 0; i < needed; i++) total += costs[i];
            memo.set(key, total);
            return total;
        };

        return minFlips(this.root);
    }

    /** Reset propagation flash counters (call after each animation frame) */
    tickAnimations() {
        for (const node of this.allNodes) {
            if (node.propagationFlash > 0) node.propagationFlash--;
        }
    }
}

/**
 * Surface Code Grid — Repetition Code on a 2D Euclidean Lattice
 *
 * This is the "flat / Archimedean" comparison:
 * Physical qubits arranged in a 2D grid, logical value decoded via
 * global majority vote (no hierarchical structure).
 *
 * In real surface codes, check operators detect errors on adjacent qubits,
 * but the fundamental limitation remains: errors can propagate across
 * the entire grid because Euclidean geometry has no hierarchical confinement.
 */
class SurfaceCodeGrid {
    /**
     * @param {number} width - Grid width in physical qubits
     * @param {number} height - Grid height in physical qubits
     */
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.qubits = [];  // Flat array of {value, original, error, x, y}
        this._build();
    }

    _build() {
        let idx = 0;
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                this.qubits.push({
                    value: 0,
                    original: 0,
                    error: false,
                    x, y,
                    index: idx++
                });
            }
        }
    }

    get numPhysicalQubits() { return this.qubits.length; }

    encode(logicalValue) {
        for (const q of this.qubits) {
            q.value = logicalValue;
            q.original = logicalValue;
            q.error = false;
        }
    }

    applyNoise(errorRate, rng = Math.random) {
        const flipped = [];
        for (const q of this.qubits) {
            if (rng() < errorRate) {
                q.value = 1 - q.value;
                q.error = true;
                flipped.push(q);
            } else {
                q.error = false;
            }
        }
        return flipped;
    }

    /** Decode via global majority vote (flat — no hierarchy) */
    decode() {
        const ones = this.qubits.reduce((s, q) => s + q.value, 0);
        const zeros = this.numPhysicalQubits - ones;
        let logicalValue;
        if (ones > zeros) logicalValue = 1;
        else if (zeros > ones) logicalValue = 0;
        else logicalValue = 0; // tie breaker

        const logicalError = (logicalValue !== this.qubits[0].original);
        return { logicalValue, logicalError };
    }

    runTrial(logicalValue, errorRate, rng) {
        this.encode(logicalValue);
        const flipped = this.applyNoise(errorRate, rng);
        const decoded = this.decode();
        return { ...decoded, flipped };
    }

    /** Get neighboring qubits (4-direction for surface code visual) */
    getNeighbors(q) {
        const neighbors = [];
        const { x, y } = q;
        for (const other of this.qubits) {
            const dx = Math.abs(other.x - x);
            const dy = Math.abs(other.y - y);
            if ((dx === 1 && dy === 0) || (dx === 0 && dy === 1)) {
                neighbors.push(other);
            }
        }
        return neighbors;
    }
}
