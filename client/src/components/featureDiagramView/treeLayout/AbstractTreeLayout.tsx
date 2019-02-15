/**
 * Abstract tree layout for a feature diagram.
 * The layout direction (vertical or horizontal) remains unspecified.
 */

import React, {CSSProperties} from 'react';
import {tree as d3Tree} from 'd3-hierarchy';
import {event as d3Event, select as d3Select} from 'd3-selection';
import {zoom as d3Zoom} from 'd3-zoom';
import 'd3-transition';
import {Settings} from '../../../store/settings';
import {updateRect} from '../../../helpers/svg';
import '../../../stylesheets/treeLayout.css';
import {D3Selection, Bbox, OverlayType, isFloatingFeatureOverlay, OverlayProps} from '../../../types';
import FeatureModel from '../../../modeling/FeatureModel';
import AbstractTreeNode from './AbstractTreeNode';
import AbstractTreeLink from './AbstractTreeLink';
import {OnShowOverlayFunction, OnHideOverlayFunction, OnSetSelectMultipleFeaturesFunction, OnSelectFeatureFunction, OnDeselectFeatureFunction, OnExpandFeaturesFunction, OnDeselectAllFeaturesFunction, OnToggleFeatureGroupTypeFunction, OnToggleFeatureOptionalFunction} from '../../../store/types';
import logger from '../../../helpers/logger';
import {FeatureNode, NodeCoordinateForAxisFunction} from '../../../modeling/types';
import constants from '../../../constants';

const tag = 'feature diagram';

export interface AbstractTreeLayoutProps {
    featureModel: FeatureModel,
    debug: boolean,
    width?: number,
    height?: number,
    className?: string,
    style?: CSSProperties,
    fitOnResize: boolean,
    settings: Settings,
    overlay: OverlayType,
    overlayProps: OverlayProps,
    isSelectMultipleFeatures: boolean,
    selectedFeatureIDs: string[],
    onShowOverlay: OnShowOverlayFunction,
    onHideOverlay: OnHideOverlayFunction,
    onSetSelectMultipleFeatures: OnSetSelectMultipleFeaturesFunction,
    onSelectFeature: OnSelectFeatureFunction,
    onDeselectFeature: OnDeselectFeatureFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onDeselectAllFeatures: OnDeselectAllFeaturesFunction,
    onToggleFeatureGroupType: OnToggleFeatureGroupTypeFunction,
    onToggleFeatureOptional: OnToggleFeatureOptionalFunction
};

export default class extends React.Component<AbstractTreeLayoutProps> {
    static defaultProps: Partial<AbstractTreeLayoutProps> = {fitOnResize: false};
    svgRef = React.createRef<SVGSVGElement>();
    currentCoordinates = {};
    previousCoordinates = {};
    treeNode: AbstractTreeNode;
    treeLink: AbstractTreeLink;

    constructor(props: AbstractTreeLayoutProps, TreeNode: typeof AbstractTreeNode, TreeLink: typeof AbstractTreeLink) {
        super(props);
        this.treeNode = new TreeNode(
            props.settings,
            props.isSelectMultipleFeatures,
            props.debug,
            this.setActiveNode.bind(this),
            this.props.onShowOverlay,
            this.props.onExpandFeatures,
            this.props.onToggleFeatureGroupType);
        this.treeLink = new TreeLink(
            props.settings,
            this.getParentCoordinateFn('currentCoordinates'),
            this.getParentCoordinateFn('previousCoordinates'),
            this.treeNode,
            this.props.onToggleFeatureOptional);
        this.treeNode.treeLink = this.treeLink;
    }

    componentDidMount(): void {
        this.renderD3();
    }

    componentDidUpdate(prevProps: AbstractTreeLayoutProps): void {
        const updateD3OnPropChange = ['featureModel', 'width', 'height', 'fitOnResize', 'settings'];
        this.treeNode.settings = this.treeLink.settings = this.props.settings;
        this.treeNode.isSelectMultipleFeatures = this.props.isSelectMultipleFeatures;
        this.treeNode.debug = this.props.debug;

        if (updateD3OnPropChange.find(prop => this.props[prop] !== prevProps[prop]))
            this.updateD3(
                this.props.width !== prevProps.width ||
                this.props.height !== prevProps.height);

        if (this.props.selectedFeatureIDs !== prevProps.selectedFeatureIDs ||
            this.props.overlayProps.featureID !== prevProps.overlayProps.featureID)
            this.updateSelection();
    }

    render(): JSX.Element {
        return (
            <svg className={'treeLayout' + (this.props.className ? ` ${this.props.className}` : '')}
                style={this.props.style}
                ref={this.svgRef}/>
        );
    }
    
    getKeyFn(kind: string): (d: FeatureNode) => string {
        return d => `${kind}_${d.feature().ID}_${d.feature().name}`;
    }

    toggleSelectedNode(node: FeatureNode): void {
        if (this.props.selectedFeatureIDs.includes(node.feature().ID))
            this.props.onDeselectFeature({featureID: node.feature().ID});
        else
            this.props.onSelectFeature({featureID: node.feature().ID});
    }

    setActiveNode(overlay: OverlayType | 'select', activeNode: FeatureNode): void {
        const featureID = activeNode.feature().ID;
        if (this.props.isSelectMultipleFeatures) {
            if (overlay === OverlayType.featureCallout || overlay === 'select') {
                this.toggleSelectedNode(activeNode);
                if (this.props.overlay === OverlayType.featureContextualMenu &&
                    this.props.overlayProps.featureID === featureID)
                    this.props.onHideOverlay({overlay: OverlayType.featureContextualMenu});
            }
            else if (overlay === OverlayType.featureContextualMenu &&
                this.props.selectedFeatureIDs.includes(featureID))
                this.props.onShowOverlay({overlay, overlayProps: {featureID}});
        } else {
            if (overlay !== 'select' && isFloatingFeatureOverlay(overlay))
                this.props.onShowOverlay({overlay, overlayProps: {featureID},selectOnefeatureID: featureID});
            else if (overlay === 'select') {
                this.props.onSetSelectMultipleFeatures({isSelectMultipleFeatures: true});
                this.props.onSelectFeature({featureID});
            }
        }
    }

    updateCoordinates(key: string, nodes: FeatureNode[]): void {
        this[key] = {};
        nodes.forEach(node => this[key][node.feature().ID] = {x: this.treeNode.x(node), y: this.treeNode.y(node)});
    }

    getParentCoordinateFn(key: string): NodeCoordinateForAxisFunction {
        return (node, axis) => {
            if (!node.feature().isRoot) {
                const coords = this[key][node.parent!.feature().ID];
                return coords ? coords[axis] : this.treeNode[axis](node.parent);
            } else
                return this.treeNode[axis](node);
        };
    }

    getSeparationFn(_estimateTextWidth: (node: FeatureNode) => number):
        (a: FeatureNode, b: FeatureNode) => number {
        throw new Error('abstract method not implemented');
    }

    estimateXOffset(_sgn: number, _estimatedTextWidth: number): number {
        throw new Error('abstract method not implemented');
    }

    estimateYOffset(_sgn: number): number {
        throw new Error('abstract method not implemented');
    }

    createLayoutHook(_nodes: FeatureNode[]): void {
    }

    createLayout({featureModel, settings}: {featureModel: FeatureModel, settings: Settings}, isSelectionChange: boolean):
        {nodes: FeatureNode[], estimatedBbox?: Bbox} {
        const estimateTextWidth = this.treeNode.estimateTextWidth.bind(this.treeNode),
            hierarchy = featureModel.hierarchy,
            tree = d3Tree()
                .nodeSize(settings.featureDiagram.treeLayout.node.size)
                .separation(this.getSeparationFn(estimateTextWidth)),
            nodes = featureModel.visibleNodes;

        if (isSelectionChange)
            return {nodes};

        tree(hierarchy);
        this.createLayoutHook(nodes);

        const findNode = (compareFn: (a: FeatureNode, b: FeatureNode) => boolean) =>
                nodes.reduce((acc, d) => compareFn(acc, d) ? acc : d),
            estimateX = (d: FeatureNode, sgn: number) => this.treeNode.x(d) + this.estimateXOffset(sgn, estimateTextWidth(d)),
            estimateY = (d: FeatureNode, sgn: number) => this.treeNode.y(d) + this.estimateYOffset(sgn),
            estimatedBbox: Bbox = [[
                estimateX(findNode((a, b) => estimateX(a, -1) < estimateX(b, -1)), -1),
                estimateY(findNode((a, b) => estimateY(a, -1) < estimateY(b, -1)), -1)
            ], [
                estimateX(findNode((a, b) => estimateX(a, 1) > estimateX(b, 1)), 1),
                estimateY(findNode((a, b) => estimateY(a, 1) > estimateY(b, 1)), 1)
            ]];

        return {nodes, estimatedBbox};
    }

    getSvgRoot({width, height, fitOnResize, settings, debug}: {width?: number, height?: number, fitOnResize: boolean, settings: Settings, debug: boolean},
        estimatedBbox: Bbox, isCreating: boolean, isResize: boolean, isSelectionChange: boolean): D3Selection {
        const svgRoot = d3Select(this.svgRef.current)
                .call(svgRoot => width && height && svgRoot.attr('style', `width: ${width}; height: ${height};`))
                .on('click', () => {
                    if (this.props.isSelectMultipleFeatures && d3Event.target.tagName === 'svg')
                        this.props.onDeselectAllFeatures();
                    if (!this.props.isSelectMultipleFeatures && d3Event.target.tagName === 'svg' &&
                        isFloatingFeatureOverlay(this.props.overlay))
                        this.props.onHideOverlay({overlay: this.props.overlay});
                }),
            g = isCreating ? svgRoot.append('g') : svgRoot.select('g');

        if (isSelectionChange)
            return g;

        const rect = isCreating ? g.append('rect') : g.select('rect'),
            zoom = d3Zoom<SVGSVGElement, any>(),
            estimatedBboxWidth = estimatedBbox[1][0] - estimatedBbox[0][0],
            estimatedBboxHeight = estimatedBbox[1][1] - estimatedBbox[0][1];

        // bounding box information for export
        svgRoot.attr('data-estimated-bbox', JSON.stringify(estimatedBbox));

        if (debug)
            this.transition(rect)
                .call(updateRect, {
                    x: estimatedBbox[0][0],
                    y: estimatedBbox[0][1],
                    width: estimatedBboxWidth,
                    height: estimatedBboxHeight
                });
        else
            this.transition(rect)
                .attr('stroke', 'none');

        svgRoot.call(zoom
            .translateExtent(estimatedBbox)
            .scaleExtent(settings.featureDiagram.treeLayout.scaleExtent)
            .on('zoom', () => g.attr('transform', d3Event.transform)))
            .call(svgRoot => {
                const dblclicked = svgRoot.on('dblclick.zoom');
                svgRoot.on('contextmenu', function() {
                    d3Event.preventDefault();
                }).on('dblclick.zoom', function() {
                    if (d3Event.target.tagName === 'svg')
                        dblclicked!.call(this);
                });
            });

        if (isCreating || (fitOnResize && isResize))
            svgRoot.call(zoom.scaleTo, Math.max(
                Math.min(1,
                    this.svgRef.current!.getBoundingClientRect().width / estimatedBboxWidth,
                    this.svgRef.current!.getBoundingClientRect().height / estimatedBboxHeight),
                constants.featureDiagram.minimumInitialZoom
            ));

        if (isCreating)
            this.treeNode.createSvgHook(g);

        return g;
    }

    joinNodes(nodes: FeatureNode[], svgRoot: D3Selection): D3Selection {
        return svgRoot.selectAll('.node').data(nodes, this.getKeyFn('node'));
    }

    joinLinks(nodes: FeatureNode[], svgRoot: D3Selection): D3Selection {
        return svgRoot.selectAll('.link').data(nodes.slice(1), this.getKeyFn('link'));
    }

    joinData(isCreating: boolean, isResize = false, isSelectionChange = false):
        {node: D3Selection, linkInBack: D3Selection, linkInFront: D3Selection, nodes: FeatureNode[]} {
        const {nodes, estimatedBbox} = this.createLayout(this.props, isSelectionChange);
        if (!isSelectionChange)
            logger.infoTagged({tag}, () => 'estimated bounding box ' +
                JSON.stringify(estimatedBbox, (k, v) => typeof v === 'number' ? parseInt(v.toFixed(0)) : v));
        const svgRoot = this.getSvgRoot(this.props, estimatedBbox!, isCreating, isResize, isSelectionChange);
        const linkInBack = this.joinLinks(nodes,
            isCreating ? svgRoot.append('g').attr('class', 'linksInBack') : svgRoot.select('g.linksInBack'));
        const node = this.joinNodes(nodes,
            isCreating ? svgRoot.append('g').attr('class', 'nodes') : svgRoot.select('g.nodes'));
        const linkInFront = this.joinLinks(nodes,
            isCreating ? svgRoot.append('g').attr('class', 'linksInFront') : svgRoot.select('g.linksInFront'));
        return {node, linkInBack, linkInFront, nodes};
    }

    transition(selection: D3Selection, transitionDuration: number =
        this.props.settings.featureDiagram.treeLayout.transitionDuration): D3Selection {
        return this.props.settings.featureDiagram.treeLayout.useTransitions
            // transitions _almost_ have the same interface as selections, here we just ignore the differences
            ? selection.transition().duration(transitionDuration) as any
            : selection;
    }

    renderD3(): void {
        // On initial render, all nodes/links are entering.
        // Thus, make them enter at their beginning position, then update them
        // instantly to their final position, without transitioning.
        logger.infoTagged({tag}, () => `rendering initial feature model`);
        const {node, linkInBack, linkInFront, nodes} = this.joinData(true);
        this.updateCoordinates('currentCoordinates', nodes);
        this.treeNode.update(this.treeNode.enter(node.enter()));
        this.treeLink.update(this.treeLink.enter(linkInBack.enter(), 'inBack'), 'inBack');
        this.treeLink.update(this.treeLink.enter(linkInFront.enter(), 'inFront'), 'inFront');
        this.updateCoordinates('previousCoordinates', nodes);
        this.updateSelection();
    }

    updateD3(isResize: boolean): void {
        // On following renders, enter new nodes/links at their beginning position.
        // Then merge with updating nodes/links and transition to the final position.
        // Exiting nodes/links are simply removed after a transition.
        logger.infoTagged({tag}, () => `rendering updated feature model`);
        const {node, linkInBack, linkInFront, nodes} = this.joinData(false, isResize);
        this.updateCoordinates('currentCoordinates', nodes);

        this.treeNode.update(this.transition(this.treeNode.enter(node.enter()).merge(node)));
        this.treeLink.update(this.transition(this.treeLink.enter(linkInBack.enter(), 'inBack').merge(linkInBack)), 'inBack');
        this.treeLink.update(this.transition(this.treeLink.enter(linkInFront.enter(), 'inFront').merge(linkInFront)), 'inFront');

        this.treeNode.exit(this.transition(node.exit()));
        this.treeLink.exit(this.transition(linkInBack.exit()), 'inBack');
        this.treeLink.exit(this.transition(linkInFront.exit()), 'inFront');

        this.updateCoordinates('previousCoordinates', nodes);
        this.updateSelection();
    }

    updateSelection(): void {
        const {node} = this.joinData(false, false, true);
        node.filter(d => this.props.selectedFeatureIDs.includes(d.feature().ID)).attr('class', 'node selected');
        node.filter(d => !this.props.selectedFeatureIDs.includes(d.feature().ID)).attr('class', 'node');
        node.filter(d => this.props.overlayProps.featureID === d.feature().ID).attr('class', 'node selected');
    }
}