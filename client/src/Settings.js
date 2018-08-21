import objectPath from 'object-path';
import objectPathImmutable from 'object-path-immutable';

const SETTING = 'SETTING';

export const defaultSettings = {
    featureModel: {
        layout: 'horizontalTree',
        font: { // if you change these, make sure they are in sync with the stylesheet
            family: 'Arial', // main font family for feature diagrams
            size: 16, // main font size for feature names, used for bounding box estimation
            loadTimeout: 1000, // time until fallback is used
            publicPath: 'TODO' // used for inlining the font on SVG export TODO
        },
        treeLayout: {
            debug: false, // whether to show the estimated bounding box and node anchors
            scaleExtent: [0.1, 4], // currently fixed, specifies how far the user can zoom in and out
            useTransitions: true, // whether to animate feature model updates
            duration: 300, // animation duration in ms
            node: {
                // a node is imagined as "1px wide, 1px high", free space for drawing rectangles
                size: [1, 1], // is made by calculations in AbstractTreeLayout.createLayout using the values below
                paddingX: 12, // x padding for rectangles in px (rectangle width is roughly measured width + 2 * paddingX)
                paddingY: 8, // y padding for rectangles in px (rectangle height is roughly font.size + 2 * paddingY)
                strokeWidth: 1, // rectangle stroke width (keep in sync with stylesheet)
                baselineHeight: 5, // estimated distance of the font's baseline and descent (depends on font.size)
                bboxPadding: 10 // general padding for the estimated bounding box (avoid "touching" the window)
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
            featureCallout: {
                throttleUpdate: 50, // how often to reposition the feature callout on zoom or pan in ms
                gapSpace: 5 // space between node and feature callout in px
            }
        }
    }
};

export function getSetting(settings, path) {
    if (!objectPath.has(settings, path))
        throw new Error(`setting ${path} does not exist`);
    return objectPath.get(settings, path);
}

export function isSettingAction(action) {
    return action.type === SETTING;
}

export function setSetting(path, value) {
    return {type: SETTING, path, value};
}

export function getNewSettings(settings, path, value) {
    if (!objectPath.has(settings, path))
        throw new Error(`setting ${path} does not exist`);
    if (typeof value === 'function')
        return objectPathImmutable.update(settings, path, value);
    else
        return objectPathImmutable.set(settings, path, value);
}