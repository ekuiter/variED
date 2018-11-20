/**
 * Settings that may be adjusted at runtime.
 * These settings are stored in Redux and may be passed to components.
 * Changing a setting then causes all consuming components to rerender.
 */

import objectPath from 'object-path';
import objectPathImmutable from 'object-path-immutable';

export interface Settings {
    developer: {
        debug: boolean, // whether to show detailed logs and the estimated bounding box and node anchors for feature diagrams
        delay: number // simulate message delay when developing on localhost
    },
    views: {
        splitDirection: 'horizontal' | 'vertical', // at which axis to split views
        splitAt: number, // percentage of left/top view from 0 to 1
    },
    featureDiagram: {
        // settings paths that should NOT trigger a rerender of the feature diagram
        doNotRerenderForPaths: string[],
        forceRerender: number, // update this field to force a rerender
        font: {
            family: string, // font family for feature diagrams
            size: number // main font size for feature names
        },
        treeLayout: {
            scaleExtent: [number, number], // currently fixed, specifies how far the user can zoom in and out
            useTransitions: boolean, // whether to animate feature diagram updates
            transitionDuration: number, // animation duration in ms
            node: {
                // a node is imagined as "1px wide, 1px high", free space for drawing rectangles
                size: [number, number], // is made by calculations in AbstractTreeLayout.createLayout using the values below
                paddingX: number, // x padding for rectangles in px (rectangle width is roughly measured width + 2 * paddingX)
                paddingY: number, // y padding for rectangles in px (rectangle height is roughly font.size + 2 * paddingY)
                strokeWidth: number, // rectangle stroke width in px
                bboxPadding: number, // general padding for the estimated bounding box in px (avoid "touching" the window)
                // colors for different feature types (fill = rectangle area, stroke = rectangle border)
                abstractFill: string,
                abstractStroke: string,
                concreteFill: string,
                concreteStroke: string,
                visibleFill: string,
                hiddenFill: string
            },
            link: {
                circleRadius: number, // radius of circles denoting mandatory and optional features in px
                stroke: string, // link stroke color
                strokeWidth: number // link stroke width in px
            },
            vertical: {
                marginX: number, // collapsing x margin for rectangles in px (= distance between rectangles)
                layerHeight: number, // height of a layer in the vertical tree layout in px
                groupRadius: number // radius of arcs denoting OR and ALT groups in px
            },
            horizontal: {
                marginY: number, // collapsing y margin for rectangles in px (see vertical.marginX)
                layerMargin: number, // additional margin between layers in px (layer height is roughly widest text on layer + layerMargin)
                collapseGapSpace: number // additional margin for collapse text in px
            }
        },
        overlay: {
            throttleUpdate: number, // how often to reposition the overlay on zoom or pan in ms
            gapSpace: number, // space between node and overlay in px
            width: number // width of feature callout in px
        }
    },
    userFacepile: {
        maxDisplayableUsers: number, // number of users to display before overflowing
        overflowBreakpoint: number, // viewport width under which all users will be overflowed
        gapSpace: number // space between facepile and overlay
    },
    overlays: {
        settingsPanel: {
            debounceUpdate: number // after which time continuous (e.g., slider) settings should be applied
        }
    }
};

export const defaultSettings: Settings = {
    developer: {
        debug: false,
        delay: 0
    },
    views: {
        splitDirection: 'horizontal',
        splitAt: 0.5
    },
    featureDiagram: {
        doNotRerenderForPaths: ['treeLayout.useTransitions', 'treeLayout.transitionDuration'],
        forceRerender: +new Date(),
        font: {
            family: 'Arial',
            size: 16
        },
        treeLayout: {
            scaleExtent: [0.1, 4],
            useTransitions: true,
            transitionDuration: 300,
            node: {
                size: [1, 1],
                paddingX: 12,
                paddingY: 8,
                strokeWidth: 1,
                bboxPadding: 20,
                abstractFill: '#f2f2ff',
                abstractStroke: '#b6b6bf',
                concreteFill: '#ccccff',
                concreteStroke: '#9999bf',
                visibleFill: 'black',
                hiddenFill: '#676767'
            },
            link: {
                circleRadius: 6,
                stroke: '#888',
                strokeWidth: 1.5
            },
            vertical: {
                marginX: 12,
                layerHeight: 100,
                groupRadius: 20
            },
            horizontal: {
                marginY: 12,
                layerMargin: 80,
                collapseGapSpace: 3
            }
        },
        overlay: {
            throttleUpdate: 200,
            gapSpace: 5,
            width: 300
        }
    },
    userFacepile: {
        maxDisplayableUsers: 3,
        overflowBreakpoint: 768,
        gapSpace: 3
    },
    overlays: {
        settingsPanel: {
            debounceUpdate: 200
        }
    }
};

export function getSetting(settings: Settings, ...paths: string[]): any {
    const path = paths.join('.');
    if (!objectPath.has(settings, path))
        throw new Error(`setting ${path} does not exist`);
    return objectPath.get(settings, path);
}

export function getNewSettings(settings: Settings, path: string, value: any): Settings {
    if (!objectPath.has(settings, path))
        throw new Error(`setting ${path} does not exist`);
    if (typeof value === 'function')
        return objectPathImmutable.update(settings, path, value) as any;
    else
        return objectPathImmutable.set(settings, path, value);
}

export function cloneSettings(settings: object): object {
    return JSON.parse(JSON.stringify(settings));
}

export function traverseSettings(settings: object,
    fn: (path: string, key: string, value: any) => void): void {
    const traverse = (paths: string[], parentObject: object) => ([key, value]: [string, any]) => {
        if (typeof value === 'object' && !Array.isArray(value))
            Object.entries(value).forEach(traverse([...paths, key], value));
        else
            fn.call(parentObject, [...paths, key].join('.'), key, value);
    };
    Object.entries(settings).forEach(traverse([], settings));
}