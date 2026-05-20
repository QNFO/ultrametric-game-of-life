"""Extract comprehensive comparison data for the Virtual Qubit Showdown web app."""
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

print("=== TREE ENCODING RESULTS (from 0.16_qec_results.json) ===")
with open(r'G:\My Drive\projects\_temp_uec\simulations_v2\0.16_qec_results.json', encoding='utf-8') as f:
    qec = json.load(f)

for key in sorted(qec.keys()):
    entry = qec[key]
    if key.startswith('Tree') and 'results' in entry:
        print(f'\n{key}: qubits={entry.get("total_qubits","?")}')
        for r in entry['results']:
            if r.get('p_err', 0) >= 0.10:
                print(f'  p_err={r["p_err"]:.2f}: {r["errors"]}/{r["n_trials"]}, LER={r["ler"]:.4f}')

print("\n=== FLAT/REPETITION BASELINE ===")
for key in sorted(qec.keys()):
    entry = qec[key]
    if key.startswith('Rep') and 'results' in entry:
        print(f'\n{key}: qubits={entry.get("total_qubits","?")}')
        for r in entry['results']:
            if r.get('p_err', 0) >= 0.10:
                print(f'  p_err={r["p_err"]:.2f}: {r["errors"]}/{r["n_trials"]}, LER={r["ler"]:.4f}')

print("\n=== P=5 TREE RESULTS (higher error rates, from 0.10_p5_results.json) ===")
with open(r'G:\My Drive\projects\_temp_uec\simulations_v2\0.10_p5_results.json', encoding='utf-8') as f:
    p5 = json.load(f)

for key in sorted(p5.keys()):
    entry = p5[key]
    depth = entry.get('depth', '?')
    barrier = entry.get('barrier', '?')
    leaves = entry.get('leaves', '?')
    print(f'\n{key}: depth={depth}, barrier={barrier}, leaves={leaves}')
    for r in entry['results']:
        print(f'  p_err={r["p_err"]:.2f}: {r["errors"]}/{r["n_trials"]}, LER={r["ler"]:.4f}')

print("\n=== FLAT ENCODING BASELINE (higher error rates, from 0.2_results.json) ===")
with open(r'G:\My Drive\projects\_temp_uec\simulations_v2\0.2_results.json', encoding='utf-8') as f:
    f2 = json.load(f)

for key in ['d2_bit0', 'd3_bit0', 'd4_bit0', 'd5_bit0']:
    entry = f2[key]
    depth = entry.get('depth', '?')
    n = entry.get('n_trials', '?')
    print(f'\n{key}: depth={depth} (Flat encoding), trials={n}')
    for r in entry['results']:
        print(f'  p_err={r["p_err"]:.2f}: {r["errors"]}/{n}, LER={r["ler"]:.4f}')
