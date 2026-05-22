/**
 * Dual Visualization — Ultrametric Tree vs Surface Code Grid
 *
 * Renders both encoding schemes side-by-side, synchronized.
 * Tree: D3 radial tree layout showing the Bruhat-Tits hierarchy
 * Grid: D3 matrix layout showing the 2D surface code lattice
 */

class DualVisualizer {
    constructor(treeSvgSelector, gridSvgSelector, tree, grid, callbacks = {}) {
        this.treeSvg = d3.select(treeSvgSelector);
        this.gridSvg = d3.select(gridSvgSelector);
        this.tree = tree;
        this.grid = grid;
        this.cb = callbacks;

        // Tree layout
        this.treeLayout = d3.tree().nodeSize([20, 60]);
        this.treeG = this.treeSvg.append('g');
        this.treeZoom = d3.zoom().scaleExtent([0.3, 3]).on('zoom', (e) => {
            this.treeG.attr('transform', e.transform);
        });
        this.treeSvg.call(this.treeZoom);

        // Grid layout
        this.gridG = this.gridSvg.append('g');
        this.gridZoom = d3.zoom().scaleExtent([0.5, 4]).on('zoom', (e) => {
            this.gridG.attr('transform', e.transform);
        });
        this.gridSvg.call(this.gridZoom);

        // Tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'qbtooltip')
            .style('opacity', 0);

        // Selection state
        this.selectedTreeNode = null;
        this.selectedGridQubit = null;
        this.distanceNode = null;

        this.render();
    }

    // ============== TREE RENDERING ==============

    _buildTreeHierarchy(node) {
        const obj = { data: node, children: [] };
        for (const child of node.children) {
            obj.children.push(this._buildTreeHierarchy(child));
        }
        return d3.hierarchy(obj);
    }

    renderTree() {
        // Decay animation counters
        this.tree.tickAnimations();

        const root = this._buildTreeHierarchy(this.tree.root);
        this.treeLayout(root);

        const descendants = root.descendants();
        const xs = descendants.map(d => d.x);
        const ys = descendants.map(d => d.y);
        const xExtent = d3.extent(xs);
        const yExtent = d3.extent(ys);

        const svgW = this.treeSvg.node().getBoundingClientRect().width;
        const svgH = this.treeSvg.node().getBoundingClientRect().height;

        const scaleX = d3.scaleLinear().domain(xExtent).range([60, svgW - 60]);
        const scaleY = d3.scaleLinear().domain(yExtent).range([30, svgH - 30]);

        // Edges
        const links = root.links();
        this.treeG.selectAll('line.tree-edge').data(links, d => d.target.data.id).join(
            enter => enter.append('line').attr('class', 'tree-edge'),
            update => update,
            exit => exit.remove()
        )
        .attr('x1', d => scaleX(d.source.x))
        .attr('y1', d => scaleY(d.source.y))
        .attr('x2', d => scaleX(d.target.x))
        .attr('y2', d => scaleY(d.target.y));

        // Nodes
        const nodeGroups = this.treeG.selectAll('g.tree-node').data(descendants, d => d.data.id).join(
            enter => {
                const g = enter.append('g').attr('class', 'tree-node');
                g.append('circle').attr('class', 'tcircle');
                g.append('text').attr('class', 'tlabel');
                return g;
            },
            update => update,
            exit => exit.remove()
        );

        nodeGroups.attr('transform', d => `translate(${scaleX(d.x)},${scaleY(d.y)})`);

        nodeGroups.select('circle.tcircle')
            .attr('r', d => d.data.isLeaf ? 5 : d.data.isRoot ? 10 : 7 - d.data.depth * 0.3)
            .attr('fill', d => this._treeColor(d.data))
            .attr('stroke', d => {
                if (d.data.error) return '#ef4444';
                if (d.data.propagationFlash > 0) return '#22d3ee';
                if (d.data === this.selectedTreeNode) return '#f472b6';
                return '#334155';
            })
            .attr('stroke-width', d => {
                if (d.data.error || d.data.propagationFlash > 0) return 3;
                if (d.data === this.selectedTreeNode) return 3;
                return 1.5;
            })
            .attr('class', d => {
                let cls = 'tcircle';
                if (d.data.error) cls += ' error-flash';
                if (d.data.propagationFlash > 0) cls += ' propagate-flash';
                return cls;
            })
            .on('click', (event, d) => this._onTreeClick(event, d))
            .on('mouseover', (event, d) => this._onTreeHover(event, d))
            .on('mouseout', () => this.tooltip.style('opacity', 0));

        nodeGroups.select('text.tlabel')
            .text(d => {
                if (d.data.isRoot) return 'L';
                if (d.data.depth === 1) return 'V' + d.data.index;
                return '';
            })
            .attr('dy', d => d.data.isRoot ? -14 : 14)
            .attr('text-anchor', 'middle')
            .attr('fill', '#64748b')
            .attr('font-size', '9px');
    }

    _treeColor(node) {
        if (node.error) return '#ef4444';
        if (node.propagationFlash > 0) return '#22d3ee';
        if (node.value === 1) return '#10b981';
        return '#1e293b';
    }

    _onTreeClick(event, d) {
        const node = d.data;
        if (event.shiftKey && node.isLeaf) {
            // Shift+Click: measure ultrametric distance
            if (this.distanceNode && this.distanceNode !== node) {
                const dist = this.tree.ultrametricDistance(this.distanceNode, node);
                if (this.cb.onDistance) this.cb.onDistance(this.distanceNode, node, dist);
                this.distanceNode = null;
            } else {
                this.distanceNode = node;
            }
        } else if (node.isLeaf) {
            // Normal click on leaf: toggle value and propagate up
            node.value = 1 - node.value;
            node.error = false;
            this.tree.decode();
            this.selectedTreeNode = node;
            if (this.cb.onTreeSelect) this.cb.onTreeSelect(node);
        } else {
            // Click on internal node: select and show info
            this.selectedTreeNode = node;
            if (this.cb.onTreeSelect) this.cb.onTreeSelect(node);
        }
        this.renderTree();
    }

    _onTreeHover(event, d) {
        const node = d.data;
        const kind = node.isRoot ? 'Logical Qubit (Root)' :
            node.isLeaf ? 'Physical Qubit (Leaf)' : `Virtual Qubit (depth ${node.depth})`;
        let html = `<div class="tt-title">🌳 ${kind}</div>`;
        html += `<div>ID: ${node.id} | Value: <span style="color:${node.value === 1 ? '#10b981' : '#94a3b8'}">${node.value}</span></div>`;
        if (node.error) html += `<div style="color:#ef4444">⚠️ ERROR: Value flipped!</div>`;
        if (node.propagationFlash > 0) html += `<div style="color:#22d3ee">⚡ Propagation in progress</div>`;
        this.tooltip.html(html)
            .style('left', (event.pageX + 12) + 'px')
            .style('top', (event.pageY - 12) + 'px')
            .style('opacity', 1);
    }

    // ============== GRID RENDERING ==============

    renderGrid() {
        const cellSize = Math.min(
            this.gridSvg.node().getBoundingClientRect().width / (this.grid.width + 2),
            this.gridSvg.node().getBoundingClientRect().height / (this.grid.height + 2),
            40
        );

        const offsetX = (this.gridSvg.node().getBoundingClientRect().width - this.grid.width * cellSize) / 2;
        const offsetY = (this.gridSvg.node().getBoundingClientRect().height - this.grid.height * cellSize) / 2;

        // Draw check operators (plaquettes) — light gray squares between 4 qubits
        const plaquettes = [];
        for (let y = 0; y < this.grid.height - 1; y++) {
            for (let x = 0; x < this.grid.width - 1; x++) {
                plaquettes.push({ x, y });
            }
        }

        this.gridG.selectAll('rect.plaquette').data(plaquettes).join('rect')
            .attr('class', 'plaquette')
            .attr('x', d => offsetX + d.x * cellSize + cellSize * 0.25)
            .attr('y', d => offsetY + d.y * cellSize + cellSize * 0.25)
            .attr('width', cellSize * 0.5)
            .attr('height', cellSize * 0.5)
            .attr('fill', '#0f172a')
            .attr('stroke', '#1e293b')
            .attr('stroke-width', 1)
            .attr('rx', 4);

        // Draw connections (edges between neighboring qubits)
        const edges = [];
        for (const q of this.grid.qubits) {
            for (const n of this.grid.getNeighbors(q)) {
                if (q.index < n.index) {
                    edges.push({
                        x1: offsetX + q.x * cellSize + cellSize / 2,
                        y1: offsetY + q.y * cellSize + cellSize / 2,
                        x2: offsetX + n.x * cellSize + cellSize / 2,
                        y2: offsetY + n.y * cellSize + cellSize / 2,
                        hasError: q.error || n.error
                    });
                }
            }
        }

        this.gridG.selectAll('line.grid-edge').data(edges).join('line')
            .attr('class', 'grid-edge')
            .attr('x1', d => d.x1).attr('y1', d => d.y1)
            .attr('x2', d => d.x2).attr('y2', d => d.y2)
            .attr('stroke', d => d.hasError ? '#7f1d1d' : '#1e293b')
            .attr('stroke-width', d => d.hasError ? 2 : 1);

        // Draw qubits
        const qGroups = this.gridG.selectAll('g.grid-qubit').data(this.grid.qubits, d => d.index).join(
            enter => {
                const g = enter.append('g').attr('class', 'grid-qubit');
                g.append('rect').attr('class', 'gq-rect');
                g.append('text').attr('class', 'gq-text');
                return g;
            },
            update => update,
            exit => exit.remove()
        );

        qGroups.attr('transform', d =>
            `translate(${offsetX + d.x * cellSize + cellSize / 2},${offsetY + d.y * cellSize + cellSize / 2})`);

        qGroups.select('rect.gq-rect')
            .attr('x', -cellSize * 0.35)
            .attr('y', -cellSize * 0.35)
            .attr('width', cellSize * 0.7)
            .attr('height', cellSize * 0.7)
            .attr('rx', 4)
            .attr('fill', d => d.error ? '#7f1d1d' : d.value === 1 ? '#065f46' : '#1e293b')
            .attr('stroke', d => {
                if (d.error) return '#ef4444';
                if (d === this.selectedGridQubit) return '#f472b6';
                return '#334155';
            })
            .attr('stroke-width', d => d.error || d === this.selectedGridQubit ? 2 : 1)
            .on('click', (event, d) => {
                this.selectedGridQubit = d;
                if (this.cb.onGridSelect) this.cb.onGridSelect(d);
                this.renderGrid();
            })
            .on('mouseover', (event, d) => {
                let html = `<div class="tt-title">🔲 Grid Qubit #${d.index}</div>`;
                html += `<div>Position: (${d.x}, ${d.y}) | Value: <span style="color:${d.value === 1 ? '#10b981' : '#94a3b8'}">${d.value}</span></div>`;
                if (d.error) html += `<div style="color:#ef4444">⚠️ ERROR: Bit flip!</div>`;
                this.tooltip.html(html)
                    .style('left', (event.pageX + 12) + 'px')
                    .style('top', (event.pageY - 12) + 'px')
                    .style('opacity', 1);
            })
            .on('mouseout', () => this.tooltip.style('opacity', 0));

        qGroups.select('text.gq-text')
            .attr('dy', '0.35em')
            .attr('text-anchor', 'middle')
            .attr('fill', d => d.value === 1 ? '#6ee7b7' : '#64748b')
            .attr('font-size', '8px')
            .text(d => d.value === 1 ? '1' : '0');
    }

    // ============== RENDER ALL ==============

    render() {
        this.renderTree();
        this.renderGrid();
    }

    /** Highlight noise and propagation during a trial animation */
    highlightNoise(treeFlipped, gridFlipped) {
        // Error highlighting already handled via node.error/q.error in render
        this.render();

        // Flash summary in the central divider
        if (this.cb.onFlash) {
            const msg = `${treeFlipped.length} tree qubits, ${gridFlipped.length} grid qubits flipped`;
            this.cb.onFlash(msg);
        }
    }

    highlightResult(treeError, gridError) {
        this.render();
        if (this.cb.onResult) {
            this.cb.onResult(treeError, gridError);
        }
    }
}
