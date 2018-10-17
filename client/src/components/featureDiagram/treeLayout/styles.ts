/**
 * Style definitions for the tree layouts.
 * These definitions are intended to be used with the SVG helper addStyle.
 * Adapted from FeatureIDE/plugins/de.ovgu.featureide.fm.ui/src/de/ovgu/featureide/fm/ui/editors/featuremodel/GUIDefaults.java.
 */

import {getSetting} from '../../../store/settings';
import {StyleDescriptor} from 'src/helpers/svg';

function getLinkStrokeWidth(settings: object): string {
    return `${getSetting(settings, 'featureDiagram.treeLayout.link.strokeWidth')}px`;
}

export default {
    node: {
        abstract: (settings: object) => <StyleDescriptor>({ // style applied to a node's rectangle to distinguish abstract and concrete features
            property: 'isAbstract',
            yes: {
                fill: getSetting(settings, 'featureDiagram.treeLayout.node.abstractFill'),
                stroke: getSetting(settings, 'featureDiagram.treeLayout.node.abstractStroke'),
                'stroke-width': getSetting(settings, 'featureDiagram.treeLayout.node.strokeWidth')
            },
            no: {
                fill: getSetting(settings, 'featureDiagram.treeLayout.node.concreteFill'),
                stroke: getSetting(settings, 'featureDiagram.treeLayout.node.concreteStroke'),
                'stroke-width': getSetting(settings, 'featureDiagram.treeLayout.node.strokeWidth')
            }
        }),
        hidden: (settings: object) => ({ // style applied to a node's text to distinguish hidden and visible features
            property: 'isHidden',
            yes: {fill: getSetting(settings, 'featureDiagram.treeLayout.node.hiddenFill')},
            no: {fill: getSetting(settings, 'featureDiagram.treeLayout.node.visibleFill')}
        }),
        arcSegment: (settings: object) => <StyleDescriptor>({ // style applied to a node's arc segment (for ALT groups)
            fill: 'none',
            stroke: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
            'stroke-width': getLinkStrokeWidth(settings)
        }),
        arcSlice: (settings: object) => <StyleDescriptor>({ // style applied to a node's arc slice (for OR groups)
            fill: getSetting(settings, 'featureDiagram.treeLayout.link.stroke')
        }),
        arcClick: (_settings: object) => <StyleDescriptor>({ // style applied to a node's clickable arc
            'fill-opacity': 0,
            cursor: 'pointer'
        }),
        collapseText: (settings: object) => <StyleDescriptor>({
            'font-size': getSetting(settings, 'featureDiagram.font.size') * 0.8
        }),
        collapseCircle: (settings: object) => <StyleDescriptor>({
            fill: 'white',
            stroke: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
            'stroke-width': getLinkStrokeWidth(settings),
            cursor: 'pointer'
        })
    },
    link: {
        line: (settings: object) => <StyleDescriptor>({ // style applied to all links' line paths
            stroke: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
            'stroke-width': getLinkStrokeWidth(settings),
            fill: 'none'
        }),
        mandatory: (settings: object) => <StyleDescriptor>({ // style applied to a link's circle to distinguish mandatory and optional features
            property: node =>
                node.parent!.feature().isGroup ? 'none' : node.feature().getPropertyString('isMandatory'),
            yes: {
                stroke: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
                'stroke-width': getLinkStrokeWidth(settings),
                fill: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
                cursor: 'pointer'
            },
            no: {
                stroke: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
                'stroke-width': getLinkStrokeWidth(settings),
                fill: 'white',
                cursor: 'pointer'
            },
            none: { // children of OR and ALT groups do not have a circle
                r: 0,
                fill: 'white'
            }
        })
    }
};