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
export const ID = 'ID';
export const DESCRIPTION = 'description';
export const OPTIONAL = 'optional';
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

export enum ConstraintType {
    var = 'var',
    not = 'not',
    disj = 'disj',
    eq = 'eq',
    imp = 'imp',
    conj = 'conj',
    atmost1 = 'atmost1',
    unknown = 'unknown'
};

export enum GroupType {
    and = 'and',
    or = 'or',
    alternative = 'alternative'
};

export enum PropertyType {
    abstract = 'abstract',
    hidden = 'hidden',
    name = 'name',
    description = 'description'
};

export interface SerializedFeatureNode {
    [TYPE]: FeatureType,
    [NAME]: string,
    [ID]: string,
    [HIDDEN]?: boolean,
    [OPTIONAL]?: boolean,
    [ABSTRACT]?: boolean,
    [DESCRIPTION]?: string,
    children?: SerializedFeatureNode[]
};

export interface SerializedConstraintNode {
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

export type FeaturePropertyKey = string | ((node: FeatureNode) => string);

export interface Feature {
    node: FeatureNode,
    ID: string,
    name: string,
    type: FeatureType,
    description?: string,
    isRoot: boolean,
    isAbstract: boolean,
    isHidden: boolean,
    isOptional: boolean,
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

export type FeatureNode = HierarchyPointNode<Datum> & {
    children?: FeatureNode[];
    actualChildren?: FeatureNode[];
    _feature: Feature;
    feature: () => Feature;
}

export type NodeCoordinateFunction = (node: FeatureNode) => number;
export type NodeCoordinateForAxisFunction = (node: FeatureNode, axis: string) => number;
export type NodePointFunction = (node: FeatureNode) => Point;