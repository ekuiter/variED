import objectPath from 'object-path';
import objectPathImmutable from 'object-path-immutable';

export const defaultSettings = {
    featureDiagram: {
        // settings paths that should NOT trigger a rerender of the feature diagram
        doNotRerenderForPaths: ['treeLayout.useTransitions', 'treeLayout.transitionDuration'],
        forceRerender: +new Date(), // update this field to force a rerender
        font: {
            family: 'Arial', // font family for feature diagrams
            size: 16 // main font size for feature names
        },
        treeLayout: {
            debug: false, // whether to show the estimated bounding box and node anchors
            scaleExtent: [0.1, 4], // currently fixed, specifies how far the user can zoom in and out
            useTransitions: true, // whether to animate feature diagram updates
            transitionDuration: 300, // animation duration in ms
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
                visibleFill: 'black',
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
                layerMargin: 80, // additional margin between layers in px (layer height is roughly widest text on layer + layerMargin)
                collapseGapSpace: 3 // additional margin for collapse text in px
            }
        },
        overlay: {
            throttleUpdate: 200, // how often to reposition the overlay on zoom or pan in ms
            gapSpace: 5, // space between node and overlay in px
            width: 300 // width of feature callout in px
        }
    },
    userFacepile: {
        maxDisplayableUsers: 3, // number of users to display before overflowing
        overflowBreakpoint: 768, // viewport width under which all users will be overflowed
        gapSpace: 3 // space between facepile and overlay
    },
    overlays: {
        settingsPanel: {
            debounceUpdate: 200 // after which time continuous (e.g., slider) settings should be applied
        }
    }
};

export function getSetting(settings: object, ...paths: string[]): any {
    const path = paths.join('.');
    if (!path)
        return settings;
    if (!objectPath.has(settings, path))
        throw new Error(`setting ${path} does not exist`);
    return objectPath.get(settings, path);
}

export function getNewSettings(settings: object, path: string, value: any): object {
    if (!objectPath.has(settings, path))
        throw new Error(`setting ${path} does not exist`);
    if (typeof value === 'function')
        return objectPathImmutable.update(settings, path, value);
    else
        return objectPathImmutable.set(settings, path, value);
}

export function cloneSettings(settings: object): object {
    return JSON.parse(JSON.stringify(settings));
}

export function traverseSettings(settings: object, path: string | undefined,
    fn: (path: string, key: string, value: any) => void): void {
    if (path)
        settings = getSetting(settings, path);
    const traverse = (paths: string[], parentObject: object) => ([key, value]: [string, any]) => {
        if (typeof value === 'object' && !Array.isArray(value))
            Object.entries(value).forEach(traverse([...paths, key], value));
        else
            fn.call(parentObject, [...paths, key].join('.'), key, value);
    };
    Object.entries(settings).forEach(traverse(path ? [path] : [], settings));
}