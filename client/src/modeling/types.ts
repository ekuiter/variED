import {HierarchyPointNode} from 'd3-hierarchy';
import {Point} from '../types';

// tags and attributes used in serialized feature models
export const STRUCT = 'struct';
export const CONSTRAINTS = 'constraints';
export const PROPERTIES = 'properties';
export const CALCULATIONS = 'calculations';
export const COMMENTS = 'comments';
export const FEATURE_ORDER = 'featureOrder';
export const TYPE = 'type';
export const NAME = 'name';
export const UUID = 'uuid';
export const DESCRIPTION = 'description';
export const MANDATORY = 'mandatory';
export const ABSTRACT = 'abstract';
export const HIDDEN = 'hidden';
export const VAR = 'var';

export enum FeatureType {
    feature = 'feature',
    or = 'or',
    alt = 'alt',
    and = 'and',
    unknown = 'unknown'
};

enum ConstraintType {
    var = 'var',
    not = 'not',
    disj = 'disj',
    eq = 'eq',
    imp = 'imp',
    conj = 'conj',
    atmost1 = 'atmost1',
    unknown = 'unknown'
};

export interface SerializedFeatureNode {
    [TYPE]: FeatureType,
    [NAME]: string,
    [UUID]: string,
    [HIDDEN]?: boolean,
    [MANDATORY]?: boolean,
    [ABSTRACT]?: boolean,
    [DESCRIPTION]?: string,
    children?: SerializedFeatureNode[]
};

interface SerializedConstraintNode {
    [TYPE]: ConstraintType,
    [VAR]?: string,
    children?: SerializedConstraintNode[]
};

export interface SerializedConstraint {
    [TYPE]: 'rule',
    children: SerializedConstraintNode[]
};

export interface SerializedFeatureModel {
    [STRUCT]: SerializedFeatureNode[],
    [CONSTRAINTS]: SerializedConstraint[],
    // ignored for now
    [CALCULATIONS]: never,
    [COMMENTS]: never,
    [FEATURE_ORDER]: never
};

export type FeaturePropertyKey = string | ((node: GraphicalFeatureNode) => string);

export interface GraphicalFeature {
    node: GraphicalFeatureNode,
    uuid: string,
    name: string,
    type: FeatureType,
    description?: string,
    isRoot: boolean,
    isAbstract: boolean,
    isHidden: boolean,
    isMandatory: boolean,
    isAnd: boolean,
    isOr: boolean,
    isAlternative: boolean,
    isGroup: boolean,
    isCollapsed: boolean,
    hasChildren: boolean,
    hasActualChildren: boolean,
    getPropertyString: (key: FeaturePropertyKey) => string,
    getNumberOfFeaturesBelow: () => number
};

type Datum = SerializedFeatureNode; // accessible as node.data

export type GraphicalFeatureNode = HierarchyPointNode<Datum> & {
    children?: GraphicalFeatureNode[];
    actualChildren?: GraphicalFeatureNode[];
    _feature: GraphicalFeature;
    feature: () => GraphicalFeature;
}

export type NodeCoordinateFunction = (node: GraphicalFeatureNode) => number;
export type NodeCoordinateForAxisFunction = (node: GraphicalFeatureNode, axis: string) => number;
export type NodePointFunction = (node: GraphicalFeatureNode) => Point;