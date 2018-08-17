import React from 'react';
import {hierarchy as d3Hierarchy, tree as d3Tree} from 'd3-hierarchy';
import {event as d3Event, select as d3Select} from 'd3-selection';
import {zoom as d3Zoom} from 'd3-zoom';
import 'd3-transition';
import Constants from '../../Constants';
import {getNodeName, getStruct} from '../../server/featureModel';
import {updateRect} from '../../helpers/svgUtils';

class AbstractTreeLayout extends React.Component {
    static defaultProps = {
        featureModel: null, width: '100%', height: '100%',
        fitOnResize: false, debug: false, useTransitions: true
    };
    svgRef = React.createRef();
    currentCoordinates = {};
    previousCoordinates = {};

    constructor(props, TreeNode, TreeLink) {
        super(props);
        this.treeNode = new TreeNode(props.debug);
        this.treeLink = new TreeLink(
            this.getParentCoordinateFn('currentCoordinates'),
            this.getParentCoordinateFn('previousCoordinates'),
            this.treeNode);
        this.treeNode.treeLink = this.treeLink;
    }

    componentDidMount() {
        this.renderD3();
    };

    componentDidUpdate(prevProps) {
        if (this.props !== prevProps)
            this.updateD3(
                this.props.width !== prevProps.width ||
                this.props.height !== prevProps.height);
    }

    render() {
        return <svg ref={this.svgRef}/>;
    }

    canExport() {
        return !!this.svgRef.current;
    }

    export() {
        return window.fetch(Constants.font.publicPath)
            .then(response => response.blob())
            .then(blob => new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onerror = reject;
                reader.onload = () => resolve(reader.result);
                reader.readAsDataURL(blob);
            })).then(fontData => {
                const svgRoot = this.svgRef.current.cloneNode(true);
                const style = svgRoot.querySelector('style');
                style.textContent = `
                    @font-face {
                        font-family: '${Constants.font.family}';
                        src: url("${fontData}");
                    }
                ${style.textContent}`;
                return new XMLSerializer().serializeToString(svgRoot);
            });
    }

    getKeyFn(kind) {
        return d => `${kind}_${getNodeName(d)}`;
    }

    updateCoordinates(key, nodes) {
        this[key] = {};
        nodes.forEach(node => this[key][getNodeName(node)] = {x: this.treeNode.x(node), y: this.treeNode.y(node)});
    }

    getParentCoordinateFn(key) {
        return (node, axis) => {
            if (node.parent) {
                const coords = this[key][getNodeName(node.parent)];
                return coords ? coords[axis] : this.treeNode[axis](node.parent);
            } else
                return this.treeNode[axis](node);
        };
    }

    getSeparationFn(estimateTextWidth) {
        throw new Error("abstract method not implemented");
    }

    estimateXOffset(sgn, estimatedTextWidth) {
        throw new Error("abstract method not implemented");
    }

    estimateYOffset(sgn) {
        throw new Error("abstract method not implemented");
    }

    createLayoutHook(nodes) {
    }

    createLayout({featureModel}) {
        const estimateTextWidth = this.treeNode.estimateTextWidth.bind(this.treeNode),
            hierarchy = d3Hierarchy(getStruct(featureModel)),
            tree = d3Tree()
                .nodeSize(Constants.treeLayout.node.size)
                .separation(this.getSeparationFn(estimateTextWidth)),
            nodes = hierarchy.descendants();
        tree(hierarchy);
        this.createLayoutHook(nodes);

        const findNode = compareFn => nodes.reduce((acc, d) => compareFn(acc, d) ? acc : d),
            estimateX = (d, sgn) => this.treeNode.x(d) + this.estimateXOffset(sgn, estimateTextWidth(d)),
            estimateY = (d, sgn) => this.treeNode.y(d) + this.estimateYOffset(sgn),
            estimatedBbox = [[
                estimateX(findNode((a, b) => estimateX(a, -1) < estimateX(b, -1)), -1),
                estimateY(findNode((a, b) => estimateY(a, -1) < estimateY(b, -1)), -1)
            ], [
                estimateX(findNode((a, b) => estimateX(a, 1) > estimateX(b, 1)), 1),
                estimateY(findNode((a, b) => estimateY(a, 1) > estimateY(b, 1)), 1)
            ]];

        return {nodes, estimatedBbox};
    }

    getSvgRoot({width, height, fitOnResize, debug}, estimatedBbox, isCreating, isResize) {
        const svgRoot = d3Select(this.svgRef.current)
                .attr('style', `width: ${width}; height: ${height};`),
            defs = isCreating ? svgRoot.append('defs') : svgRoot.select('defs'),
            style = isCreating ? defs.append('style') : defs.select('style'),
            g = isCreating ? svgRoot.append('g') : svgRoot.select('g'),
            rect = isCreating ? g.append('rect') : g.select('rect'),
            zoom = d3Zoom(),
            estimatedBboxWidth = estimatedBbox[1][0] - estimatedBbox[0][0],
            estimatedBboxHeight = estimatedBbox[1][1] - estimatedBbox[0][1];

        style.attr('type', 'text/css').text(`
            svg {
                font-family: '${Constants.font.family}';
                font-size: ${Constants.font.size}px;
            }
        `);

        if (debug)
            this.transition(rect)
                .call(updateRect, {
                    x: estimatedBbox[0][0],
                    y: estimatedBbox[0][1],
                    width: estimatedBboxWidth,
                    height: estimatedBboxHeight
                });

        svgRoot.call(zoom
            .translateExtent(estimatedBbox)
            .scaleExtent(Constants.treeLayout.scaleExtent)
            .on('zoom', () => g.attr('transform', d3Event.transform)));

        if (isCreating || (fitOnResize && isResize))
            svgRoot.call(zoom.scaleTo, Math.min(1,
                this.svgRef.current.clientWidth / estimatedBboxWidth,
                this.svgRef.current.clientHeight / estimatedBboxHeight));
        if (isCreating)
            this.treeNode.createSvgHook(g);

        return g;
    }

    joinNodes(nodes, svgRoot) {
        return svgRoot.selectAll('.node').data(nodes, this.getKeyFn('node'));
    }

    joinLinks(nodes, svgRoot) {
        return svgRoot.selectAll('.link').data(nodes.slice(1), this.getKeyFn('link'));
    }

    joinData(isCreating, isResize = false) {
        const {nodes, estimatedBbox} = this.createLayout(this.props);
        const svgRoot = this.getSvgRoot(this.props, estimatedBbox, isCreating, isResize);
        const linkInBack = this.joinLinks(nodes,
            isCreating ? svgRoot.append('g').attr('class', 'linksInBack') : svgRoot.select('g.linksInBack'));
        const node = this.joinNodes(nodes,
            isCreating ? svgRoot.append('g').attr('class', 'nodes') : svgRoot.select('g.nodes'));
        const linkInFront = this.joinLinks(nodes,
            isCreating ? svgRoot.append('g').attr('class', 'linksInFront') : svgRoot.select('g.linksInFront'));
        return {node, linkInBack, linkInFront, nodes};
    }

    transition(selection, useTransitions, duration = Constants.treeLayout.duration) {
        return this.props.useTransitions ? selection.transition().duration(duration) : selection;
    }

    renderD3() {
        // On initial render, all nodes/links are entering.
        // Thus, make them enter at their beginning position, then update them
        // instantly to their final position, without transitioning.
        const {node, linkInBack, linkInFront, nodes} = this.joinData(true);
        this.updateCoordinates('currentCoordinates', nodes);
        this.treeNode.update(this.treeNode.enter(node.enter()));
        this.treeLink.update(this.treeLink.enter(linkInBack.enter(), 'inBack'), 'inBack');
        this.treeLink.update(this.treeLink.enter(linkInFront.enter(), 'inFront'), 'inFront');
        this.updateCoordinates('previousCoordinates', nodes);
    }

    updateD3(isResize) {
        // On following renders, enter new nodes/links at their beginning position.
        // Then merge with updating nodes/links and transition to the final position.
        // Exiting nodes/links are simply removed after a transition.
        const {node, linkInBack, linkInFront, nodes} = this.joinData(false, isResize);
        this.updateCoordinates('currentCoordinates', nodes);
        this.treeNode.update(this.transition(this.treeNode.enter(node.enter()).merge(node)));
        this.treeLink.update(this.transition(this.treeLink.enter(linkInBack.enter(), 'inBack').merge(linkInBack)), 'inBack');
        this.treeLink.update(this.transition(this.treeLink.enter(linkInFront.enter(), 'inFront').merge(linkInFront)), 'inFront');
        this.treeNode.exit(this.transition(node.exit()));
        this.treeLink.exit(this.transition(linkInBack.exit()), 'inBack');
        this.treeLink.exit(this.transition(linkInFront.exit()), 'inFront');
        this.updateCoordinates('previousCoordinates', nodes);
    }
}

export default AbstractTreeLayout;