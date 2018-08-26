import AbstractTreeLayout from './AbstractTreeLayout';
import HorizontalTreeLink from './HorizontalTreeLink';
import HorizontalTreeNode from './HorizontalTreeNode';
import {getSetting} from '../../../store/settings';
import {estimateRectHeight, estimateXOffset, estimateYOffset} from './estimation';
import {layoutTypes} from '../../../types';

class HorizontalTreeLayout extends AbstractTreeLayout {
    widestTextOnLayer = {};

    constructor(props) {
        super(props, HorizontalTreeNode, HorizontalTreeLink);
        this.treeNode.getWidestTextOnLayer = this.getWidestTextOnLayer.bind(this);
    }

    estimateXOffset(sgn, estimatedTextWidth) {
        return estimateXOffset(this.props.settings, sgn, estimatedTextWidth, layoutTypes.horizontalTree);
    }

    estimateYOffset(sgn) {
        return estimateYOffset(this.props.settings, sgn, layoutTypes.horizontalTree);
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