// adapted from FeatureIDE/plugins/de.ovgu.featureide.fm.ui/src/de/ovgu/featureide/fm/ui/editors/featuremodel/GUIDefaults.java
import {getSetting} from '../../settings';

function getLinkStrokeWidth(settings) {
    return `${getSetting(settings, 'featureDiagram.treeLayout.link.strokeWidth')}px`;
}

const Styles = {
    node: {
        abstract: settings => ({ // style applied to a node's rectangle to distinguish abstract and concrete features
            property: 'isAbstract',
            yes: {
                fill: getSetting(settings, 'featureDiagram.treeLayout.node.abstractFill'),
                stroke: getSetting(settings, 'featureDiagram.treeLayout.node.abstractStroke')
            },
            no: {
                fill: getSetting(settings, 'featureDiagram.treeLayout.node.concreteFill'),
                stroke: getSetting(settings, 'featureDiagram.treeLayout.node.concreteStroke')
            }
        }),
        hidden: settings => ({ // style applied to a node's text to distinguish hidden and visible features
            property: 'isHidden',
            yes: {fill: getSetting(settings, 'featureDiagram.treeLayout.node.hiddenFill')}
        }),
        arcSegment: settings => ({ // style applied to a node's arc segment (for ALT groups)
            fill: 'none',
            stroke: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
            'stroke-width': getLinkStrokeWidth(settings)
        }),
        arcSlice: settings => ({ // style applied to a node's arc slice (for OR groups)
            fill: getSetting(settings, 'featureDiagram.treeLayout.link.stroke')
        })
    },
    link: {
        line: settings => ({ // style applied to all links' line paths
            stroke: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
            'stroke-width': getLinkStrokeWidth(settings),
            fill: 'none'
        }),
        mandatory: settings => ({ // style applied to a link's circle to distinguish mandatory and optional features
            property: () => node =>
                node.parent.feature().isGroup ? 'none' : node.feature().getPropertyString('isMandatory'),
            yes: {
                stroke: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
                'stroke-width': getLinkStrokeWidth(settings),
                fill: getSetting(settings, 'featureDiagram.treeLayout.link.stroke')
            },
            no: {
                stroke: getSetting(settings, 'featureDiagram.treeLayout.link.stroke'),
                'stroke-width': getLinkStrokeWidth(settings),
                fill: 'white'
            },
            none: { // children of OR and ALT groups do not have a circle
                r: 0,
                fill: 'white'
            }
        })
    }
};

export default Styles;