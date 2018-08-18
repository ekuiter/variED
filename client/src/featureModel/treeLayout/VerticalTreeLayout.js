import AbstractTreeLayout from './AbstractTreeLayout';
import Constants from '../../Constants';
import VerticalTreeLink from './VerticalTreeLink';
import VerticalTreeNode from './VerticalTreeNode';

class VerticalTreeLayout extends AbstractTreeLayout {
    constructor(props) {
        super(props, 'vertical', VerticalTreeNode, VerticalTreeLink);
    }

    estimateXOffset(sgn, estimatedTextWidth) {
        return Constants.treeLayout.node.estimateXOffset(sgn, estimatedTextWidth, 'vertical');
    }

    estimateYOffset(sgn) {
        return Constants.treeLayout.node.estimateYOffset(sgn, 'vertical');
    }

    getSeparationFn(estimateTextWidth) {
        return (a, b) =>
            (estimateTextWidth(a) + estimateTextWidth(b)) / 2 +
            2 * Constants.treeLayout.node.paddingX +
            Constants.treeLayout.vertical.marginX;
    }
}

export default VerticalTreeLayout;