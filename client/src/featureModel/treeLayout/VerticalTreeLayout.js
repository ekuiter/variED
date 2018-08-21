import AbstractTreeLayout from './AbstractTreeLayout';
import {getSetting} from '../../Settings';
import VerticalTreeLink from './VerticalTreeLink';
import VerticalTreeNode from './VerticalTreeNode';
import {estimateXOffset, estimateYOffset} from './estimateUtils';

class VerticalTreeLayout extends AbstractTreeLayout {
    constructor(props) {
        super(props, 'vertical', VerticalTreeNode, VerticalTreeLink);
    }

    estimateXOffset(sgn, estimatedTextWidth) {
        return estimateXOffset(this.props.settings, sgn, estimatedTextWidth, 'vertical');
    }

    estimateYOffset(sgn) {
        return estimateYOffset(this.props.settings, sgn, 'vertical');
    }

    getSeparationFn(estimateTextWidth) {
        return (a, b) =>
            (estimateTextWidth(a) + estimateTextWidth(b)) / 2 +
            2 * getSetting(this.props.settings, 'featureModel.treeLayout.node.paddingX') +
            getSetting(this.props.settings, 'featureModel.treeLayout.vertical.marginX');
    }
}

export default VerticalTreeLayout;