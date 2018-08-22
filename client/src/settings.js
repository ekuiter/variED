import objectPath from 'object-path';
import objectPathImmutable from 'object-path-immutable';

const SETTINGS_SET = 'SETTINGS_SET', SETTINGS_RESET = 'SETTINGS_RESET';

export const defaultSettings = {
        featureDiagram: {
            layout: 'horizontalTree', // layout for displaying a feature diagram
            font: {
                family: 'Arial', // font family for feature diagrams
                size: 16 // main font size for feature names
            },
            treeLayout: {
                debug: false, // whether to show the estimated bounding box and node anchors
                scaleExtent: [0.1, 4], // currently fixed, specifies how far the user can zoom in and out
                useTransitions: true, // whether to animate feature diagram updates
                duration: 300, // animation duration in ms
                node: {
                    // a node is imagined as "1px wide, 1px high", free space for drawing rectangles
                    size: [1, 1], // is made by calculations in AbstractTreeLayout.createLayout using the values below
                    paddingX: 12, // x padding for rectangles in px (rectangle width is roughly measured width + 2 * paddingX)
                    paddingY: 8, // y padding for rectangles in px (rectangle height is roughly font.size + 2 * paddingY)
                    strokeWidth: 1, // rectangle stroke width in px
                    bboxPadding: 20, // general padding for the estimated bounding box in px (avoid "touching" the window)
                    // colors for different feature types (fill = rectangle area, stroke = rectangle border)
                    abstractFill: '#f2f2ff',
                    abstractStroke: '#b6b6bf',
                    concreteFill: '#ccccff',
                    concreteStroke: '#9999bf',
                    hiddenFill: '#676767'
                },
                link: {
                    circleRadius: 6, // radius of circles denoting mandatory and optional features in px
                    stroke: '#888', // link stroke color
                    strokeWidth: 1.5 // link stroke width in px
                },
                vertical: {
                    marginX: 12, // collapsing x margin for rectangles in px (= distance between rectangles)
                    layerHeight: 100, // height of a layer in the vertical tree layout in px
                    groupRadius: 20 // radius of arcs denoting OR and ALT groups in px
                },
                horizontal: {
                    marginY: 12, // collapsing y margin for rectangles in px (see vertical.marginX)
                    layerMargin: 80 // additional margin between layers in px (layer height is roughly widest text on layer + layerMargin)
                },
                featureCallout: {
                    throttleUpdate: 50, // how often to reposition the feature callout on zoom or pan in ms
                    gapSpace: 5 // space between node and feature callout in px
                }
            }
        }
    }
;

export function getSetting(settings, ...paths) {
    const path = paths.join('.');
    if (!objectPath.has(settings, path))
        throw new Error(`setting ${path} does not exist`);
    return objectPath.get(settings, path);
}

export function isSettingsSetAction(action) {
    return action.type === SETTINGS_SET;
}

export function isSettingsResetAction(action) {
    return action.type === SETTINGS_RESET;
}

export function setSetting(path, value) {
    return {type: SETTINGS_SET, path, value};
}

export function resetSettings() {
    return {type: SETTINGS_RESET};
}

export function getNewSettings(settings, path, value) {
    if (!objectPath.has(settings, path))
        throw new Error(`setting ${path} does not exist`);
    if (typeof value === 'function')
        return objectPathImmutable.update(settings, path, value);
    else
        return objectPathImmutable.set(settings, path, value);
}