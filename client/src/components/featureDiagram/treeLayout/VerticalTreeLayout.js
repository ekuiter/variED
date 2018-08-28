import AbstractTreeLayout from './AbstractTreeLayout';
import {getSetting} from '../../../store/settings';
import VerticalTreeLink from './VerticalTreeLink';
import VerticalTreeNode from './VerticalTreeNode';
import {estimateXOffset, estimateYOffset} from './estimation';
import {layoutTypes} from '../../../types';

export default class extends AbstractTreeLayout {
    constructor(props) {
        super(props, VerticalTreeNode, VerticalTreeLink);
    }

    estimateXOffset(sgn, estimatedTextWidth) {
        return estimateXOffset(this.props.settings, sgn, estimatedTextWidth, layoutTypes.verticalTree);
    }

    estimateYOffset(sgn) {
        return estimateYOffset(this.props.settings, sgn, layoutTypes.verticalTree);
    }

    getSeparationFn(estimateTextWidth) {
        return (a, b) =>
            (estimateTextWidth(a) + estimateTextWidth(b)) / 2 +
            2 * getSetting(this.props.settings, 'featureDiagram.treeLayout.node.paddingX') +
            getSetting(this.props.settings, 'featureDiagram.treeLayout.vertical.marginX');
    }
}