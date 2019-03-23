import {HierarchyPointNode} from 'd3-hierarchy';
import {Point} from '../types';

// keys and attributes used in kernel feature models
export const FEATURES = 'features';
export const CONSTRAINTS = 'constraints';
export const CHILDREN_CACHE = 'children-cache';
export const NIL = 'nil';
export const ID_KEY = 'ID';
export const NAME = 'name';
export const DESCRIPTION = 'description';
export const OPTIONAL = 'optional?';
export const ABSTRACT = 'abstract?';
export const HIDDEN = 'hidden?';
export const PARENT_ID = 'parent-ID';
export const GROUP_TYPE = 'group-type';
export const GRAVEYARDED = 'graveyarded?';
export const FORMULA = 'formula';

export enum ConstraintType {
    unknown = 'unknown',
    not = 'not',
    disj = 'disj',
    eq = 'eq',
    imp = 'imp',
    conj = 'conj'
};

export enum GroupType {
    and = 'and',
    or = 'or',
    alternative = 'alternative'
};

export enum PropertyType {
    abstract = 'abstract?',
    hidden = 'hidden?',
    name = 'name',
    description = 'description'
};

export interface KernelFeature {
    [ID_KEY]?: string, // added dynamically by FeatureModel class
    [NAME]: string,
    [DESCRIPTION]: string | null,
    [HIDDEN]: boolean,
    [OPTIONAL]: boolean,
    [ABSTRACT]: boolean,
    [PARENT_ID]?: string | null,
    [GROUP_TYPE]: GroupType
};

export type KernelConstraintFormulaAtom = ConstraintType | string;
export interface KernelConstraintNestedFormula extends Array<KernelConstraintNestedFormula | KernelConstraintFormulaAtom> {}
export type KernelConstraintFormula = KernelConstraintFormulaAtom | KernelConstraintNestedFormula;

export interface KernelConstraint {
    [ID_KEY]?: string, // added dynamically, see KernelFeature
    [GRAVEYARDED]: boolean,
    [FORMULA]: KernelConstraintFormula
};

export interface KernelFeatureModel {
    [FEATURES]: {[ID: string]: KernelFeature},
    [CONSTRAINTS]: {[ID: string]: KernelConstraint},
    [CHILDREN_CACHE]: {[ID: string]: string[]}
};

export type FeaturePropertyKey = string | ((node: FeatureNode) => string);

export interface Feature {
    node: FeatureNode,
    ID: string,
    name: string,
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
    getNumberOfFeaturesBelow: () => number,
    getFeatureIDsBelow: () => string[]
};

type Datum = KernelFeature; // accessible as node.data

export type FeatureNode = HierarchyPointNode<Datum> & {
    children?: FeatureNode[];
    actualChildren?: FeatureNode[];
    _feature: Feature;
    feature: () => Feature;
}

export type NodeCoordinateFunction = (node: FeatureNode) => number;
export type NodeCoordinateForAxisFunction = (node: FeatureNode, axis: string) => number;
export type NodePointFunction = (node: FeatureNode) => Point;