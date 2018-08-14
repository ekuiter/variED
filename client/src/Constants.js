import {getNodeProperty, isGroupNode} from './server/nodeUtils';

const Constants = {
    websocket: process.env.REACT_APP_WEBSOCKET || `ws://${window.location.host}/`, // WebSocket URI to connect to
    font: { // if you change these, make sure they are in sync with the stylesheet
        family: 'Roboto', // external font to load (src specified in stylesheet)
        familyFallback: 'Arial', // fallback if font loading fails
        size: 16, // main font size for feature names, used for bounding box estimation
        textMeasure: '16px Roboto', // given to CanvasRenderingContext2D to measure width of texts
        textMeasureFallback: '16px Arial', // see familyFallback
        loadTimeout: 1000, // time until fallback is used
        publicPath: '/roboto.woff' // used for inlining the font on SVG export
    },
    treeLayout: {
        scaleExtent: [0.1, 4], // currently fixed, specifies how far the user can zoom in and out
        duration: 300, // animation duration in ms
        node: {
            // a node is imagined as "1px wide, 1px high", free space for drawing rectangles
            size: [1, 1], // is made by calculations in AbstractTreeLayout.createLayout using the values below
            paddingX: 12, // x padding for rectangles in px (rectangle width is roughly measured width + 2 * paddingX)
            paddingY: 8, // y padding for rectangles in px (rectangle height is roughly font.size + 2 * paddingY)
            strokeWidth: 1, // rectangle stroke width (keep in sync with stylesheet)
            baselineHeight: 5, // estimated distance of the font's baseline and descent (depends on font.size)
            bboxPadding: 10, // general padding for the estimated bounding box (avoid "touching" the window)
            // estimates the width of a node's rectangle
            estimateRectWidth(estimatedTextWidth) {
                return estimatedTextWidth + 2 * this.paddingX + 2 * this.strokeWidth;
            },
            // estimates the height of a node's rectangle
            estimateRectHeight() {
                return Constants.font.size + 2 * this.paddingY + 2 * this.strokeWidth;
            },
            // estimates the x coordinate of a node's rectangle left or right side
            estimateXOffset(sgn, estimatedTextWidth, layout) {
                return sgn * (estimatedTextWidth * (layout === 'vertical' ? 0.5 : sgn === 1 ? 1 : 0) +
                    this.paddingX + this.strokeWidth + this.bboxPadding);
            },
            // estimates the y coordinate of a node's rectangle top or bottom side
            estimateYOffset(sgn, layout) {
                return sgn === 1
                    ? this.baselineHeight + this.paddingY + this.strokeWidth + this.bboxPadding
                    : (-1) * (Constants.font.size + this.paddingY + this.strokeWidth + this.bboxPadding);
            }
        },
        link: {
            circleRadius: 6, // radius of circles denoting mandatory and optional features
            groupRadius: 18, // radius of arcs denoting OR and ALT groups
        },
        vertical: {
            marginX: 12, // collapsing x margin for rectangles in px (= distance between rectangles)
            layerHeight: 100 // height of a layer in the vertical tree layout
        },
        horizontal: {
            marginY: 12, // collapsing y margin for rectangles in px (see vertical.marginX)
            layerMargin: 80 // additional margin between layers (layer height is roughly widest text on layer + layerMargin)
        },
        style: { // adapted from FeatureIDE/plugins/de.ovgu.featureide.fm.ui/src/de/ovgu/featureide/fm/ui/editors/featuremodel/GUIDefaults.java
            node: {
                abstract: { // style applied to a node's rectangle to distinguish abstract and concrete features
                    property: () => Constants.featureModelTags.ABSTRACT,
                    yes: {fill: '#f2f2ff', stroke: '#b6b6bf'},
                    no: {fill: '#ccccff', stroke: '#9999bf'}
                },
                hidden: { // style applied to a node's text to distinguish hidden and visible features
                    property: () => Constants.featureModelTags.HIDDEN,
                    yes: {fill: '#676767'}
                },
                arcSegment: { // style applied to a node's arc segment (for ALT groups)
                    fill: 'none',
                    stroke: () => Constants.treeLayout.style.link.line.stroke,
                    'stroke-width': () => Constants.treeLayout.style.link.line['stroke-width']
                },
                arcSlice: { // style applied to a node's arc slice (for OR groups)
                    fill: () => Constants.treeLayout.style.link.line.stroke
                }
            },
            link: {
                line: { // style applied to all links' line paths
                    stroke: '#888',
                    'stroke-width': '1.5px',
                    fill: 'none'
                },
                mandatory: { // style applied to a link's circle to distinguish mandatory and optional features
                    property: () => node =>
                        isGroupNode(node.parent) ? 'none' : getNodeProperty(node, Constants.featureModelTags.MANDATORY),
                    yes: {
                        stroke: () => Constants.treeLayout.style.link.line.stroke,
                        'stroke-width': () => Constants.treeLayout.style.link.line['stroke-width'],
                        fill: () => Constants.treeLayout.style.link.line.stroke
                    },
                    no: {
                        stroke: () => Constants.treeLayout.style.link.line.stroke,
                        'stroke-width': () => Constants.treeLayout.style.link.line['stroke-width'],
                        fill: 'white'
                    },
                    none: { // children of OR and ALT groups do not have a circle
                        r: 0,
                        fill: 'white'
                    }
                }
            },
            vertical: {
                text: { // style that centers text and rectangles on the node's position
                    'text-anchor': 'middle'
                }
            },
            horizontal: {
                text: { // style that left-aligns text and rectangles on the node's position
                    'text-anchor': 'start'
                }
            }
        }
    },
    viewport: {
        throttleResize: 10 // limits number of window resize events to one per ... ms (avoids unnecessary rendering)
    },
    message: { // message type enumeration used by the server
        ERROR: 'ERROR',
        ENDPOINT_SUBSCRIBE: 'ENDPOINT_SUBSCRIBE',
        ENDPOINT_UNSUBSCRIBE: 'ENDPOINT_UNSUBSCRIBE',
        FEATURE_MODEL: 'FEATURE_MODEL',
        FEATURE_MODEL_PATCH: 'FEATURE_MODEL_PATCH',
        UNDO: 'UNDO',
        REDO: 'REDO',
        CONSTRAINT_MOVE: 'CONSTRAINT_MOVE',
        CONSTRAINT_MODIFY: 'CONSTRAINT_MODIFY',
        CONSTRAINT_DELETE: 'CONSTRAINT_DELETE',
        CONSTRAINT_ADD: 'CONSTRAINT_ADD',
        CONSTRAINT_SELECTED: 'CONSTRAINT_SELECTED',
        FEATURE_MODIFY: 'FEATURE_MODIFY',
        FEATURE_DELETE: 'FEATURE_DELETE',
        FEATURE_ADD_ABOVE: 'FEATURE_ADD_ABOVE',
        FEATURE_ADD: 'FEATURE_ADD',
        FEATURE_NAME_CHANGED: 'FEATURE_NAME_CHANGED',
        ALL_FEATURES_CHANGED_NAME_TYPE: 'ALL_FEATURES_CHANGED_NAME_TYPE',
        COLOR_CHANGED: 'COLOR_CHANGED',
        HIDDEN_CHANGED: 'HIDDEN_CHANGED',
        COLLAPSED_CHANGED: 'COLLAPSED_CHANGED',
        COLLAPSED_ALL_CHANGED: 'COLLAPSED_ALL_CHANGED',
        LOCATION_CHANGED: 'LOCATION_CHANGED',
        ATTRIBUTE_CHANGED: 'ATTRIBUTE_CHANGED',
        GROUP_TYPE_CHANGED: 'GROUP_TYPE_CHANGED',
        PARENT_CHANGED: 'PARENT_CHANGED',
        MANDATORY_CHANGED: 'MANDATORY_CHANGED',
        STRUCTURE_CHANGED: 'STRUCTURE_CHANGED',
        LEGEND_LAYOUT_CHANGED: 'LEGEND_LAYOUT_CHANGED',
        MODEL_LAYOUT_CHANGED: 'MODEL_LAYOUT_CHANGED',
        MODEL_DATA_CHANGED: 'MODEL_DATA_CHANGED',
        MODEL_DATA_SAVED: 'MODEL_DATA_SAVED',
        MODEL_DATA_LOADED: 'MODEL_DATA_LOADED',
        MODEL_DATA_OVERRIDDEN: 'MODEL_DATA_OVERRIDDEN',
        REDRAW_DIAGRAM: 'REDRAW_DIAGRAM',
        REFRESH_ACTIONS: 'REFRESH_ACTIONS',
        CHILDREN_CHANGED: 'CHILDREN_CHANGED',
        DEPENDENCY_CALCULATED: 'DEPENDENCY_CALCULATED',
        ACTIVE_EXPLANATION_CHANGED: 'ACTIVE_EXPLANATION_CHANGED',
        FEATURE_ATTRIBUTE_CHANGED: 'FEATURE_ATTRIBUTE_CHANGED',
        ACTIVE_REASON_CHANGED: 'ACTIVE_REASON_CHANGED',
        DEFAULT: 'DEFAULT'
    },
    featureModelTags: { // tags and attributes used in serialized feature models
        TYPE: 'type',
        FEATURE: 'feature',
        OR: 'or',
        ALT: 'alt',
        AND: 'and',
        NAME: 'name',
        DESCRIPTION: 'description',
        MANDATORY: 'mandatory',
        ABSTRACT: 'abstract',
        HIDDEN: 'hidden'
    }
};

export default Constants;