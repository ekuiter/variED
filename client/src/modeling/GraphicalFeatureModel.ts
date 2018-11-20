/**
 * The feature model is the main artifact shown and edited by this application.
 * It is a tree-like structure containing features and additional feature and cross-tree constraints.
 * The graphical feature model is intended for read-only use in rendering a feature model.
 * It lays out the feature model and manages collapsed features.
 */

import {hierarchy as d3Hierarchy} from 'd3-hierarchy';
import constants from '../constants';
import memoize from '../helpers/memoize';
import {estimateHierarchySize} from '../components/featureDiagramView/treeLayout/estimation';
import {Settings} from '../store/settings';
import {FeatureDiagramLayoutType} from '../types';
import {present} from '../helpers/present';
import logger from '../helpers/logger';
import {GraphicalFeatureNode, GraphicalFeature, FeatureType, SerializedFeatureModel, UUID, DESCRIPTION, TYPE, ABSTRACT, HIDDEN, MANDATORY, STRUCT, NAME, SerializedFeatureNode, SerializedConstraint, CONSTRAINTS, SerializedConstraintNode, ConstraintType, VAR} from './types';
import {getViewportWidth, getViewportHeight} from '../helpers/withDimensions';

export function getUUID(node: GraphicalFeatureNode): string {
    return node.data[UUID];
}

function isRoot(node: GraphicalFeatureNode): boolean {
    return !node.parent;
}

function isCollapsed(node: GraphicalFeatureNode): boolean {
    return !!(!node.children && node.actualChildren);
}

function hasChildren(node: GraphicalFeatureNode): boolean {
    return !!(node.children && node.children.length > 0);
}

function hasActualChildren(node: GraphicalFeatureNode): boolean {
    return !!(node.actualChildren && node.actualChildren.length > 0);
}

function eachNodeBelow(node: GraphicalFeatureNode, callback: (node: GraphicalFeatureNode) => void): void {
    var current, currentNode: GraphicalFeatureNode | undefined = node, next = [node], children, i, n;
    do {
        current = next.reverse();
        next = [];
        while ((currentNode = current.pop())) {
            callback(currentNode);
            children = currentNode.actualChildren;
            if (children)
                for (i = 0, n = children.length; i < n; ++i)
                    next.push(children[i]);
        }
    } while (next.length);
}

function getNodesBelow(node: GraphicalFeatureNode): GraphicalFeatureNode[] {
    var nodes: GraphicalFeatureNode[] = [];
    eachNodeBelow(node, node => nodes.push(node));
    return nodes;
}

d3Hierarchy.prototype.feature = function(this: GraphicalFeatureNode): GraphicalFeature {
    return this._feature || (this._feature = {
        node: this,
        uuid: getUUID(this),
        name: this.data[NAME],
        type: this.data[TYPE],
        description: this.data[DESCRIPTION],
        isRoot: isRoot(this),
        isAbstract: !!this.data[ABSTRACT],
        isHidden: !!this.data[HIDDEN],
        isMandatory: !!this.data[MANDATORY],
        isAnd: this.data[TYPE] === FeatureType.and,
        isOr: this.data[TYPE] === FeatureType.or,
        isAlternative: this.data[TYPE] === FeatureType.alt,
        isGroup:
            this.data[TYPE] === FeatureType.or ||
            this.data[TYPE] === FeatureType.alt,
        isCollapsed: isCollapsed(this),
        hasChildren: hasChildren(this),
        hasActualChildren: hasActualChildren(this),
        getPropertyString: key => {
            if (typeof key === 'function')
                return key(this);
            return this._feature[key] ? 'yes' : 'no';
        },
        getNumberOfFeaturesBelow: () => {
            if (!this.actualChildren)
                return 0;
            return this.actualChildren.length +
                this.actualChildren
                    .map(child => child.feature().getNumberOfFeaturesBelow())
                    .reduce((acc, val) => acc + val);
        }
    });
};

type ConstraintRenderer<T> = (graphicalFeatureModel: GraphicalFeatureModel, root: SerializedConstraintNode) => T;

// adapted from FeatureIDE fm.core's org/prop4j/NodeWriter.java
export function createConstraintRenderer<T>({neutral, _return, returnFeature, join}:
    {neutral: T, _return: (s: string) => T, returnFeature: (s: string) => T, join: (ts: T[], t: T) => T}): ConstraintRenderer<T> {
    const operatorMap: {[x: string]: string} = {
        [ConstraintType.not]: '\u00AC',
        [ConstraintType.disj]: '\u2228',
        [ConstraintType.eq]: '\u21D4',
        [ConstraintType.imp]: '\u21D2',
        [ConstraintType.conj]: '\u2227',
        [ConstraintType.atmost1]: 'atmost1 '
    };

    const orderMap: {[x: string]: number} = {
        [ConstraintType.unknown]: -1,
        [ConstraintType.not]: 0,
        [ConstraintType.disj]: 4,
        [ConstraintType.eq]: 2,
        [ConstraintType.imp]: 3,
        [ConstraintType.conj]: 5,
        [ConstraintType.atmost1]: 1
    };

    const renderLiteral = (graphicalFeatureModel: GraphicalFeatureModel, node: SerializedConstraintNode): T => {
            const feature = graphicalFeatureModel.getFeature(node[VAR]!);
            return returnFeature(feature ? feature.name : node[VAR]!);
        },
        renderNode = (graphicalFeatureModel: GraphicalFeatureModel, node: SerializedConstraintNode, parentType: ConstraintType): T => {
        if (node[TYPE] === ConstraintType.var)
            return renderLiteral(graphicalFeatureModel, node);

        if (node[TYPE] === ConstraintType.not) {
            const child = node.children![0];
            if (child[TYPE] === ConstraintType.var)
                return join([_return(operatorMap[ConstraintType.not]), renderLiteral(graphicalFeatureModel, child)], neutral);
            if (child[TYPE] === ConstraintType.not)
                return renderNode(graphicalFeatureModel, child.children![0], parentType);
        }

        const children = node.children!,
            operands = children.map(child => renderNode(graphicalFeatureModel, child, node[TYPE])),
            operator = operatorMap[node[TYPE]];

        if (node[TYPE] === ConstraintType.conj || node[TYPE] === ConstraintType.disj ||
            node[TYPE] === ConstraintType.imp || node[TYPE] === ConstraintType.eq) {
            const result = join(operands, _return(` ${operator} `)),
                orderParent = orderMap[parentType],
                orderChild = orderMap[node[TYPE]];
            return orderParent > orderChild ||
                (orderParent === orderChild && orderParent === orderMap[ConstraintType.imp])
                ? join([_return('('), result, _return(')')], neutral)
                : result;
        } else
            return join([_return(operator), _return('('), join(operands, _return(', ')), _return(')')], neutral);
    }

    return (graphicalFeatureModel, root) => renderNode(graphicalFeatureModel, root, ConstraintType.unknown);
}

const stringConstraintRenderer = createConstraintRenderer({
    neutral: '',
    _return: s => s,
    returnFeature: s => s,
    join: (ts, t) => ts.join(t)
});

export class GraphicalConstraint {
    _string: string;
    _element: JSX.Element;

    constructor(public serializedConstraint: SerializedConstraint,
        public graphicalFeatureModel: GraphicalFeatureModel) {}

    get root(): SerializedConstraintNode {
        if (this.serializedConstraint.children.length !== 1)
            throw new Error('constraint does not have one root');
        return this.serializedConstraint.children[0];
    }

    render<T>(constraintRenderer: ConstraintRenderer<T>): T {
        return constraintRenderer(this.graphicalFeatureModel, this.root);
    }

    toString(): string {
        return this._string || (this._string = this.render(stringConstraintRenderer));
    }

    getKey(): string {
        return Math.random().toString(); // TODO: return stringify(this.serializedConstraint);
    }
}

class GraphicalFeatureModel {
    serializedFeatureModel: SerializedFeatureModel;
    collapsedFeatureUUIDs: string[] = [];
    _hierarchy: GraphicalFeatureNode;
    _actualNodes: GraphicalFeatureNode[];
    _visibleNodes: GraphicalFeatureNode[];
    _constraints: GraphicalConstraint[];

    // feature model as supplied by feature model messages from the server
    static fromJSON(serializedFeatureModel: SerializedFeatureModel): GraphicalFeatureModel {
        const graphicalFeatureModel = new GraphicalFeatureModel();
        graphicalFeatureModel.serializedFeatureModel = serializedFeatureModel;
        return graphicalFeatureModel;
    }

    toJSON(): SerializedFeatureModel {
        return this.serializedFeatureModel;
    }

    collapse(collapsedFeatureUUIDs: string[]): GraphicalFeatureModel {
        if (this._hierarchy)
            throw new Error('graphical feature model already initialized');
        this.collapsedFeatureUUIDs = collapsedFeatureUUIDs;
        return this;
    }

    get structure(): SerializedFeatureNode {
        if (!this.serializedFeatureModel[STRUCT] || this.serializedFeatureModel[STRUCT].length !== 1)
            throw new Error('feature model has no structure');
        return this.serializedFeatureModel[STRUCT][0];
    }

    prepare(): void {
        if (!this._hierarchy) {
            this._hierarchy = d3Hierarchy(this.structure) as GraphicalFeatureNode;
            this._actualNodes = this._hierarchy.descendants();
            this._visibleNodes = [];
            this._constraints = this.serializedFeatureModel[CONSTRAINTS].map(
                serializedConstraint => new GraphicalConstraint(serializedConstraint, this));

            const isVisible: (node: GraphicalFeatureNode) => boolean = memoize(node => {
                if (isRoot(node))
                    return true;
                if (isCollapsed(node.parent!))
                    return false;
                return isVisible(node.parent!);
            }, (node: GraphicalFeatureNode) => getUUID(node));

            this._actualNodes.forEach(node => {
                // store children nodes (because they are changed on collapse)
                node.actualChildren = node.children;

                if (this.collapsedFeatureUUIDs.find(featureUUID => getUUID(node) === featureUUID))
                    node.children = undefined;

                if (isVisible(node))
                    this._visibleNodes.push(node);
            });
        }
    }

    get hierarchy(): GraphicalFeatureNode {
        this.prepare();
        return this._hierarchy;
    }

    get visibleNodes(): GraphicalFeatureNode[] {
        this.prepare();
        return this._visibleNodes;
    }

    get actualNodes(): GraphicalFeatureNode[] {
        this.prepare();
        return this._actualNodes;
    }

    get constraints(): GraphicalConstraint[] {
        this.prepare();
        return this._constraints;
    }

    getNode(featureUUID: string): GraphicalFeatureNode | undefined {
        // TODO: use a map instead?
        return this.actualNodes.find(node => getUUID(node) === featureUUID);
    }

    getFeature(featureUUID: string): GraphicalFeature | undefined {
        const node = this.getNode(featureUUID);
        return node ? node.feature() : undefined;
    }

    getNodes(featureUUIDs: string[]): GraphicalFeatureNode[] {
        return featureUUIDs
            .map(featureUUID => this.getNode(featureUUID))
            .filter(present);
    }

    getFeatures(featureUUIDs: string[]): GraphicalFeature[] {
        return featureUUIDs
            .map(featureUUID => this.getFeature(featureUUID))
            .filter(present);
    }

    hasElement(featureUUID: string): boolean {
        return Array
            .from(document.querySelectorAll('[data-feature-uuid]'))
            .filter(node => node.getAttribute('data-feature-uuid') === featureUUID)
            .length === 1;
    }

    getElement(featureUUID: string): Element | undefined {
        // Operate under the assumption that we only render ONE feature model, and that it is THIS feature model.
        // This way we don't need to propagate a concrete feature diagram instance.
        const elements = Array
            .from(document.querySelectorAll('[data-feature-uuid]'))
            .filter(node => node.getAttribute('data-feature-uuid') === featureUUID);
        if (elements.length > 1)
            throw new Error(`multiple features "${featureUUID}" found - ` +
                'getElement supports only one feature model on the page');
        return elements.length === 1 ? elements[0] : undefined;
    }

    static getSvg(): SVGSVGElement {
        // Here we also assume for now that only one SVG is rendered and that is is a feature model.
        const svg = document.querySelectorAll('svg');
        if (svg.length !== 1)
            throw new Error('no SVG feature model found');
        return svg[0];
    }

    static getWidth(settings: Settings): number {
        return getViewportWidth() *
            (settings.views.splitDirection === 'horizontal' ? settings.views.splitAt : 1);
    }

    static getHeight(settings: Settings): number {
        return getViewportHeight() *
            (settings.views.splitDirection === 'vertical' ? settings.views.splitAt : 1);
    }

    getVisibleFeatureUUIDs(): string[] {
        return this.visibleNodes.map(getUUID);
    }

    getActualFeatureUUIDs(): string[] {
        return this.actualNodes.map(getUUID);
    }

    getFeatureUUIDsWithActualChildren(): string[] {
        return this.actualNodes.filter(hasActualChildren).map(getUUID);
    }

    getFeatureUUIDsBelowWithActualChildren(featureUUID: string): string[] {
        const node = this.getNode(featureUUID);
        return node ? getNodesBelow(node).filter(hasActualChildren).map(getUUID) : [];
    }

    isSiblingFeatures(featureUUIDs: string[]): boolean {
        const parents = this
            .getNodes(featureUUIDs)
            .map(node => node.parent);
        return parents.every(parent => parent === parents[0]);
    }

    // returns features which, when collapsed, make the feature model fit to the given screen size
    getFittingFeatureUUIDs(settings: Settings, featureDiagramLayout: FeatureDiagramLayoutType,
        width = GraphicalFeatureModel.getWidth(settings), height = GraphicalFeatureModel.getHeight(settings),
        scale = 0.5): string[] {
        const fontFamily = settings.featureDiagram.font.family,
            fontSize = settings.featureDiagram.font.size,
            widthPadding = 2 * settings.featureDiagram.treeLayout.node.paddingX +
                2 * settings.featureDiagram.treeLayout.node.strokeWidth,
            rectHeight = settings.featureDiagram.font.size +
                2 * settings.featureDiagram.treeLayout.node.paddingY +
                2 * settings.featureDiagram.treeLayout.node.strokeWidth,
            estimatedDimension = featureDiagramLayout === FeatureDiagramLayoutType.verticalTree ? 'width' : 'height';
        let nodes = this.actualNodes, collapsedFeatureUUIDs: string[] = [];
        width = Math.max(width, constants.featureDiagram.fitToScreen.minWidth);
        height = Math.max(height, constants.featureDiagram.fitToScreen.minHeight);
        logger.infoBeginCollapsed(() => `[fit to screen] fitting feature model to ${estimatedDimension} ${FeatureDiagramLayoutType.verticalTree ? width : height}px`);

        while (true) {
            const {estimatedSize, collapsibleNodes} = estimateHierarchySize(
                nodes, collapsedFeatureUUIDs, featureDiagramLayout,
                {fontFamily, fontSize, widthPadding, rectHeight, getUUID, scale});
            logger.info(() => `estimated ${estimatedDimension} ${Math.round(estimatedSize)}px when collapsing ${JSON.stringify(collapsedFeatureUUIDs)}`);
    
            if ((featureDiagramLayout === FeatureDiagramLayoutType.verticalTree ? estimatedSize <= width : estimatedSize <= height) ||
                collapsibleNodes.length === 0) {
                logger.info(() => `feature model fitted by collapsing ${collapsedFeatureUUIDs.length} feature(s)`);
                logger.infoEnd();
                return collapsedFeatureUUIDs;
            }
    
            const collapsibleNodeUUIDs = collapsibleNodes.map(getUUID);
            logger.info(() => `collapsing ${JSON.stringify(collapsibleNodeUUIDs)}`);
            collapsedFeatureUUIDs = collapsedFeatureUUIDs.concat(collapsibleNodeUUIDs);
            const invisibleNodes = collapsibleNodes
                .map(node => getNodesBelow(node).slice(1))
                .reduce((acc, children) => acc.concat(children), []);
            nodes = nodes.filter(node => !invisibleNodes.includes(node));
        }
    }

    toString() {
        return `GraphicalFeatureModel ${JSON.stringify(this.getVisibleFeatureUUIDs())}`;
    }
}

export default GraphicalFeatureModel;