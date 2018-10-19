/**
 * Horizontal tree layout for feature diagrams.
 */

import AbstractTreeLayout, {AbstractTreeLayoutProps} from './AbstractTreeLayout';
import {getSetting} from '../../../store/settings';
import VerticalTreeLink from './VerticalTreeLink';
import VerticalTreeNode from './VerticalTreeNode';
import {estimateXOffset, estimateYOffset} from './estimation';
import {FeatureModelNode, FeatureDiagramLayoutType} from '../../../types';

export default class extends AbstractTreeLayout {
    constructor(props: AbstractTreeLayoutProps) {
        super(props, VerticalTreeNode, VerticalTreeLink);
    }

    estimateXOffset(sgn: number, estimatedTextWidth: number): number {
        return estimateXOffset(this.props.settings, sgn, estimatedTextWidth, FeatureDiagramLayoutType.verticalTree);
    }

    estimateYOffset(sgn: number): number {
        return estimateYOffset(this.props.settings, sgn, FeatureDiagramLayoutType.verticalTree);
    }

    getSeparationFn(estimateTextWidth: (node: FeatureModelNode) => number): (a: FeatureModelNode, b: FeatureModelNode) => number {
        return (a, b) =>
            (estimateTextWidth(a) + estimateTextWidth(b)) / 2 +
            2 * getSetting(this.props.settings, 'featureDiagram.treeLayout.node.paddingX') +
            getSetting(this.props.settings, 'featureDiagram.treeLayout.vertical.marginX');
    }
}