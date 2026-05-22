/**
 * Paper Data Chart — Embedded Validation Paper Table 1 as D3 scatter plot.
 * Shows Tree vs Flat LER at all depths and error rates.
 * Highlights current simulation parameters.
 */
class PaperDataChart {
    constructor(containerId) {
        this.container = d3.select('#' + containerId);
        this.width = 240;
        this.height = 160;
        this.margin = { top: 8, right: 8, bottom: 22, left: 32 };
        this._init();
    }

    _init() {
        this.svg = this.container.append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);
    }

    // Paper Table 1 data
    static get DATA() {
        return {
            p_err: [0.01, 0.05, 0.10, 0.15, 0.20, 0.25, 0.30, 0.35, 0.40],
            tree: {
                d2: [0.0000, 0.0000, 0.0020, 0.0020, 0.0040, 0.0120, 0.0180, 0.0520, 0.0720],
                d3: [0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000],
                d4: [0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000],
                d5: [0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000],
            },
            flat: {
                d2: [0.0000, 0.0000, 0.0000, 0.0060, 0.0240, 0.0520, 0.0700, 0.1180, 0.1660],
                d3: [0.0000, 0.0000, 0.0000, 0.0000, 0.0040, 0.0160, 0.0440, 0.0720, 0.1520],
                d4: [0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0120, 0.0320, 0.0860],
                d5: [0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0000, 0.0180, 0.0540],
            }
        };
    }

    update(currentP = 2, currentD = 4, currentPErr = 0.35, currentTreeLER = null, currentGridLER = null) {
        this.svg.selectAll('*').remove();
        const g = this.svg.append('g')
            .attr('transform', `translate(${this.margin.left},${this.margin.top})`);
        const w = this.width - this.margin.left - this.margin.right;
        const h = this.height - this.margin.top - this.margin.bottom;

        const data = PaperDataChart.DATA;
        const maxLER = 0.20;

        const xScale = d3.scaleLinear().domain([0, 0.45]).range([0, w]);
        const yScale = d3.scaleLinear().domain([0, maxLER]).range([h, 0]);

        // Axes
        g.append('g').attr('transform', `translate(0,${h})`)
            .call(d3.axisBottom(xScale).ticks(4).tickFormat(d => d.toFixed(2)))
            .selectAll('text').attr('fill', '#64748b').attr('font-size', '7px');
        g.append('g')
            .call(d3.axisLeft(yScale).ticks(3).tickFormat(d => (d*100).toFixed(0) + '%'))
            .selectAll('text').attr('fill', '#64748b').attr('font-size', '7px');

        // Axis labels
        g.append('text').attr('x', w/2).attr('y', h+14).attr('text-anchor','middle')
            .attr('fill','#64748b').attr('font-size','7px').text('p_err');
        g.append('text').attr('x', -20).attr('y', -2).attr('text-anchor','middle')
            .attr('fill','#64748b').attr('font-size','7px').text('LER');

        // Tree lines (green, dashed)
        const treeColors = { d2: '#34d399', d3: '#10b981', d4: '#059669', d5: '#047857' };
        const flatColors = { d2: '#f87171', d3: '#ef4444', d4: '#dc2626', d5: '#b91c1c' };

        ['d2','d3','d4','d5'].forEach(depth => {
            const treeLine = d3.line()
                .x((d,i) => xScale(data.p_err[i]))
                .y(d => yScale(d))
                .defined(d => d > 0 || depth === 'd3');
            const treePoints = data.tree[depth];
            g.append('path').datum(treePoints)
                .attr('fill','none').attr('stroke', treeColors[depth])
                .attr('stroke-width', 1.5).attr('stroke-dasharray','3,2')
                .attr('d', treeLine);
        });

        ['d2','d3','d4','d5'].forEach(depth => {
            const flatLine = d3.line()
                .x((d,i) => xScale(data.p_err[i]))
                .y(d => yScale(d));
            const flatPoints = data.flat[depth];
            g.append('path').datum(flatPoints)
                .attr('fill','none').attr('stroke', flatColors[depth])
                .attr('stroke-width', 1.5)
                .attr('d', flatLine);
        });

        // Current simulation point
        if (currentTreeLER !== null) {
            g.append('circle')
                .attr('cx', xScale(currentPErr))
                .attr('cy', yScale(Math.min(currentTreeLER, maxLER)))
                .attr('r', 4).attr('fill', '#10b981').attr('stroke', '#fff').attr('stroke-width', 1);
        }
        if (currentGridLER !== null) {
            g.append('circle')
                .attr('cx', xScale(currentPErr))
                .attr('cy', yScale(Math.min(currentGridLER, maxLER)))
                .attr('r', 4).attr('fill', '#ef4444').attr('stroke', '#fff').attr('stroke-width', 1);
        }

        // Legend
        const legend = g.append('g').attr('transform', `translate(${w-55},0)`);
        legend.append('text').attr('fill','#10b981').attr('font-size','6px').attr('y',0).text('Tree');
        legend.append('text').attr('fill','#ef4444').attr('font-size','6px').attr('y',8).text('Flat');

        // Depth labels
        const depthColors = {d2:'#64748b', d3:'#94a3b8', d4:'#cbd5e1', d5:'#e2e8f0'};
        const depthLegend = g.append('g').attr('transform', `translate(${w-55},16)`);
        Object.entries(depthColors).forEach(([d, c], i) => {
            depthLegend.append('text').attr('fill',c).attr('font-size','5px').attr('y',i*6).text(d);
        });
    }
}
