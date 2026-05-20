/**
 * Main Controller — Ultrametric Tree Game of Life
 *
 * Wires together: Tree Engine, Game Engine, D3 Visualization
 * Manages UI controls, mode switching, and the event loop.
 */

(function () {
    'use strict';

    // ==================== State ====================
    let tree = null;
    let game = null;
    let viz = null;
    let mode = 'interact';  // 'interact' | 'gol' | 'noise'
    let autoStepInterval = null;
    let lastStepResult = null;

    // ==================== Initialization ====================

    function init() {
        const p = parseInt(document.getElementById('prime-slider').value);
        const depth = parseInt(document.getElementById('depth-slider').value);

        tree = new BruhatTitsTree(p, depth);
        tree.randomizeLeaves();
        tree.propagateUp();

        game = new GameOfLifeEngine(tree);

        viz = new TreeVisualizer('#tree-svg', tree, {
            onLeafClick: (node) => {
                node.value = 1 - node.value;
                const changed = tree.propagateUp();
                viz.update({ highlightChanges: changed });
                updateInfoPanel(node);
                updateStats();
            },
            onNodeSelect: (node) => {
                updateInfoPanel(node);
            },
            onDistanceMeasured: (nodeA, nodeB) => {
                const dist = tree.ultrametricDistance(nodeA, nodeB);
                const lca = tree.lowestCommonAncestor(nodeA, nodeB);

                viz.drawDistanceLine(nodeA, nodeB);

                const display = document.getElementById('distance-display');
                display.innerHTML = `📏 d(${nodeA.index}, ${nodeB.index}) = <strong>${dist}</strong>  |  LCA depth: ${lca.depth}  |  Strong Δ: ✓`;
                display.classList.remove('hidden');
                setTimeout(() => display.classList.add('hidden'), 4000);
                updateInfoPanel(nodeB);
            }
        });

        viz.update();
        updateStats();
        updateModePanel();
        document.getElementById('gen-num').textContent = '0';
    }

    // ==================== Stats Update ====================

    function updateStats() {
        document.getElementById('stat-nodes').textContent = tree.numNodes;
        document.getElementById('stat-leaves').textContent = tree.numLeaves;

        document.getElementById('prime-value').textContent = tree.p;
        document.getElementById('depth-value').textContent = tree.depth;
    }

    function updateInfoPanel(node) {
        if (!node) {
            document.getElementById('node-info').innerHTML =
                '<span style="color:#64748b">Click a node to inspect</span>';
            return;
        }
        const info = document.getElementById('node-info');
        const val = node.value === 1 ? '<span style="color:#10b981">Alive (1)</span>' :
            '<span style="color:#94a3b8">Dead (0)</span>';
        info.innerHTML = `
            <span class="highlight">Node #${node.index}</span><br>
            Type: ${node.isRoot ? 'Root' : node.isLeaf ? 'Leaf' : 'Internal'}<br>
            Depth: ${node.depth}<br>
            Value: ${val}<br>
            ${!node.isLeaf ? `Children: ${node.children.length}` : ''}
            ${node.isLeaf ? `<br>Parent: #${node.parent ? node.parent.index : '—'}` : ''}
        `;
    }

    // ==================== Tree Rebuild ====================

    function rebuildTree() {
        const p = parseInt(document.getElementById('prime-slider').value);
        const depth = parseInt(document.getElementById('depth-slider').value);

        if (tree && tree.p === p && tree.depth === depth) return;

        tree = new BruhatTitsTree(p, depth);
        tree.randomizeLeaves();
        tree.propagateUp();

        game = new GameOfLifeEngine(tree);
        viz.tree = tree;
        viz.selectedNode = null;
        viz.distanceNode = null;
        viz._init();
        viz.update();
        updateStats();
        document.getElementById('gen-num').textContent = '0';

        // Update info panel
        document.getElementById('node-info').innerHTML =
            '<span style="color:#64748b">Tree rebuilt. Click a node to inspect</span>';
    }

    // ==================== Actions ====================

    function doRandomize() {
        tree.randomizeLeaves();
        const changed = tree.propagateUp();
        game.generation = 0;
        game.history = [];
        viz.selectedNode = null;
        viz.update({ highlightChanges: changed });
        updateStats();
        document.getElementById('gen-num').textContent = '0';
        document.getElementById('node-info').innerHTML =
            '<span style="color:#64748b">Leaves randomized. Propagated up.</span>';
    }

    function doPropagate() {
        const changed = tree.propagateUp();
        viz.update({ highlightChanges: changed });
        updateStats();
        document.getElementById('node-info').innerHTML =
            `<span style="color:#22d3ee">Propagated — ${changed.length} nodes changed</span>`;
    }

    function doReset() {
        tree.resetValues(0);
        game.generation = 0;
        game.history = [];
        viz.selectedNode = null;
        viz.distanceNode = null;
        viz.update();
        document.getElementById('gen-num').textContent = '0';
        document.getElementById('node-info').innerHTML =
            '<span style="color:#64748b">All nodes reset to Dead (0)</span>';
    }

    function doStep() {
        const result = game.step();
        lastStepResult = result;
        viz.update({ highlightChanges: [...result.leafChanges, ...result.propChanges] });
        document.getElementById('gen-num').textContent = result.generation;
        document.getElementById('node-info').innerHTML = `
            <span style="color:#22d3ee">Generation ${result.generation}</span><br>
            Leaf flips: ${result.leafChanges.length}<br>
            Propagation changes: ${result.propChanges.length}<br>
            Root: ${result.rootValue === 1 ?
                '<span style="color:#10b981">Alive</span>' :
                '<span style="color:#94a3b8">Dead</span>'}
        `;

        // Check stability
        if (game.isStable()) {
            document.getElementById('node-info').innerHTML +=
                '<br><span style="color:#f59e0b">⚠️ Stable state reached</span>';
            stopAutoStep();
        }
    }

    function doNoiseStep() {
        const rate = parseFloat(document.getElementById('noise-rate').value) || 0.1;
        const result = game.applyNoise(rate);
        lastStepResult = result;
        viz.update({ highlightChanges: [...result.flipped, ...result.propChanges] });
        updateStats();

        // Compute error stats
        const rootFlipped = tree.root.value !== (game.history.length > 0 ?
            game.history[game.history.length - 1].rootValue : 0);
        document.getElementById('node-info').innerHTML = `
            <span style="color:#ef4444">Noise ${(rate * 100).toFixed(0)}%</span><br>
            Leaves flipped: ${result.flipped.length} / ${tree.numLeaves}<br>
            Propagation changes: ${result.propChanges.length}<br>
            Root flipped: ${rootFlipped ? '<span style="color:#ef4444">YES ⚠️</span>' :
                '<span style="color:#10b981">NO ✓ (confined)</span>'}
        `;
    }

    // ==================== Auto-Step ====================

    function startAutoStep() {
        if (autoStepInterval) return;
        const speed = parseInt(document.getElementById('auto-speed').value) || 500;
        autoStepInterval = setInterval(() => {
            if (mode === 'gol') doStep();
            else if (mode === 'noise') doNoiseStep();
        }, speed);
        document.getElementById('btn-step').textContent = '⏸️ Stop';
    }

    function stopAutoStep() {
        if (autoStepInterval) {
            clearInterval(autoStepInterval);
            autoStepInterval = null;
        }
        document.getElementById('btn-step').textContent = '▶️ Single Step';
    }

    function toggleAutoStep() {
        if (autoStepInterval) {
            stopAutoStep();
        } else {
            startAutoStep();
        }
    }

    // ==================== Mode Switching ====================

    function setMode(newMode) {
        mode = newMode;
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        stopAutoStep();
        updateModePanel();
    }

    function updateModePanel() {
        const panel = document.getElementById('mode-panel');
        const stepBtn = document.getElementById('btn-step');

        switch (mode) {
            case 'interact':
                panel.innerHTML = `
                    <p style="color:var(--text-dim);font-size:0.75rem;margin-top:4px;">
                        🖱️ <strong>Click</strong> leaves to toggle states<br>
                        🔄 <strong>Shift+Click</strong> two nodes to measure ultrametric distance<br>
                        ⬆️ Use <strong>Propagate Up</strong> to run majority vote
                    </p>
                `;
                stepBtn.style.display = 'none';
                break;

            case 'gol':
                panel.innerHTML = `
                    <label>
                        Speed (ms)
                        <input type="number" id="auto-speed" value="500" min="50" max="5000" step="50">
                    </label>
                    <p style="color:var(--text-dim);font-size:0.7rem;margin-top:4px;">
                        🧬 Conway-adapted rules on sibling groups.<br>
                        Survive: 25-75% siblings alive<br>
                        Birth: ≥50% siblings alive<br>
                        After leaf update → propagate up
                    </p>
                `;
                stepBtn.style.display = 'block';
                stepBtn.textContent = '▶️ Single Step';
                break;

            case 'noise':
                panel.innerHTML = `
                    <label>
                        Noise Rate
                        <input type="number" id="noise-rate" value="0.10" min="0.01" max="0.50" step="0.01">
                    </label>
                    <label>
                        Speed (ms)
                        <input type="number" id="auto-speed" value="1000" min="100" max="5000" step="100">
                    </label>
                    <p style="color:var(--text-dim);font-size:0.7rem;margin-top:4px;">
                        🎲 Random bit-flip noise on leaves.<br>
                        Watch ultrametric error confinement:<br>
                        errors in one subtree stay confined!
                    </p>
                `;
                stepBtn.style.display = 'block';
                stepBtn.textContent = '▶️ Single Noise Shot';
                break;
        }
    }

    // ==================== Event Bindings ====================

    function bindEvents() {
        // Tree parameter sliders
        document.getElementById('prime-slider').addEventListener('input', () => {
            document.getElementById('prime-value').textContent =
                document.getElementById('prime-slider').value;
        });
        document.getElementById('prime-slider').addEventListener('change', rebuildTree);

        document.getElementById('depth-slider').addEventListener('input', () => {
            document.getElementById('depth-value').textContent =
                document.getElementById('depth-slider').value;
        });
        document.getElementById('depth-slider').addEventListener('change', rebuildTree);

        // Mode buttons
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => setMode(btn.dataset.mode));
        });

        // Action buttons
        document.getElementById('btn-randomize').addEventListener('click', doRandomize);
        document.getElementById('btn-propagate').addEventListener('click', doPropagate);
        document.getElementById('btn-reset').addEventListener('click', doReset);
        document.getElementById('btn-step').addEventListener('click', () => {
            if (autoStepInterval) {
                stopAutoStep();
            } else if (mode === 'gol') {
                doStep();
            } else if (mode === 'noise') {
                doNoiseStep();
            }
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch (e.key.toLowerCase()) {
                case 'r': doRandomize(); break;
                case 'p': doPropagate(); break;
                case 'x': doReset(); break;
                case ' ': e.preventDefault(); toggleAutoStep(); break;
                case 'arrowright':
                    if (mode === 'gol') doStep();
                    else if (mode === 'noise') doNoiseStep();
                    break;
                case '1': setMode('interact'); break;
                case '2': setMode('gol'); break;
                case '3': setMode('noise'); break;
            }
        });

        // Window resize
        window.addEventListener('resize', () => {
            if (viz) viz.update();
        });
    }

    // ==================== Startup ====================

    document.addEventListener('DOMContentLoaded', () => {
        bindEvents();
        init();
        console.log('🌳 Ultrametric Tree Game of Life initialized');
        console.log(`   Tree: p=${tree.p}, depth=${tree.depth}`);
        console.log(`   Nodes: ${tree.numNodes}, Leaves: ${tree.numLeaves}`);
        console.log('   Based on: QNFO/ultrametric-error-confinement');
        console.log('   DOI: 10.5281/zenodo.20154557, 10.5281/zenodo.20134944');
        console.log('   Controls: Click=toggle | Shift+Click=distance | R=randomize | P=propagate | Space=auto');
    });
})();
