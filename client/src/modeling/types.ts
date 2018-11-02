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
export const DESCRIPTION = 'description';
export const MANDATORY = 'mandatory';
export const ABSTRACT = 'abstract';
export const HIDDEN = 'hidden';

export enum FeatureType {
    feature = 'feature',
    or = 'or',
    alt = 'alt',
    and = 'and',
    unknown = 'unknown'
};

export interface SerializedFeatureModelNode {
    [TYPE]: FeatureType,
    [NAME]: string,
    [HIDDEN]?: boolean,
    [MANDATORY]?: boolean,
    [ABSTRACT]?: boolean,
    [DESCRIPTION]?: string,
    children?: SerializedFeatureModelNode[]
};

export interface SerializedFeatureModel {
    [STRUCT]: SerializedFeatureModelNode[],
    // ignored for now
    [CONSTRAINTS]: never,
    [PROPERTIES]: never,
    [CALCULATIONS]: never,
    [COMMENTS]: never,
    [FEATURE_ORDER]: never
};

export type FeaturePropertyKey = string | ((node: GraphicalFeatureModelNode) => string);

export interface GraphicalFeature {
    node: GraphicalFeatureModelNode,
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

type Datum = SerializedFeatureModelNode; // accessible as node.data

export type GraphicalFeatureModelNode = HierarchyPointNode<Datum> & {
    children?: GraphicalFeatureModelNode[];
    actualChildren?: GraphicalFeatureModelNode[];
    _feature: GraphicalFeature;
    feature: () => GraphicalFeature;
}

export type NodeCoordinateFunction = (node: GraphicalFeatureModelNode) => number;
export type NodeCoordinateForAxisFunction = (node: GraphicalFeatureModelNode, axis: string) => number;
export type NodePointFunction = (node: GraphicalFeatureModelNode) => Point;