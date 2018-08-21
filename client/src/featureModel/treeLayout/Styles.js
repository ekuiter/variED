// adapted from FeatureIDE/plugins/de.ovgu.featureide.fm.ui/src/de/ovgu/featureide/fm/ui/editors/featuremodel/GUIDefaults.java
const Styles = {
    node: {
        abstract: { // style applied to a node's rectangle to distinguish abstract and concrete features
            property: 'isAbstract',
            yes: {fill: '#f2f2ff', stroke: '#b6b6bf'},
            no: {fill: '#ccccff', stroke: '#9999bf'}
        },
        hidden: { // style applied to a node's text to distinguish hidden and visible features
            property: 'isHidden',
            yes: {fill: '#676767'}
        },
        arcSegment: { // style applied to a node's arc segment (for ALT groups)
            fill: 'none',
            stroke: '#888',
            'stroke-width': '1.5px'
        },
        arcSlice: { // style applied to a node's arc slice (for OR groups)
            fill: '#888'
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
                node.parent.feature().isGroup ? 'none' : node.feature().getPropertyString('isMandatory'),
            yes: {
                stroke: '#888',
                'stroke-width': '1.5px',
                fill: '#888'
            },
            no: {
                stroke: '#888',
                'stroke-width': '1.5px',
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
};

export default Styles;