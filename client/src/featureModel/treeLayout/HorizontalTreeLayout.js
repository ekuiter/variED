import AbstractTreeLayout from './AbstractTreeLayout';
import HorizontalTreeLink from './HorizontalTreeLink';
import HorizontalTreeNode from './HorizontalTreeNode';
import measureTextWidth from '../../helpers/measureTextWidth';
import Constants from '../../Constants';
import {getNodeName} from '../../server/nodeUtils';

class HorizontalTreeLayout extends AbstractTreeLayout {
    widestTextOnLayer = {};

    constructor(props) {
        super(props, HorizontalTreeNode, HorizontalTreeLink);
        this.treeNode.getWidestTextOnLayer = this.getWidestTextOnLayer.bind(this);
    }

    estimateXOffset(sgn, estimatedTextWidth) {
        return Constants.treeLayout.node.estimateXOffset(sgn, estimatedTextWidth, 'horizontal');
    }

    estimateYOffset(sgn) {
        return Constants.treeLayout.node.estimateYOffset(sgn, 'horizontal');
    }

    getSeparationFn(estimateTextWidth) {
        return () => Constants.treeLayout.node.estimateRectHeight() + Constants.treeLayout.horizontal.marginY;
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
            const estimatedTextWidth = measureTextWidth(getNodeName(node));
            if (this.widestTextOnLayer.hasOwnProperty(node.depth))
                this.widestTextOnLayer[node.depth] = Math.max(this.widestTextOnLayer[node.depth], estimatedTextWidth);
            else
                this.widestTextOnLayer[node.depth] = estimatedTextWidth;
        });
    }
}

export default HorizontalTreeLayout;