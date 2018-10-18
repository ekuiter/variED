/**
 * Definition of common types and enumerations.
 */

import PropTypes from 'prop-types';
import {HierarchyPointNode} from 'd3-hierarchy';
import {Selection} from 'd3-selection';

export enum MessageType {
    ERROR = 'ERROR',
    USER_JOINED = 'USER_JOINED',
    USER_LEFT = 'USER_LEFT',
    UNDO = 'UNDO',
    REDO = 'REDO',
    MULTIPLE_MESSAGES = 'MULTIPLE_MESSAGES',
    FEATURE_DIAGRAM_FEATURE_MODEL = 'FEATURE_DIAGRAM_FEATURE_MODEL',
    FEATURE_DIAGRAM_FEATURE_ADD_BELOW = 'FEATURE_DIAGRAM_FEATURE_ADD_BELOW',
    FEATURE_DIAGRAM_FEATURE_ADD_ABOVE = 'FEATURE_DIAGRAM_FEATURE_ADD_ABOVE',
    FEATURE_DIAGRAM_FEATURE_REMOVE = 'FEATURE_DIAGRAM_FEATURE_REMOVE',
    FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW = 'FEATURE_DIAGRAM_FEATURE_REMOVE_BELOW',
    FEATURE_DIAGRAM_FEATURE_RENAME = 'FEATURE_DIAGRAM_FEATURE_RENAME',
    FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION = 'FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION',
    FEATURE_DIAGRAM_FEATURE_SET_PROPERTY = 'FEATURE_DIAGRAM_FEATURE_SET_PROPERTY'
};

export type Message = {
    type: MessageType,
    [x: string]: any
};

export function isMessageType(type: string) {
    return Object.values(MessageType).includes(type);
};

export type FeaturePropertyKey = string | ((node: FeatureModelNode) => string);

export type Feature = {
    node: FeatureModelNode,
    name: string,
    type: string, // TODO: use enum
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

type Datum = object; // this is an object per feature sent by the server accessible as node.data below

export type FeatureModelNode = HierarchyPointNode<Datum> & {
    children?: FeatureModelNode[];
    actualChildren?: FeatureModelNode[];
    _feature: Feature;
    feature: () => Feature;
}

export type Point = {x: number, y: number};
// essentially the same as a DOMRect/ClientRect
export type Rect = Point & {width: number, height: number};
// upper left and lower right point, can be transformed to rect (but the tuple form is also useful)
export type Bbox = [[number, number], [number, number]];
export type NodeCoordinateFunction = (node: FeatureModelNode) => number;
export type NodePointFunction = (node: FeatureModelNode) => Point;
// Represents any selection. We ignore the generic parameters here for simplicity.
// (IMO adding them would improve type safety, but decrease overall readability.)
export type D3Selection = Selection<any, any, any, any>;
// matches any function - this should be used sparely
export type Func = (...args: any[]) => any;

export const
    layoutTypes = {
        verticalTree: 'verticalTree',
        horizontalTree: 'horizontalTree'
    },
    LayoutType = PropTypes.oneOf(Object.values(layoutTypes)),

    formatTypes = {
        svg: 'svg',
        png: 'png',
        jpg: 'jpg',
        pdf: 'pdf'
    },
    FormatType = PropTypes.oneOf(Object.values(formatTypes)),

    SettingsType = PropTypes.object,

    overlayTypes = {
        settingsPanel: 'settingsPanel',
        aboutPanel: 'aboutPanel',
        featurePanel: 'featurePanel',
        featureRenameDialog: 'featureRenameDialog',
        featureSetDescriptionDialog: 'featureSetDescriptionDialog',
        exportDialog: 'export',
        featureCallout: 'featureCallout',
        featureContextualMenu: 'featureContextualMenu',
        isFloatingFeature: (type?: string) => type === 'featureCallout' || type === 'featureContextualMenu'
    },
    OverlayType = PropTypes.oneOf(Object.values(overlayTypes));