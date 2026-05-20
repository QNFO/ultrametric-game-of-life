/**
 * D3.js Visualization — Interactive Bruhat-Tits Tree Rendering
 *
 * Renders the ultrametric tree using D3's tree layout with:
 *   - Radial node coloring (alive=green, dead=dark, mixed=yellow)
 *   - Click-to-toggle leaf states
 *   - Propagation animation
 *   - Distance measurement between nodes
 *   - Tooltips with node metadata
 */

class TreeVisualizer {
    /**
     * @param {string} svgSelector - CSS selector for the SVG element
     * @param {BruhatTitsTree} tree - The tree to visualize
     * @param {object} callbacks - Event callbacks
     */
    constructor(svgSelector, tree, callbacks = {}) {
        this.svg = d3.select(svgSelector);
        this.tree = tree;
        this.callbacks = callbacks;

        // Layout
        this.margin = { top: 20, right: 40, bottom: 20, left: 40 };
        this.duration = 500;

        // Interaction state
        this.selectedNode = null;
        this.distanceNode = null;  // Second node for distance measurement
        this.measuringDistance = false;

        // D3 layout
        this.treeLayout = d3.tree();

        // Tooltip
        this.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        this._init();
    }

    _init() {
        // Clear existing content
        this.svg.selectAll('*').remove();

        // Add a group for zoom/pan
        this.g = this.svg.append('g');

        // Add zoom behavior
        this.zoom = d3.zoom()
            .scaleExtent([0.3, 3])
            .on('zoom', (event) => {
                this.g.attr('transform', event.transform);
            });
        this.svg.call(this.zoom);

        // Initial center
        this._centerView();
    }

    _centerView() {
        const rect = this.svg.node().getBoundingClientRect();
        const cx = rect.width / 2;
        const cy = this.margin.top + 50;
        this.svg.call(this.zoom.transform,
            d3.zoomIdentity.translate(cx, cy));
    }

    /**
     * Update the visualization for the current tree state.
     * @param {object} options - { animate, highlightChanges }
     */
    update(options = {}) {
        const { animate = true, highlightChanges = [] } = options;

        // Build D3 hierarchy
        const root = this._buildHierarchy(this.tree.root);
        this.treeLayout(root);

        // Compute layout dimensions
        const descendants = root.descendants();
        const xs = descendants.map(d => d.x);
        const ys = descendants.map(d => d.y);
        const xExtent = [d3.min(xs), d3.max(xs)];
        const yExtent = [d3.min(ys), d3.max(ys)];

        // Update SVG dimensions
        const svgWidth = this.svg.node().getBoundingClientRect().width;
        const svgHeight = this.svg.node().getBoundingClientRect().height;

        // Scale to fit
        const xScale = d3.scaleLinear()
            .domain(xExtent)
            .range([this.margin.left, svgWidth - this.margin.right]);

        const yScale = d3.scaleLinear()
            .domain(yExtent)
            .range([this.margin.top, svgHeight - this.margin.bottom - 40]);

        // --- Draw edges ---
        const links = root.links();
        const edgeGroup = this.g.selectAll('.edge-group').data([0]);
        edgeGroup.enter().append('g').attr('class', 'edge-group');

        const edges = this.g.select('.edge-group').selectAll('line')
            .data(links, d => d.target.data.id);

        edges.exit()
            .transition().duration(animate ? this.duration : 0)
            .attr('opacity', 0).remove();

        const edgesEnter = edges.enter().append('line')
            .attr('class', 'edge-line')
            .attr('opacity', 0);

        edgesEnter.merge(edges)
            .transition().duration(animate ? this.duration : 0)
            .attr('x1', d => xScale(d.source.x))
            .attr('y1', d => yScale(d.source.y))
            .attr('x2', d => xScale(d.target.x))
            .attr('y2', d => yScale(d.target.y))
            .attr('opacity', 1);

        // --- Draw nodes ---
        const nodeGroup = this.g.selectAll('.node-group').data([0]);
        nodeGroup.enter().append('g').attr('class', 'node-group');

        const nodes = this.g.select('.node-group').selectAll('g.node')
            .data(descendants, d => d.data.id);

        const nodesExit = nodes.exit();
        nodesExit.transition().duration(animate ? this.duration : 0)
            .attr('opacity', 0).remove();

        const nodesEnter = nodes.enter().append('g')
            .attr('class', 'node')
            .attr('opacity', 0)
            .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`);

        // Node circles
        nodesEnter.append('circle')
            .attr('class', 'node-circle')
            .attr('r', d => this._nodeRadius(d.data));

        // Node labels (only for internal nodes and selected)
        nodesEnter.append('text')
            .attr('class', 'node-label')
            .attr('dy', d => this._nodeRadius(d.data) + 12)
            .text(d => d.data.isLeaf ? '' : '')
            .style('opacity', 0);

        // Update all nodes
        const allNodes = nodesEnter.merge(nodes);
        allNodes.transition().duration(animate ? this.duration : 0)
            .attr('transform', d => `translate(${xScale(d.x)},${yScale(d.y)})`)
            .attr('opacity', 1);

        allNodes.select('circle')
            .attr('r', d => this._nodeRadius(d.data))
            .attr('fill', d => this._nodeColor(d.data))
            .attr('stroke', d => {
                if (d.data === this.selectedNode) return '#f472b6';
                if (highlightChanges.includes(d.data)) return '#22d3ee';
                return '#334155';
            })
            .attr('class', d => {
                let cls = 'node-circle';
                if (d.data === this.selectedNode) cls += ' selected';
                if (d.data === this.distanceNode) cls += ' distance-hover';
                if (highlightChanges.includes(d.data)) cls += ' propagation';
                return cls;
            });

        // --- Event handlers ---
        allNodes.select('circle')
            .on('click', (event, d) => this._onNodeClick(event, d))
            .on('mouseover', (event, d) => this._onNodeMouseOver(event, d))
            .on('mouseout', () => this._onNodeMouseOut());

        // Store for later
        this._scales = { x: xScale, y: yScale };
    }

    _buildHierarchy(node) {
        const result = { data: node, children: [] };
        for (const child of node.children) {
            result.children.push(this._buildHierarchy(child));
        }
        return d3.hierarchy(result);
    }

    _nodeRadius(node) {
        if (node.isRoot) return 10;
        if (node.isLeaf) return 6;
        return 7 - node.depth * 0.5;
    }

    _nodeColor(node) {
        if (node.value === 1) return '#10b981';  // alive green
        if (node.value === 0) return '#334155';  // dead dark
        return '#f59e0b';  // tie/mixed yellow (shouldn't happen for leaf)
    }

    _onNodeClick(event, d) {
        const node = d.data;

        if (this.measuringDistance && node !== this.selectedNode) {
            // Complete distance measurement
            this.distanceNode = node;
            this.measuringDistance = false;
            if (this.callbacks.onDistanceMeasured) {
                this.callbacks.onDistanceMeasured(this.selectedNode, node);
            }
            this.selectedNode = null;
            this.distanceNode = null;
            this.update();
            return;
        }

        // When holding Shift, measure distance
        if (event.shiftKey) {
            if (this.selectedNode === null) {
                this.selectedNode = node;
                this.measuringDistance = true;
            } else if (node !== this.selectedNode) {
                if (this.callbacks.onDistanceMeasured) {
                    this.callbacks.onDistanceMeasured(this.selectedNode, node);
                }
                this.selectedNode = null;
                this.measuringDistance = false;
            }
            this.update();
            return;
        }

        // Normal click: select and possibly toggle leaf
        this.selectedNode = node;
        this.measuringDistance = false;

        if (node.isLeaf && this.callbacks.onLeafClick) {
            this.callbacks.onLeafClick(node);
        } else if (this.callbacks.onNodeSelect) {
            this.callbacks.onNodeSelect(node);
        }

        this.update();
    }

    _onNodeMouseOver(event, d) {
        const node = d.data;
        const [mx, my] = d3.pointer(event, document.body);

        let html = `<div class="tt-title">${node.isRoot ? '🌳 Root' :
            node.isLeaf ? '🍃 Leaf' : '🔀 Internal Node'}</div>`;
        html += `<div class="tt-row"><span>Index:</span><span>${node.index}</span></div>`;
        html += `<div class="tt-row"><span>Depth:</span><span>${node.depth}</span></div>`;
        html += `<div class="tt-row"><span>Value:</span><span style="color:${node.value === 1 ? '#10b981' : '#94a3b8'}">${node.value === 1 ? 'Alive (1)' : 'Dead (0)'}</span></div>`;
        if (!node.isLeaf) {
            html += `<div class="tt-row"><span>Children:</span><span>${node.children.length}</span></div>`;
        }

        this.tooltip.html(html)
            .style('left', (mx + 12) + 'px')
            .style('top', (my - 12) + 'px')
            .transition().duration(150)
            .style('opacity', 1);
    }

    _onNodeMouseOut() {
        this.tooltip.transition().duration(200).style('opacity', 0);
    }

    /** Highlight specific nodes temporarily */
    highlightNodes(nodes, duration = 2000) {
        // Add highlight class
        this.g.selectAll('.node-circle')
            .filter(d => nodes.includes(d.data))
            .classed('propagation', true);

        setTimeout(() => {
            this.g.selectAll('.node-circle')
                .classed('propagation', false);
        }, duration);
    }

    /** Draw a distance line between two nodes */
    drawDistanceLine(nodeA, nodeB) {
        const sc = this._scales;
        if (!sc) return;

        // Remove existing distance lines
        this.g.selectAll('.distance-line').remove();

        // Find positions
        const aPos = this._findNodePosition(nodeA);
        const bPos = this._findNodePosition(nodeB);
        if (!aPos || !bPos) return;

        this.g.append('line')
            .attr('class', 'distance-line')
            .attr('x1', sc.x(aPos.x))
            .attr('y1', sc.y(aPos.y))
            .attr('x2', sc.x(bPos.x))
            .attr('y2', sc.y(bPos.y))
            .attr('opacity', 0)
            .transition().duration(300)
            .attr('opacity', 1);
    }

    _findNodePosition(node) {
        // Search through D3 hierarchy for matching data
        let found = null;
        this.g.selectAll('.node').each(function(d) {
            if (d.data === node) found = d;
        });
        return found;
    }
}
