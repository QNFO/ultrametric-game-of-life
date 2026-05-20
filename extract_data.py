"""Extract experiment comparison data for the Virtual Qubit web app."""
import json, sys
sys.stdout.reconfigure(encoding='utf-8')

# Read 0.2_results.json — the main comparison
with open(r'G:\My Drive\projects\_temp_uec\simulations_v2\0.2_results.json', encoding='utf-8') as f:
    data = json.load(f)

print('=== TREE vs FLAT COMPARISON ===')
for key in sorted(data.keys()):
    entry = data[key]
    if 'results' not in entry:
        continue
    depth = entry.get('depth', '?')
    bit = entry.get('logical_bit', '?')
    n = entry.get('n_trials', '?')
    encoding = 'Tree' if 'tree' in key.lower() else 'Flat'
    print(f'\n{key}: {encoding}, depth={depth}, bit={bit}, trials={n}')
    
    # Find key error rates
    for r in entry['results']:
        p_err = r.get('p_err', 0)
        errors = r.get('errors', 0)
        ler = r.get('ler', 0)
        if p_err in [0.05, 0.10, 0.20, 0.30, 0.40]:
            print(f'  p_err={p_err:.2f}: {errors} errors, LER={ler:.4f}')

# Read 0.16_qec_results.json — the concatenated QEC results
with open(r'G:\My Drive\projects\_temp_uec\simulations_v2\0.16_qec_results.json', encoding='utf-8') as f:
    qec = json.load(f)

print('\n=== CONCATENATED QEC RESULTS ===')
for key in sorted(qec.keys()):
    entry = qec[key]
    if 'results' not in entry:
        continue
    print(f'\n{key}: total_qubits={entry.get("total_qubits","?")}')
    for r in entry['results'][:3]:
        p_err = r.get('p_err', 0)
        errors = r.get('errors', 0)
        ler = r.get('ler', 0)
        n = r.get('n_trials', 0)
        print(f'  p_err={p_err:.2f}: {errors}/{n}, LER={ler:.4f}')
