import {HierarchyPointNode} from 'd3-hierarchy';
import {Point} from '../types';

export type FeaturePropertyKey = string | ((node: GraphicalFeatureModelNode) => string);

export enum FeatureType {
    feature = 'feature',
    or = 'or',
    alt = 'alt',
    and = 'and'
};

export interface GraphicalFeature {
    node: GraphicalFeatureModelNode,
    name: string,
    type: FeatureType,
    description: string,
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

type Datum = object; // this is an object per feature sent by the server accessible as node.data

export type GraphicalFeatureModelNode = HierarchyPointNode<Datum> & {
    children?: GraphicalFeatureModelNode[];
    actualChildren?: GraphicalFeatureModelNode[];
    _feature: GraphicalFeature;
    feature: () => GraphicalFeature;
}

export type NodeCoordinateFunction = (node: GraphicalFeatureModelNode) => number;
export type NodeCoordinateForAxisFunction = (node: GraphicalFeatureModelNode, axis: string) => number;
export type NodePointFunction = (node: GraphicalFeatureModelNode) => Point;