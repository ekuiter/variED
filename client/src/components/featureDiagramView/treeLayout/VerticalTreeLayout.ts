/**
 * Horizontal tree layout for feature diagrams.
 */

import AbstractTreeLayout, {AbstractTreeLayoutProps} from './AbstractTreeLayout';
import VerticalTreeLink from './VerticalTreeLink';
import VerticalTreeNode from './VerticalTreeNode';
import {estimateXOffset, estimateYOffset} from './estimation';
import {FeatureDiagramLayoutType} from '../../../types';
import {FeatureNode} from '../../../modeling/types';

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

    getSeparationFn(estimateTextWidth: (node: FeatureNode) => number): (a: FeatureNode, b: FeatureNode) => number {
        return (a, b) =>
            (estimateTextWidth(a) + estimateTextWidth(b)) / 2 +
            2 * this.props.settings.featureDiagram.treeLayout.node.paddingX +
            this.props.settings.featureDiagram.treeLayout.vertical.marginX;
    }
}