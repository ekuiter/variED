/**
 * The feature model is the main artifact shown and edited by this application.
 * It is a tree-like structure containing features and additional feature and cross-tree constraints.
 * The feature model is intended for read-only use in rendering a feature model.
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
import {FeatureNode, Feature, FeatureType, SerializedFeatureModel, UUID, DESCRIPTION, TYPE, ABSTRACT, HIDDEN, MANDATORY, STRUCT, NAME, SerializedFeatureNode, SerializedConstraint, CONSTRAINTS, SerializedConstraintNode, ConstraintType, VAR} from './types';
import {getViewportWidth, getViewportHeight} from '../helpers/withDimensions';

export function getUUID(node: FeatureNode): string {
    return node.data[UUID];
}

function isRoot(node: FeatureNode): boolean {
    return !node.parent;
}

function isCollapsed(node: FeatureNode): boolean {
    return !!(!node.children && node.actualChildren);
}

function hasChildren(node: FeatureNode): boolean {
    return !!(node.children && node.children.length > 0);
}

function hasActualChildren(node: FeatureNode): boolean {
    return !!(node.actualChildren && node.actualChildren.length > 0);
}

function eachNodeBelow(node: FeatureNode, callback: (node: FeatureNode) => void): void {
    var current, currentNode: FeatureNode | undefined = node, next = [node], children, i, n;
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

function getNodesBelow(node: FeatureNode): FeatureNode[] {
    var nodes: FeatureNode[] = [];
    eachNodeBelow(node, node => nodes.push(node));
    return nodes;
}

d3Hierarchy.prototype.feature = function(this: FeatureNode): Feature {
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

type ConstraintRenderer<T> = ((featureModel: FeatureModel, root: SerializedConstraintNode) => T) & {cacheKey: string};

// adapted from FeatureIDE fm.core's org/prop4j/NodeWriter.java
export function createConstraintRenderer<T>({neutral, _return, returnFeature, join, cacheKey}:
    {neutral: T, _return: (s: string) => T, returnFeature: (s: string, idx: number) => T,
        join: (ts: T[], t: T) => T, cacheKey: string}): ConstraintRenderer<T> {
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

    let i = 0;

    const renderLiteral = (featureModel: FeatureModel, node: SerializedConstraintNode): T => {
            const feature = featureModel.getFeature(node[VAR]!);
            return returnFeature(feature ? feature.name : node[VAR]!, i++);
        },
        renderNode = (featureModel: FeatureModel, node: SerializedConstraintNode, parentType: ConstraintType): T => {
        if (node[TYPE] === ConstraintType.var)
            return renderLiteral(featureModel, node);

        if (node[TYPE] === ConstraintType.not) {
            const child = node.children![0];
            if (child[TYPE] === ConstraintType.var)
                return join([_return(operatorMap[ConstraintType.not]), renderLiteral(featureModel, child)], neutral);
            if (child[TYPE] === ConstraintType.not)
                return renderNode(featureModel, child.children![0], parentType);
        }

        const children = node.children!,
            operands = children.map(child => renderNode(featureModel, child, node[TYPE])),
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

    const constraintRenderer = (featureModel: FeatureModel, root: SerializedConstraintNode) => {
        i = 0;
        return renderNode(featureModel, root, ConstraintType.unknown);
    };
    constraintRenderer.cacheKey = cacheKey;
    return constraintRenderer;
}

const stringConstraintRenderer = createConstraintRenderer({
    neutral: '',
    _return: s => s,
    returnFeature: s => s,
    join: (ts, t) => ts.join(t),
    cacheKey: 'string'
});

export class Constraint {
    _renderCache: {[x: string]: any} = {};
    _element: JSX.Element;

    constructor(public serializedConstraint: SerializedConstraint,
        public index: number,
        public featureModel: FeatureModel) {}

    get root(): SerializedConstraintNode {
        if (this.serializedConstraint.children.length !== 1)
            throw new Error('constraint does not have one root');
        return this.serializedConstraint.children[0];
    }

    render<T>(constraintRenderer: ConstraintRenderer<T>): T {
        return this._renderCache[constraintRenderer.cacheKey] ||
            (this._renderCache[constraintRenderer.cacheKey] = constraintRenderer(this.featureModel, this.root));
    }

    toString(): string {
        return this.render(stringConstraintRenderer);
    }

    getKey(): string {
        return this.index.toString();
    }
}

class FeatureModel {
    serializedFeatureModel: SerializedFeatureModel;
    collapsedFeatureUUIDs: string[] = [];
    _hierarchy: FeatureNode;
    _actualNodes: FeatureNode[];
    _visibleNodes: FeatureNode[];
    _constraints: Constraint[];
    _UUIDsToFeatures: {[x: string]: FeatureNode} = {};

    // feature model as supplied by feature model messages from the server
    static fromJSON(serializedFeatureModel: SerializedFeatureModel): FeatureModel {
        const featureModel = new FeatureModel();
        featureModel.serializedFeatureModel = serializedFeatureModel;
        return featureModel;
    }

    toJSON(): SerializedFeatureModel {
        return this.serializedFeatureModel;
    }

    collapse(collapsedFeatureUUIDs: string[]): FeatureModel {
        if (this._hierarchy)
            throw new Error('feature model already initialized');
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
            this._hierarchy = d3Hierarchy(this.structure) as FeatureNode;
            this._actualNodes = this._hierarchy.descendants();
            this._visibleNodes = [];
            this._constraints = this.serializedFeatureModel[CONSTRAINTS].map(
                (serializedConstraint, idx) => new Constraint(serializedConstraint, idx, this));

            const isVisible: (node: FeatureNode) => boolean = memoize(node => {
                if (isRoot(node))
                    return true;
                if (isCollapsed(node.parent!))
                    return false;
                return isVisible(node.parent!);
            }, (node: FeatureNode) => getUUID(node));

            this._actualNodes.forEach(node => {
                // store children nodes (because they are changed on collapse)
                node.actualChildren = node.children;

                if (this.collapsedFeatureUUIDs.find(featureUUID => getUUID(node) === featureUUID))
                    node.children = undefined;

                if (isVisible(node))
                    this._visibleNodes.push(node);

                this._UUIDsToFeatures[getUUID(node)] = node;
            });
        }
    }

    get hierarchy(): FeatureNode {
        this.prepare();
        return this._hierarchy;
    }

    get visibleNodes(): FeatureNode[] {
        this.prepare();
        return this._visibleNodes;
    }

    get actualNodes(): FeatureNode[] {
        this.prepare();
        return this._actualNodes;
    }

    get constraints(): Constraint[] {
        this.prepare();
        return this._constraints;
    }

    getNode(featureUUID: string): FeatureNode | undefined {
        this.prepare();
        return this._UUIDsToFeatures[featureUUID];
    }

    getFeature(featureUUID: string): Feature | undefined {
        const node = this.getNode(featureUUID);
        return node ? node.feature() : undefined;
    }

    getNodes(featureUUIDs: string[]): FeatureNode[] {
        return featureUUIDs
            .map(featureUUID => this.getNode(featureUUID))
            .filter(present);
    }

    getFeatures(featureUUIDs: string[]): Feature[] {
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
        width = FeatureModel.getWidth(settings), height = FeatureModel.getHeight(settings),
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
        return `FeatureModel ${JSON.stringify(this.getVisibleFeatureUUIDs())}`;
    }
}

export default FeatureModel;