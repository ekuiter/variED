/**
 * Style definitions for the tree layouts.
 * These definitions are intended to be used with the SVG helper addStyle.
 * Adapted from FeatureIDE/plugins/de.ovgu.featureide.fm.ui/src/de/ovgu/featureide/fm/ui/editors/featuremodel/GUIDefaults.java.
 */

import {Settings} from '../../../store/settings';
import {StyleDescriptor} from '../../../helpers/svg';

function getLinkStrokeWidth(settings: Settings): string {
    return `${settings.featureDiagram.treeLayout.link.strokeWidth}px`;
}

export default {
    node: {
        abstract: (settings: Settings) => <StyleDescriptor>({ // style applied to a node's rectangle to distinguish abstract and concrete features
            property: 'isAbstract',
            yes: {
                fill: settings.featureDiagram.treeLayout.node.abstractFill,
                stroke: settings.featureDiagram.treeLayout.node.abstractStroke,
                'stroke-width': settings.featureDiagram.treeLayout.node.strokeWidth
            },
            no: {
                fill: settings.featureDiagram.treeLayout.node.concreteFill,
                stroke: settings.featureDiagram.treeLayout.node.concreteStroke,
                'stroke-width': settings.featureDiagram.treeLayout.node.strokeWidth
            }
        }),
        hidden: (settings: Settings) => ({ // style applied to a node's text to distinguish hidden and visible features
            property: 'isHidden',
            yes: {fill: settings.featureDiagram.treeLayout.node.hiddenFill},
            no: {fill: settings.featureDiagram.treeLayout.node.visibleFill}
        }),
        arcSegment: (settings: Settings) => <StyleDescriptor>({ // style applied to a node's arc segment (for ALT groups)
            fill: 'none',
            stroke: settings.featureDiagram.treeLayout.link.stroke,
            'stroke-width': getLinkStrokeWidth(settings)
        }),
        arcSlice: (settings: Settings) => <StyleDescriptor>({ // style applied to a node's arc slice (for OR groups)
            fill: settings.featureDiagram.treeLayout.link.stroke
        }),
        arcClick: (_settings: Settings) => <StyleDescriptor>({ // style applied to a node's clickable arc
            'fill-opacity': 0,
            cursor: 'pointer'
        }),
        collapseText: (settings: Settings) => <StyleDescriptor>({
            'font-size': settings.featureDiagram.font.size * 0.8
        }),
        collapseCircle: (settings: Settings) => <StyleDescriptor>({
            fill: 'white',
            stroke: settings.featureDiagram.treeLayout.link.stroke,
            'stroke-width': getLinkStrokeWidth(settings),
            cursor: 'pointer'
        })
    },
    link: {
        line: (settings: Settings) => <StyleDescriptor>({ // style applied to all links' line paths
            stroke: settings.featureDiagram.treeLayout.link.stroke,
            'stroke-width': getLinkStrokeWidth(settings),
            fill: 'none'
        }),
        optional: (settings: Settings) => <StyleDescriptor>({ // style applied to a link's circle to distinguish mandatory and optional features
            property: node =>
                node.parent!.feature().isGroup ? 'none' : node.feature().getPropertyString('isOptional'),
            yes: {
                stroke: settings.featureDiagram.treeLayout.link.stroke,
                'stroke-width': getLinkStrokeWidth(settings),
                fill: 'white',
                cursor: 'pointer'
            },
            no: {
                stroke: settings.featureDiagram.treeLayout.link.stroke,
                'stroke-width': getLinkStrokeWidth(settings),
                fill: settings.featureDiagram.treeLayout.link.stroke,
                cursor: 'pointer'
            },
            none: { // children of OR and ALT groups do not have a circle
                r: 0,
                fill: 'white'
            }
        })
    }
};