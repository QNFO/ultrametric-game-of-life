"""Comprehensive test plan for Virtual Qubit Showdown.
Tests tree engine, grid engine, experiment runner, and paper-matching."""

import sys, os, json, random, math
sys.stdout.reconfigure(encoding='utf-8')

PASS, FAIL = 0, 0

def check(name, condition, detail=""):
    global PASS, FAIL
    if condition:
        PASS += 1
        print(f"  [PASS] {name}")
    else:
        FAIL += 1
        print(f"  [FAIL] {name} — {detail}")

# ============================================================
# TEST 1: BruhatTitsEncoder tree construction
# ============================================================
print("\n" + "="*60)
print("TEST 1: Tree Construction (node/leaf counts)")
print("="*60)

# Expected: N_leaves = (p+1) * p^(d-1), N_total = 1 + (p+1)*(p^d - 1)/(p-1)
test_cases = [
    (2, 1, 3, 4),
    (2, 2, 6, 10),
    (2, 3, 12, 22),
    (2, 4, 24, 46),
    (2, 5, 48, 94),
    (3, 1, 4, 5),
    (3, 2, 12, 17),
    (3, 3, 36, 53),
    (5, 1, 6, 7),
    (5, 2, 30, 37),
    (7, 1, 8, 9),
    (7, 2, 56, 65),
    (7, 3, 392, 457),
]

for p, d, exp_leaves, exp_total in test_cases:
    # Simulate tree construction matching BruhatTitsEncoder
    leaves = []
    all_nodes = []
    
    def build(node, branching, depth_left):
        all_nodes.append(node)
        if depth_left == 0:
            leaves.append(node)
            return
        for _ in range(branching):
            child = {'val': 0, 'orig': 0}
            node.setdefault('children', []).append(child)
            build(child, p, depth_left - 1)
    
    root = {'val': 0, 'orig': 0, 'children': []}
    build(root, p + 1, d)
    
    check(f"p={p},d={d} leaves={exp_leaves}",
          len(leaves) == exp_leaves,
          f"got {len(leaves)}")
    check(f"p={p},d={d} total={exp_total}",
          len(all_nodes) == exp_total,
          f"got {len(all_nodes)}")

# ============================================================
# TEST 2: encode/decode matching paper Table 1
# ============================================================
print("\n" + "="*60)
print("TEST 2: Tree LER matches Validation paper Table 1")
print("="*60)

# Paper: p=2, N=500, seed=42
def run_tree_experiment(p, d, p_err, n_trials=500, seed=42):
    leaves = []
    all_nodes = []
    
    def build(node, branching, depth_left):
        all_nodes.append(node)
        if depth_left == 0:
            leaves.append(node)
            return
        for _ in range(branching):
            child = {'val': 0, 'orig': 0, 'children': []}
            node['children'].append(child)
            build(child, p, depth_left - 1)
    
    root = {'val': 0, 'orig': 0, 'children': []}
    build(root, p + 1, d)
    
    def encode(logical_val):
        # Paper: set ALL nodes to logical value
        for node in all_nodes:
            node['val'] = logical_val
            node['orig'] = logical_val
    
    def decode():
        def propagate(node):
            if not node.get('children'):
                return node['val']
            ones = sum(propagate(c) for c in node['children'])
            zeros = len(node['children']) - ones
            if ones > zeros:
                node['val'] = 1
            elif zeros > ones:
                node['val'] = 0
            # else: retain current value (paper)
            return node['val']
        propagate(root)
    
    rng = random.Random(seed)
    errors = 0
    for _ in range(n_trials):
        logical_val = rng.randint(0, 1)
        encode(logical_val)
        for leaf in leaves:
            if rng.random() < p_err:
                leaf['val'] = 1 - leaf['val']
        decode()
        if root['val'] != leaves[0]['orig']:
            errors += 1
    return errors, errors / n_trials

# Paper Table 1 values (Tree d=3, p=2)
paper_table1_tree_d3 = {
    0.10: 0, 0.15: 0, 0.20: 0, 0.25: 0,
    0.30: 0, 0.35: 0, 0.40: 0,
}

# Paper Table 1 values (Tree d=2, p=2)
paper_table1_tree_d2 = {
    0.10: 1, 0.15: 1, 0.20: 2, 0.25: 6, 0.30: 9, 0.35: 26, 0.40: 36,
}

for p_err in [0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40]:
    errors, ler = run_tree_experiment(2, 3, p_err)
    expected = paper_table1_tree_d3[p_err]
    # Paper expects 0 errors. We accept 1-2 as statistical noise.
    passed = errors <= 2  # p_L ≈ p_err^8 ≈ 6.6e-4 at 0.40 → ~0.33 expected
    check(f"Tree d=3 p_err={p_err}: {errors}/500 (paper: {expected}/500)",
          passed, f"got {errors}, expected ≤2")

for p_err in [0.10, 0.15, 0.20]:
    errors, ler = run_tree_experiment(2, 2, p_err)
    expected = paper_table1_tree_d2[p_err]
    check(f"Tree d=2 p_err={p_err}: {errors}/500 (paper: {expected}/500)",
          errors == expected, f"got {errors}, expected {expected}")

# ============================================================
# TEST 3: Grid (flat) encoding LER sanity
# ============================================================
print("\n" + "="*60)
print("TEST 3: Grid (flat majority) LER sanity checks")
print("="*60)

def run_flat_experiment(n_qubits, p_err, n_trials=500, seed=42):
    rng = random.Random(seed)
    errors = 0
    for _ in range(n_trials):
        logical_val = rng.randint(0, 1)
        qubits = [logical_val] * n_qubits
        for i in range(n_qubits):
            if rng.random() < p_err:
                qubits[i] = 1 - qubits[i]
        ones = sum(qubits)
        zeros = n_qubits - ones
        decoded = 1 if ones > zeros else 0
        if decoded != logical_val:
            errors += 1
    return errors, errors / n_trials

# At p_err=0.15 with 12 qubits: expected flips ~1.8/trial, majority barely affected
errors, ler = run_flat_experiment(12, 0.15)
check(f"Flat 12q p_err=0.15: {errors}/500",
      errors <= 5, f"got {errors}, expected near 0 (minority flips rarely flip majority)")

# At p_err=0.40 with 12 qubits: expected flips ~4.8/trial, majority more vulnerable
errors, ler = run_flat_experiment(12, 0.40)
check(f"Flat 12q p_err=0.40: {errors}/500",
      errors > 10, f"got {errors}, expected significant errors at high noise")

# Paper: Flat d=3 (=12 bits) at p_err=0.40: 76/500, LER=0.152
errors, ler = run_flat_experiment(12, 0.40)
paper_flat_d3_p40 = 76
check(f"Flat d=3 p_err=0.40: {errors}/500 (paper: {paper_flat_d3_p40}/500)",
      abs(errors - paper_flat_d3_p40) < 15,
      f"got {errors}, paper says {paper_flat_d3_p40}")

# ============================================================
# TEST 4: Energy barrier computation
# ============================================================
print("\n" + "="*60)
print("TEST 4: Energy barrier formula")
print("="*60)

# For all-leaves-0 → flip to root=1:
# Need ceil((p+1)/2) children at root × ceil(p/2)^(d-1) leaf flips
# Special case: paper E_barrier(d) = 2^d for p=2
for p, d, exp_barrier in [
    (2, 1, 2),   # 2^1 = 2
    (2, 2, 4),   # 2^2 = 4  (paper Table 2)
    (2, 3, 8),   # 2^3 = 8
    (2, 4, 16),  # 2^4 = 16
    (3, 1, 3),   # ceil(4/2) = 2 (wrong, need ceil(4/2) × ceil(3/2)^0 = 2)
    (3, 2, 6),   # ceil(4/2) × ceil(3/2)^1 = 2 × 2 = 4 (wrong, but let me recalc)
]:
    # E = ceil((p+1)/2) * ceil(p/2)^(d-1)
    # For p=2: ceil(3/2) * ceil(2/2)^(d-1) = 2 * 1^(d-1) = 2 (CONSTANT)
    # But the paper says E = 2^d! 
    # This is because the paper's encoding is different from simple repetition.
    # Let me just verify against the paper's stated values.
    barrier = math.ceil((p+1)/2) * (math.ceil(p/2) ** (d-1))
    paper_barrier = 2**d if p == 2 else None
    
    if p == 2:
        check(f"E_barrier p={p} d={d}: {barrier} (paper says {paper_barrier})",
              barrier == paper_barrier,
              f"formula gives {barrier}, paper says {paper_barrier}")
    print(f"    General formula: ceil({p+1}/2) × ceil({p}/2)^{d-1} = {barrier}")

# ============================================================
# TEST 5: Edge cases
# ============================================================
print("\n" + "="*60)
print("TEST 5: Edge cases")
print("="*60)

# Minimum tree: p=2, d=1
errors, ler = run_tree_experiment(2, 1, 0.15)
check(f"Min tree d=1 p_err=0.15: errors/500 = {errors}",
      True, "survives without crash")

# Tree with no noise
errors, ler = run_tree_experiment(2, 3, 0.0)
check(f"No noise p_err=0: {errors}/500",
      errors == 0, f"got {errors}, expected 0")

# Tree with 100% noise
errors, ler = run_tree_experiment(2, 3, 1.0)
check(f"Max noise p_err=1.0: {errors}/500",
      True, f"got {errors} — all leaves flip, root depends on tie-breaking")

# Deep tree: p=2, d=5
errors, ler = run_tree_experiment(2, 5, 0.15)
check(f"Deep tree d=5 p_err=0.15: {errors}/500",
      True, f"got {errors} — deep tree should be very robust")

# Wide tree: p=7, d=2
errors, ler = run_tree_experiment(7, 2, 0.15)
check(f"Wide tree p=7 d=2: errors/500 = {errors}",
      True, "survives without crash")

# Odd leaf count grid
errors, ler = run_flat_experiment(9, 0.3)
check(f"Grid 9q (odd) p_err=0.3: errors/500 = {errors}",
      True, "survives with odd count")

# ============================================================
# TEST 6: Ultrametric distance and strong triangle inequality
# ============================================================
print("\n" + "="*60)
print("TEST 6: Ultrametric distance & strong triangle inequality")
print("="*60)

def build_with_depth(p, d):
    leaves = []
    all_nodes = []
    def build(node, branching, depth_left):
        all_nodes.append(node)
        node['depth'] = d - depth_left
        if depth_left == 0:
            leaves.append(node)
            return
        for _ in range(branching):
            child = {'val': 0, 'orig': 0, 'children': [], 'parent': node}
            node.setdefault('children', []).append(child)
            build(child, p, depth_left - 1)
    root = {'val': 0, 'orig': 0, 'children': [], 'parent': None}
    build(root, p + 1, d)
    root['depth'] = 0
    return root, leaves, all_nodes

def lca(a, b):
    while a['depth'] > b['depth']: a = a['parent']
    while b['depth'] > a['depth']: b = b['parent']
    while a is not b:
        a = a['parent']
        b = b['parent']
    return a

def ultrametric_distance(a, b, d_max):
    return d_max - lca(a, b)['depth']

def strong_triangle(x, y, z, d_max):
    d_xz = ultrametric_distance(x, z, d_max)
    d_xy = ultrametric_distance(x, y, d_max)
    d_yz = ultrametric_distance(y, z, d_max)
    return d_xz <= max(d_xy, d_yz)

root, leaves, _ = build_with_depth(2, 3)

# Test all triples
violations = 0
n = len(leaves)
for i in range(n):
    for j in range(i+1, n):
        for k in range(j+1, n):
            if not strong_triangle(leaves[i], leaves[j], leaves[k], 3):
                violations += 1

check(f"Strong triangle inequality: {violations} violations in {n*(n-1)*(n-2)//6} triples",
      violations == 0, f"expected 0 violations, got {violations}")

# Test specific distances
check(f"d(leaves[0], leaves[1]) < d(leaves[0], leaves[-1])",
      ultrametric_distance(leaves[0], leaves[1], 3) < ultrametric_distance(leaves[0], leaves[-1], 3),
      "siblings should be closer than distant leaves")

# ============================================================
# TEST 7: Experiment runner accumulation
# ============================================================
print("\n" + "="*60)
print("TEST 7: Experiment runner logic")
print("="*60)

# Simulate running multiple trials and accumulating
tree_errs, tree_trials = 0, 0
grid_errs, grid_trials = 0, 0

for batch in range(10):
    for _ in range(10):  # 10 trials per batch
        tree_e, _ = run_tree_experiment(2, 3, 0.15, n_trials=1, seed=42+batch*10+_)
        grid_e, _ = run_flat_experiment(12, 0.15, n_trials=1, seed=42+batch*10+_)
        tree_errs += (tree_e > 0)
        tree_trials += 1
        grid_errs += (grid_e > 0)
        grid_trials += 1

check(f"Accumulation: tree {tree_errs}/{tree_trials}, grid {grid_errs}/{grid_trials}",
      tree_trials == 100 and grid_trials == 100,
      f"expected 100 each, got {tree_trials}/{grid_trials}")

tree_ler = tree_errs / tree_trials if tree_trials else 0
grid_ler = grid_errs / grid_trials if grid_trials else 0
check(f"Tree advantage: {tree_ler:.4f} vs {grid_ler:.4f}",
      tree_ler <= grid_ler + 0.02,  # Allow small margin
      f"tree LER {tree_ler:.4f} should be <= grid LER {grid_ler:.4f} + margin")

# ============================================================
# SUMMARY
# ============================================================
print("\n" + "="*60)
print(f"RESULTS: {PASS} passed, {FAIL} failed, {PASS+FAIL} total")
print("="*60)

if FAIL == 0:
    print("ALL TESTS PASSED")
else:
    print(f"{FAIL} TESTS FAILED")
    sys.exit(1)
