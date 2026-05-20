/**
 * Bruhat-Tits Tree Engine — Ultrametric Tree Construction & Algorithms
 * Based on: Ultrametric Quantum Computing Foundations (DOI: 10.5281/zenodo.20154557)
 *           Validation of Ultrametric Error Confinement (DOI: 10.5281/zenodo.20134944)
 *           QNFO/ultrametric-error-confinement (simulations/_0_1_btree.py)
 *
 * The Bruhat-Tits tree T_p for prime p:
 *   - Root has (p+1) children
 *   - All other non-leaf nodes have p children
 *   - Depth d means leaves are at level d (root at level 0)
 *
 * Key property: The strong triangle inequality
 *   d(x,z) ≤ max(d(x,y), d(y,z))
 * where distance between leaves is the depth of their lowest common ancestor.
 */

class Node {
    constructor(value = 0) {
        this.value = value;        // Binary state: 0 (dead) or 1 (alive)
        this.children = [];        // Child nodes
        this.parent = null;        // Parent node (null for root)
        this.index = -1;           // Unique index within tree
        this.id = '';              // Unique string ID for D3
    }

    get isLeaf() { return this.children.length === 0; }
    get isRoot() { return this.parent === null; }

    get depth() {
        if (this.isRoot) return 0;
        return this.parent.depth + 1;
    }

    /** Get all ancestors from parent up to root (inclusive) */
    get ancestors() {
        const result = [];
        let node = this.parent;
        while (node) {
            result.push(node);
            node = node.parent;
        }
        return result;
    }

    /** Get the path from root to this node (inclusive) */
    get path() {
        const result = [];
        let node = this;
        while (node) {
            result.unshift(node);
            node = node.parent;
        }
        return result;
    }

    /** Get all descendants (including self) */
    getDescendants() {
        const result = [this];
        for (const child of this.children) {
            result.push(...child.getDescendants());
        }
        return result;
    }
}

class BruhatTitsTree {
    /**
     * @param {number} p - Prime for the p-adic tree (default 2)
     * @param {number} depth - Number of levels below root (default 3)
     */
    constructor(p = 2, depth = 3) {
        if (p < 2) throw new Error(`p must be >= 2, got ${p}`);
        if (depth < 1) throw new Error(`depth must be >= 1, got ${depth}`);

        this.p = p;
        this.depth = depth;
        this.root = null;
        this.nodes = [];     // All nodes (index-ordered)
        this.leaves = [];    // Leaf nodes only
        this._nextId = 1;

        this._build();
    }

    /** Build the tree recursively */
    _build() {
        this.root = this._createNode(0);
        this._buildSubtree(this.root, this.p + 1, 0);
    }

    _createNode(value = 0) {
        const node = new Node(value);
        node.index = this.nodes.length;
        node.id = `n${this._nextId++}`;
        this.nodes.push(node);
        return node;
    }

    _buildSubtree(node, branching, currentDepth) {
        if (currentDepth >= this.depth) {
            this.leaves.push(node);
            return;
        }
        for (let i = 0; i < branching; i++) {
            const child = this._createNode(0);
            child.parent = node;
            node.children.push(child);
            // Non-root nodes have p children
            this._buildSubtree(child, this.p, currentDepth + 1);
        }
    }

    get numNodes() { return this.nodes.length; }
    get numLeaves() { return this.leaves.length; }

    /** Return all nodes at the given depth */
    getNodesAtDepth(d) {
        return this.nodes.filter(n => n.depth === d);
    }

    /** Set all node values to the given value */
    resetValues(value = 0) {
        for (const node of this.nodes) {
            node.value = value;
        }
    }

    /** Randomize all leaf values */
    randomizeLeaves(rng = Math.random) {
        for (const leaf of this.leaves) {
            leaf.value = rng() < 0.5 ? 1 : 0;
        }
    }

    /**
     * Propagate leaf values upward using hierarchical majority vote.
     * For each internal node (processed from leaves to root):
     *   - Count 0s and 1s among children
     *   - Set node value to majority
     *   - On tie, use tieBreaker
     *
     * @param {number} tieBreaker - Value to use when children are evenly split (default 0)
     * @returns {Array} List of nodes that changed value
     */
    propagateUp(tieBreaker = 0) {
        const changed = [];
        for (let d = this.depth - 1; d >= 0; d--) {
            for (const node of this.getNodesAtDepth(d)) {
                if (node.isLeaf) continue;
                const ones = node.children.reduce((sum, c) => sum + c.value, 0);
                const zeros = node.children.length - ones;
                let newValue;
                if (ones > zeros) newValue = 1;
                else if (zeros > ones) newValue = 0;
                else newValue = tieBreaker;

                if (node.value !== newValue) {
                    node.value = newValue;
                    changed.push(node);
                }
            }
        }
        return changed;
    }

    /**
     * Find the lowest common ancestor (LCA) of two nodes.
     * @returns {Node} The LCA node
     */
    lowestCommonAncestor(a, b) {
        // Bring both to same depth
        while (a.depth > b.depth) a = a.parent;
        while (b.depth > a.depth) b = b.parent;
        // Walk up together
        while (a !== b) {
            a = a.parent;
            b = b.parent;
        }
        return a;
    }

    /**
     * Compute the ultrametric distance between two leaves.
     * Distance = depth of lowest common ancestor.
     * This guarantees the strong triangle inequality:
     *   d(x,z) ≤ max(d(x,y), d(y,z))
     *
     * @returns {number} The ultrametric distance
     */
    ultrametricDistance(a, b) {
        const lca = this.lowestCommonAncestor(a, b);
        return this.depth - lca.depth;
    }

    /**
     * Check if a triple satisfies the strong triangle inequality.
     * Returns true if d(x,z) ≤ max(d(x,y), d(y,z))
     */
    checkStrongTriangleInequality(x, y, z) {
        const d_xz = this.ultrametricDistance(x, z);
        const d_xy = this.ultrametricDistance(x, y);
        const d_yz = this.ultrametricDistance(y, z);
        return d_xz <= Math.max(d_xy, d_yz);
    }

    /**
     * Compute the ultrametricity index: proportion of triples satisfying
     * the strong triangle inequality.
     *
     * @param {number} sampleSize - Number of random triples to test (0 = all)
     * @returns {object} { index, tested, violations }
     */
    ultrametricityIndex(sampleSize = 1000) {
        const n = this.leaves.length;
        if (n < 3) return { index: 1.0, tested: 0, violations: 0 };

        let tested = 0;
        let violations = 0;

        if (sampleSize === 0 || sampleSize >= n * (n - 1) * (n - 2) / 6) {
            // Exhaustive
            for (let i = 0; i < n; i++) {
                for (let j = i + 1; j < n; j++) {
                    for (let k = j + 1; k < n; k++) {
                        tested++;
                        if (!this.checkStrongTriangleInequality(
                            this.leaves[i], this.leaves[j], this.leaves[k])) {
                            violations++;
                        }
                    }
                }
            }
        } else {
            // Random sampling
            for (let s = 0; s < sampleSize; s++) {
                const [i, j, k] = this._randomTriple(n);
                tested++;
                if (!this.checkStrongTriangleInequality(
                    this.leaves[i], this.leaves[j], this.leaves[k])) {
                    violations++;
                }
            }
        }
        return {
            index: tested > 0 ? 1 - violations / tested : 1,
            tested,
            violations
        };
    }

    _randomTriple(n) {
        // Fisher-Yates partial shuffle for first 3
        const arr = [0, 1, 2];
        for (let i = 3; i < n; i++) {
            const j = Math.floor(Math.random() * (i + 1));
            if (j < 3) arr[j] = i;
        }
        return arr;
    }

    /**
     * Compute the energy barrier: minimum number of leaf flips
     * needed to change the root value. Scales as branching^depth.
     */
    energyBarrier() {
        const rootVal = this.root.value;
        const targetVal = 1 - rootVal;

        // For majority vote: need > half of root's children's aggregated votes
        // to flip. Working bottom-up, compute minimum leaf flips.
        const memo = new Map();

        const minFlipsToFlip = (node) => {
            const key = node.index;
            if (memo.has(key)) return memo.get(key);

            if (node.isLeaf) {
                // A leaf: 1 flip needed if it's not target, 0 if it is
                const result = node.value === targetVal ? 0 : 1;
                memo.set(key, result);
                return result;
            }

            // Internal node: collect children's flip costs
            const costs = node.children.map(c => minFlipsToFlip(c));
            costs.sort((a, b) => a - b);

            // Need majority to flip: ceil((k+1)/2) children
            const needed = Math.ceil((node.children.length + 1) / 2);
            let totalCost = 0;
            for (let i = 0; i < needed; i++) {
                totalCost += costs[i];
            }

            memo.set(key, totalCost);
            return totalCost;
        };

        return minFlipsToFlip(this.root);
    }

    /**
     * Get the subtree rooted at a given node.
     * @returns {BruhatTitsTree} A new tree instance (or null for leaves)
     */
    getSubtree(node) {
        // For simplicity, return the list of leaf descendants
        return node.getDescendants().filter(n => n.isLeaf);
    }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Node, BruhatTitsTree };
}
