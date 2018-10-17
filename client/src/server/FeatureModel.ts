/**
 * The feature model is the main artifact shown and edited by this application.
 * It is a tree-like structure containing features and additional feature and cross-tree constraints.
 */

import {hierarchy as d3Hierarchy} from 'd3-hierarchy';
import constants from '../constants';
import PropTypes from 'prop-types';
import memoize from '../helpers/memoize';
import {estimateHierarchySize} from '../components/featureDiagram/treeLayout/estimation';
import {getSetting} from '../store/settings';
import {layoutTypes, FeatureModelNode, Feature} from '../types';
import {present} from '../helpers/present';

const serialization = constants.server.featureModel.serialization;

export function getName(node: FeatureModelNode): string {
    return node.data[serialization.NAME];
}

function isRoot(node: FeatureModelNode): boolean {
    return !node.parent;
}

function isCollapsed(node: FeatureModelNode): boolean {
    return !!(!node.children && node.actualChildren);
}

function hasChildren(node: FeatureModelNode): boolean {
    return !!(node.children && node.children.length > 0);
}

function hasActualChildren(node: FeatureModelNode): boolean {
    return !!(node.actualChildren && node.actualChildren.length > 0);
}

function eachNodeBelow(node: FeatureModelNode, callback: (node: FeatureModelNode) => void): void {
    var current, currentNode: FeatureModelNode | undefined = node, next = [node], children, i, n;
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

function getNodesBelow(node: FeatureModelNode): FeatureModelNode[] {
    var nodes: FeatureModelNode[] = [];
    eachNodeBelow(node, node => nodes.push(node));
    return nodes;
}

d3Hierarchy.prototype.feature = function(this: FeatureModelNode): Feature {
    return this._feature || (this._feature = {
        node: this,
        name: getName(this),
        type: this.data[serialization.TYPE],
        description: this.data[serialization.DESCRIPTION],
        isRoot: isRoot(this),
        isAbstract: !!this.data[serialization.ABSTRACT],
        isHidden: !!this.data[serialization.HIDDEN],
        isMandatory: !!this.data[serialization.MANDATORY],
        isAnd: this.data[serialization.TYPE] === serialization.AND,
        isOr: this.data[serialization.TYPE] === serialization.OR,
        isAlternative: this.data[serialization.TYPE] === serialization.ALT,
        isGroup:
            this.data[serialization.TYPE] === serialization.OR ||
            this.data[serialization.TYPE] === serialization.ALT,
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

class FeatureModel {
    _hierarchy: FeatureModelNode;
    _actualNodes: FeatureModelNode[];
     _visibleNodes: FeatureModelNode[];

    // feature model as supplied by feature model messages from the server
    constructor(public featureModel: object, public collapsedFeatureNames: string[]) {}

    get structure() {
        const struct = constants.server.featureModel.serialization.STRUCT;
        if (!this.featureModel[struct] || this.featureModel[struct].length !== 1)
            throw new Error('feature model has no structure');
        return this.featureModel[struct][0];
    }

    prepare(): void {
        if (!this._hierarchy || !this._actualNodes || !this._visibleNodes) {
            this._hierarchy = d3Hierarchy(this.structure) as FeatureModelNode;
            this._actualNodes = this._hierarchy.descendants();
            this._visibleNodes = [];

            const isVisible: (node: FeatureModelNode) => boolean = memoize(node => {
                if (isRoot(node))
                    return true;
                if (isCollapsed(node.parent!))
                    return false;
                return isVisible(node.parent!);
            }, (node: FeatureModelNode) => getName(node));

            this._actualNodes.forEach(node => {
                // store children nodes (because they are changed on collapse)
                node.actualChildren = node.children;

                if (this.collapsedFeatureNames.find(featureName => getName(node) === featureName))
                    node.children = undefined;

                if (isVisible(node))
                    this._visibleNodes.push(node);
            });
        }
    }

    get hierarchy(): FeatureModelNode {
        this.prepare();
        return this._hierarchy;
    }

    get visibleNodes(): FeatureModelNode[] {
        this.prepare();
        return this._visibleNodes;
    }

    get actualNodes(): FeatureModelNode[] {
        this.prepare();
        return this._actualNodes;
    }

    getNode(featureName: string): FeatureModelNode | undefined {
        return this.actualNodes.find(node => getName(node) === featureName);
    }

    getFeature(featureName: string): Feature | undefined {
        const node = this.getNode(featureName);
        return node ? node.feature() : undefined;
    }

    getNodes(featureNames: string[]): FeatureModelNode[] {
        return featureNames
            .map(featureName => this.getNode(featureName))
            .filter(present);
    }

    getFeatures(featureNames: string[]): Feature[] {
        return featureNames
            .map(featureName => this.getFeature(featureName))
            .filter(present);
    }

    getElement(featureName: string): Element | undefined {
        // Operate under the assumption that we only render ONE feature model, and that it is THIS feature model.
        // This way we don't need to propagate a concrete feature diagram instance.
        const elements = Array
            .from(document.querySelectorAll('[data-feature]'))
            .filter(node => node.getAttribute('data-feature') === featureName);
        if (elements.length > 1)
            throw new Error(`multiple features "${featureName}" found - ` +
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

    getVisibleFeatureNames(): string[] {
        return this.visibleNodes.map(getName);
    }

    getActualFeatureNames(): string[] {
        return this.actualNodes.map(getName);
    }

    getFeatureNamesWithActualChildren(): string[] {
        return this.actualNodes.filter(hasActualChildren).map(getName);
    }

    getFeatureNamesBelowWithActualChildren(featureName: string): string[] {
        const node = this.getNode(featureName);
        return node ? getNodesBelow(node).filter(hasActualChildren).map(getName) : [];
    }

    isSiblingFeatures(featureNames: string[]): boolean {
        const parents = this
            .getNodes(featureNames)
            .map(node => node.parent);
        return parents.every(parent => parent === parents[0]);
    }

    // TODO: settings and layout type
    getFittingFeatureNames(settings: object, featureDiagramLayout: string, width: number, height: number) {
        const fontFamily = getSetting(settings, 'featureDiagram.font.family'),
            fontSize = getSetting(settings, 'featureDiagram.font.size'),
            widthPadding = 2 * getSetting(settings, 'featureDiagram.treeLayout.node.paddingX') +
                2 * getSetting(settings, 'featureDiagram.treeLayout.node.strokeWidth'),
            rectHeight = getSetting(settings, 'featureDiagram.font.size') +
                2 * getSetting(settings, 'featureDiagram.treeLayout.node.paddingY') +
                2 * getSetting(settings, 'featureDiagram.treeLayout.node.strokeWidth');
        let nodes = this.actualNodes, collapsedFeatureNames: string[] = [];
        width = Math.max(width, constants.featureDiagram.fitToScreen.minWidth);
        height = Math.max(height, constants.featureDiagram.fitToScreen.minHeight);

        while (true) { // eslint-disable-line no-constant-condition
            const {estimatedSize, collapsibleNodes} = estimateHierarchySize(
                nodes, collapsedFeatureNames, featureDiagramLayout,
                {fontFamily, fontSize, widthPadding, rectHeight});
    
            if ((featureDiagramLayout === layoutTypes.verticalTree ? estimatedSize <= width : estimatedSize <= height) ||
                collapsibleNodes.length === 0)
                return collapsedFeatureNames;
    
            collapsedFeatureNames = collapsedFeatureNames.concat(collapsibleNodes.map(getName));
            const invisibleNodes = collapsibleNodes
                .map(node => getNodesBelow(node).slice(1))
                .reduce((acc, children) => acc.concat(children), []);
            nodes = nodes.filter(node => !invisibleNodes.includes(node));
        }
    }
}

export const FeatureModelType = PropTypes.instanceOf(FeatureModel); // TODO: replace with TypeScript checks

export default FeatureModel;