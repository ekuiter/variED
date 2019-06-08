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
import {FeatureNode, Feature, KernelFeatureModel, DESCRIPTION, ABSTRACT, HIDDEN, OPTIONAL, NAME, KernelFeature, KernelConstraint, CONSTRAINTS, ConstraintType, FEATURES, CHILDREN_CACHE, KernelConstraintFormula, GRAVEYARDED, FORMULA, ID_KEY, KernelConstraintFormulaAtom, GROUP_TYPE, GroupType, NIL} from './types';
import {getViewportWidth, getViewportHeight} from '../helpers/withDimensions';
// @ts-ignore: no declarations available for s-expression
import SParse from 's-expression';

export function getID(node: FeatureNode): string {
    return node.data[ID_KEY]!;
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
        ID: getID(this),
        name: this.data[NAME],
        description: this.data[DESCRIPTION] || undefined,
        isRoot: isRoot(this),
        isAbstract: !!this.data[ABSTRACT],
        isHidden: !!this.data[HIDDEN],
        isOptional: !!this.data[OPTIONAL],
        isAnd: this.data[GROUP_TYPE] === GroupType.and,
        isOr: this.data[GROUP_TYPE] === GroupType.or,
        isAlternative: this.data[GROUP_TYPE] === GroupType.alternative,
        isGroup:
            this.data[GROUP_TYPE] === GroupType.or ||
            this.data[GROUP_TYPE] === GroupType.alternative,
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
        },
        getFeatureIDsBelow: () => {
            if (!this.actualChildren)
                return [getID(this)];
            return [getID(this)].concat(
                ...this.actualChildren.map(child => child.feature().getFeatureIDsBelow()));
        }
    });
};

type ConstraintRenderer<T> = ((featureModel: FeatureModel, formula: KernelConstraintFormula) => T) & {cacheKey: string};

// adapted from FeatureIDE fm.core's org/prop4j/NodeWriter.java
export function createConstraintRenderer<T>({neutral, _return, returnFeature, join, cacheKey}: {
        neutral: T,
        _return: (s: string) => T,
        returnFeature: (f: Feature | undefined, idx: number) => T,
        join: (ts: T[], t: T) => T,
        cacheKey: string
    }): ConstraintRenderer<T> {
    const operatorMap: {[x: string]: string} = {
        [ConstraintType.not]: '\u00AC',
        [ConstraintType.disj]: '\u2228',
        [ConstraintType.eq]: '\u21D4',
        [ConstraintType.imp]: '\u21D2',
        [ConstraintType.conj]: '\u2227'
    };

    const orderMap: {[x: string]: number} = {
        [ConstraintType.unknown]: -1,
        [ConstraintType.not]: 0,
        [ConstraintType.disj]: 3,
        [ConstraintType.eq]: 1,
        [ConstraintType.imp]: 2,
        [ConstraintType.conj]: 4
    };

    let i = 0;

    const isAtom = (formula: KernelConstraintFormula): formula is KernelConstraintFormulaAtom => !Array.isArray(formula),
            renderLiteral = (featureModel: FeatureModel, atom: KernelConstraintFormulaAtom): T => {
            const feature = featureModel.getFeature(atom);
            return returnFeature(feature, i++);
        },
        renderFormula = (featureModel: FeatureModel, formula: KernelConstraintFormula, parentType: ConstraintType): T => {
        if (isAtom(formula))
            return renderLiteral(featureModel, formula);
        const nodeType = formula[0] as ConstraintType;

        if (nodeType === ConstraintType.not) {
            if (formula.length !== 2)
                throw new Error('invalid negation formula');
            const child = formula[1];
            if (isAtom(child))
                return join([_return(operatorMap[ConstraintType.not]), renderLiteral(featureModel, child)], neutral);
            if (child[0] as ConstraintType === ConstraintType.not)
                return renderFormula(featureModel, child[1], parentType);
        }

        const operands = formula.slice(1).map(child => renderFormula(featureModel, child, nodeType)),
            operator = operatorMap[nodeType];
        
        if (!operator)
            throw new Error(`invalid operator ${nodeType}`);
        if (nodeType === ConstraintType.not && operands.length !== 1 ||
            nodeType !== ConstraintType.not && operands.length !== 2)
            throw new Error(`invalid number of operations ${operands.length}`);

        if (nodeType === ConstraintType.conj || nodeType === ConstraintType.disj ||
            nodeType === ConstraintType.imp || nodeType === ConstraintType.eq) {
            const result = join(operands, _return(` ${operator} `)),
                orderParent = orderMap[parentType],
                orderChild = orderMap[nodeType];
            return orderParent > orderChild ||
                (orderParent === orderChild && orderParent === orderMap[ConstraintType.imp])
                ? join([_return('('), result, _return(')')], neutral)
                : result;
        } else
            return join([_return(operator), _return('('), join(operands, _return(', ')), _return(')')], neutral);
    }

    const constraintRenderer = (featureModel: FeatureModel, root: KernelConstraintFormula) => {
        i = 0;
        return renderFormula(featureModel, root, ConstraintType.unknown);
    };
    constraintRenderer.cacheKey = cacheKey;
    return constraintRenderer;
}

const stringConstraintRenderer = createConstraintRenderer({
    neutral: '',
    _return: s => s,
    returnFeature: f => f ? f.name : 'GRAVEYARDED',
    join: (ts, t) => ts.join(t),
    cacheKey: 'string'
});

export const paletteConstraintRenderer = createConstraintRenderer({
    neutral: '',
    _return: s => s,
    returnFeature: f => f ? f.name : '?',
    join: (ts, t) => ts.join(t),
    cacheKey: 'palette'
});

const isGraveyardedConstraintRenderer = createConstraintRenderer({
    neutral: false,
    _return: _ => false,
    returnFeature: f => !f,
    join: (ts, _) => ts.reduce((acc, val) => acc || val),
    cacheKey: 'isGraveyarded'
});

export class Constraint {
    _renderCache: {[x: string]: any} = {};
    _element: JSX.Element;

    constructor(public kernelConstraint: KernelConstraint,
        public featureModel: FeatureModel) {}

    get ID(): string {
        return this.kernelConstraint[ID_KEY]!;
    }

    get isGraveyarded(): boolean {
        return this.kernelConstraint[GRAVEYARDED] || this.render(isGraveyardedConstraintRenderer);
    }

    get formula(): KernelConstraintFormula {
        return this.kernelConstraint[FORMULA];
    }

    render<T>(constraintRenderer: ConstraintRenderer<T>): T {
        return this._renderCache[constraintRenderer.cacheKey] ||
            (this._renderCache[constraintRenderer.cacheKey] =
                constraintRenderer(this.featureModel, this.formula));
    }

    toString(): string {
        return this.render(stringConstraintRenderer);
    }

    getKey(): string {
        return this.ID.toString();
    }

    static readFormulaFromString<T>(formulaString: string, featureModel: FeatureModel,
        constraintRenderer: ConstraintRenderer<T>): {formula?: KernelConstraintFormula, preview?: T} {
        const operatorMap: {[x: string]: string} = {
            "not": ConstraintType.not,
            "disj": ConstraintType.disj,
            "eq": ConstraintType.eq,
            "imp": ConstraintType.imp,
            "conj": ConstraintType.conj,
            "or": ConstraintType.disj,
            "equals": ConstraintType.eq,
            "implies": ConstraintType.imp,
            "and": ConstraintType.conj,
            "!": ConstraintType.not,
            "~": ConstraintType.not,
            "-": ConstraintType.not,
            "|": ConstraintType.disj,
            "||": ConstraintType.disj,
            "<=>": ConstraintType.eq,
            "<->": ConstraintType.eq,
            "=>": ConstraintType.imp,
            "->": ConstraintType.imp,
            "&": ConstraintType.conj,
            "&&": ConstraintType.conj
        };

        function recurse(sexpr: any): any {
            if (Array.isArray(sexpr))
                return [operatorMap[sexpr[0].toLowerCase()], ...sexpr.slice(1).map(recurse)];
            else if (typeof sexpr === 'string' || sexpr instanceof String) {
                sexpr = sexpr.toString();
                if (featureModel.isValidFeatureID(sexpr))
                    return sexpr;
                const feature = featureModel.getFeatureByName(sexpr);
                return feature ? feature.ID : undefined;
            } else
                throw new Error('invalid constraint s-expression');
        }

        for (let i = 0; i < 5; i++) { // try to append some parentheses for "eager" preview
            try {
                let sexpr = SParse(formulaString + ')'.repeat(i));
                if (sexpr instanceof Error) {
                    if (sexpr.message.indexOf('Expected `)`') >= 0)
                        continue;
                    return {};
                }
                sexpr = recurse(sexpr);
                const constraint = new Constraint({
                    [FORMULA]: sexpr,
                    [GRAVEYARDED]: false
                }, featureModel);
                return {
                    formula: sexpr,
                    preview: constraint.render(constraintRenderer)
                };
            } catch (e) {
                continue;
            }
        }

        return {};
    }
}

class FeatureModel {
    kernelFeatureModel: KernelFeatureModel;
    collapsedFeatureIDs: string[] = [];
    _hierarchy: FeatureNode;
    _actualNodes: FeatureNode[];
    _visibleNodes: FeatureNode[];
    _constraints: Constraint[];
    _IDsToFeatureNodes: {[x: string]: FeatureNode} = {};
    _IDsToConstraints: {[x: string]: Constraint} = {};

    // feature model as supplied by feature model messages from the server
    static fromKernel(kernelFeatureModel: KernelFeatureModel): FeatureModel {
        const featureModel = new FeatureModel();
        featureModel.kernelFeatureModel = kernelFeatureModel;
        return featureModel;
    }

    toKernel(): KernelFeatureModel {
        return this.kernelFeatureModel;
    }

    collapse(collapsedFeatureIDs: string[]): FeatureModel {
        if (this._hierarchy)
            throw new Error('feature model already initialized');
        this.collapsedFeatureIDs = collapsedFeatureIDs;
        return this;
    }

    prepare(): void {
        if (!this._hierarchy) {
            const features = this.kernelFeatureModel[FEATURES],
                constraints = this.kernelFeatureModel[CONSTRAINTS],
                childrenCache = this.kernelFeatureModel[CHILDREN_CACHE];
            Object.keys(features).forEach(ID => features[ID][ID_KEY] = ID);
            Object.keys(constraints).forEach(ID => constraints[ID][ID_KEY] = ID);

            const children = (kernelFeature: KernelFeature) =>
                (childrenCache[kernelFeature[ID_KEY]!] || [])
                    // sort features by ID as the kernel uses an arbitrary order (to avoid "jumping" features)
                    // in the future, we may introduce a better ordering criterion
                    // further, this may be inefficient for large models
                    .sort()
                    .map(ID => features[ID]);

            if (childrenCache[NIL].length !== 1)
                throw new Error('feature model does not have a single root');
            const rootFeature = features[childrenCache[NIL][0]];

            this._hierarchy = d3Hierarchy(rootFeature, children) as FeatureNode;
            this._actualNodes = this._hierarchy.descendants();
            this._visibleNodes = [];

            const isVisible: (node: FeatureNode) => boolean = memoize(node => {
                if (isRoot(node))
                    return true;
                if (isCollapsed(node.parent!))
                    return false;
                return isVisible(node.parent!);
            }, (node: FeatureNode) => getID(node));

            this._actualNodes.forEach(node => {
                // store children nodes (because they are changed on collapse)
                node.actualChildren = node.children;

                if (this.collapsedFeatureIDs.find(featureID => getID(node) === featureID))
                    node.children = undefined;

                if (isVisible(node))
                    this._visibleNodes.push(node);

                this._IDsToFeatureNodes[getID(node)] = node;
            });

            // TODO: this might be inefficient for large models
            // TODO: do we need to sort the constraints as well? do they "jump"?
            this._constraints = Object.values(constraints)
                .map(kernelConstraint => new Constraint(kernelConstraint, this))
                .filter(kernelConstraint => !kernelConstraint.isGraveyarded);

            this._constraints.forEach(constraint =>
                this._IDsToConstraints[constraint.ID] = constraint);
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

    getNode(featureID: string): FeatureNode | undefined {
        this.prepare();
        return this._IDsToFeatureNodes[featureID];
    }

    getFeature(featureID: string): Feature | undefined {
        const node = this.getNode(featureID);
        return node ? node.feature() : undefined;
    }

    getConstraint(constraintID: string): Constraint | undefined {
        this.prepare();
        return this._IDsToConstraints[constraintID];
    }

    get rootFeature(): Feature {
        this.prepare();
        return this.hierarchy.feature();
    }

    isValidFeatureID(featureID: string): boolean {
        return !!this.getNode(featureID);
    }

    // inefficient for large models and can not guarantee uniqueness
    getFeatureByName(featureName: string): Feature | undefined {
        this.prepare();
        const results = this.actualNodes.filter(node =>
            node.feature().name.toLowerCase() === featureName.toLowerCase());
        return results.length === 1 ? results[0].feature() : undefined;
    }

    getNodes(featureIDs: string[]): FeatureNode[] {
        return featureIDs
            .map(featureID => this.getNode(featureID))
            .filter(present);
    }

    getFeatures(featureIDs: string[]): Feature[] {
        return featureIDs
            .map(featureID => this.getFeature(featureID))
            .filter(present);
    }

    hasElement(featureID: string): boolean {
        return Array
            .from(document.querySelectorAll('[data-feature-id]'))
            .filter(node => node.getAttribute('data-feature-id') === featureID)
            .length === 1;
    }

    getElement(featureID: string): Element | undefined {
        // Operate under the assumption that we only render ONE feature model, and that it is THIS feature model.
        // This way we don't need to propagate a concrete feature diagram instance.
        const elements = Array
            .from(document.querySelectorAll('[data-feature-id]'))
            .filter(node => node.getAttribute('data-feature-id') === featureID);
        if (elements.length > 1)
            throw new Error(`multiple features "${featureID}" found - ` +
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

    getVisibleFeatureIDs(): string[] {
        return this.visibleNodes.map(getID);
    }

    getActualFeatureIDs(): string[] {
        return this.actualNodes.map(getID);
    }

    getFeatureIDsWithActualChildren(): string[] {
        return this.actualNodes.filter(hasActualChildren).map(getID);
    }

    getFeatureIDsBelowWithActualChildren(featureID: string): string[] {
        const node = this.getNode(featureID);
        return node ? getNodesBelow(node).filter(hasActualChildren).map(getID) : [];
    }

    isSiblingFeatures(featureIDs: string[]): boolean {
        const parents = this
            .getNodes(featureIDs)
            .map(node => node.parent);
        return parents.every(parent => parent === parents[0]);
    }

    // returns features which, when collapsed, make the feature model fit to the given screen size
    getFittingFeatureIDs(settings: Settings, featureDiagramLayout: FeatureDiagramLayoutType,
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
        let nodes = this.actualNodes, collapsedFeatureIDs: string[] = [];
        width = Math.max(width, constants.featureDiagram.fitToScreen.minWidth);
        height = Math.max(height, constants.featureDiagram.fitToScreen.minHeight);
        logger.infoBeginCollapsed(() => `[fit to screen] fitting feature model to ${estimatedDimension} ${FeatureDiagramLayoutType.verticalTree ? width : height}px`);

        while (true) {
            const {estimatedSize, collapsibleNodes} = estimateHierarchySize(
                nodes, collapsedFeatureIDs, featureDiagramLayout,
                {fontFamily, fontSize, widthPadding, rectHeight, getID, scale});
            logger.info(() => `estimated ${estimatedDimension} ${Math.round(estimatedSize)}px when collapsing ${JSON.stringify(collapsedFeatureIDs)}`);
    
            if ((featureDiagramLayout === FeatureDiagramLayoutType.verticalTree ? estimatedSize <= width : estimatedSize <= height) ||
                collapsibleNodes.length === 0) {
                logger.info(() => `feature model fitted by collapsing ${collapsedFeatureIDs.length} feature(s)`);
                logger.infoEnd();
                return collapsedFeatureIDs;
            }
    
            const collapsibleNodeIDs = collapsibleNodes.map(getID);
            logger.info(() => `collapsing ${JSON.stringify(collapsibleNodeIDs)}`);
            collapsedFeatureIDs = collapsedFeatureIDs.concat(collapsibleNodeIDs);
            const invisibleNodes = collapsibleNodes
                .map(node => getNodesBelow(node).slice(1))
                .reduce((acc, children) => acc.concat(children), []);
            nodes = nodes.filter(node => !invisibleNodes.includes(node));
        }
    }

    toString() {
        return `FeatureModel ${JSON.stringify(this.getVisibleFeatureIDs())}`;
    }
}

export default FeatureModel;