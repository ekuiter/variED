import AbstractTreeLayout from './AbstractTreeLayout';
import HorizontalTreeLink from './HorizontalTreeLink';
import HorizontalTreeNode from './HorizontalTreeNode';
import {getSetting} from '../../settings';
import {estimateRectHeight, estimateXOffset, estimateYOffset} from './estimateUtils';

class HorizontalTreeLayout extends AbstractTreeLayout {
    widestTextOnLayer = {};

    constructor(props) {
        super(props, 'horizontal', HorizontalTreeNode, HorizontalTreeLink);
        this.treeNode.getWidestTextOnLayer = this.getWidestTextOnLayer.bind(this);
    }

    estimateXOffset(sgn, estimatedTextWidth) {
        return estimateXOffset(this.props.settings, sgn, estimatedTextWidth, 'horizontal');
    }

    estimateYOffset(sgn) {
        return estimateYOffset(this.props.settings, sgn, 'horizontal');
    }

    getSeparationFn(estimateTextWidth) {
        return () => estimateRectHeight(this.props.settings) +
            getSetting(this.props.settings, 'featureDiagram.treeLayout.horizontal.marginY');
    }

    createLayoutHook(nodes) {
        this.updateWidestTextOnLayer(nodes);
    }

    getWidestTextOnLayer(node) {
        return this.widestTextOnLayer[node.depth];
    }

    updateWidestTextOnLayer(nodes) {
        this.widestTextOnLayer = {};
        nodes.forEach(node => {
            const estimatedTextWidth = this.treeNode.estimateTextWidth(node);
            if (this.widestTextOnLayer.hasOwnProperty(node.depth))
                this.widestTextOnLayer[node.depth] = Math.max(this.widestTextOnLayer[node.depth], estimatedTextWidth);
            else
                this.widestTextOnLayer[node.depth] = estimatedTextWidth;
        });
    }
}

export default HorizontalTreeLayout;