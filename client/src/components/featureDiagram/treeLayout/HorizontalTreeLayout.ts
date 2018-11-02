/**
 * Horizontal tree layout for feature diagrams.
 */

import AbstractTreeLayout, {AbstractTreeLayoutProps} from './AbstractTreeLayout';
import HorizontalTreeLink from './HorizontalTreeLink';
import HorizontalTreeNode from './HorizontalTreeNode';
import {estimateRectHeight, estimateXOffset, estimateYOffset} from './estimation';
import {FeatureDiagramLayoutType} from '../../../types';
import {GraphicalFeatureModelNode} from '../../../modeling/types';

export default class extends AbstractTreeLayout {
    widestTextOnLayer = {};

    constructor(props: AbstractTreeLayoutProps) {
        super(props, HorizontalTreeNode, HorizontalTreeLink);
        this.treeNode.getWidestTextOnLayer = this.getWidestTextOnLayer.bind(this);
    }

    estimateXOffset(sgn: number, estimatedTextWidth: number): number {
        return estimateXOffset(this.props.settings, sgn, estimatedTextWidth, FeatureDiagramLayoutType.horizontalTree);
    }

    estimateYOffset(sgn: number): number {
        return estimateYOffset(this.props.settings, sgn, FeatureDiagramLayoutType.horizontalTree);
    }

    getSeparationFn(_estimateTextWidth: (node: GraphicalFeatureModelNode) => number): (a: GraphicalFeatureModelNode, b: GraphicalFeatureModelNode) => number {
        return () => estimateRectHeight(this.props.settings) +
            this.props.settings.featureDiagram.treeLayout.horizontal.marginY;
    }

    createLayoutHook(nodes: GraphicalFeatureModelNode[]): void {
        this.updateWidestTextOnLayer(nodes);
    }

    getWidestTextOnLayer(node: GraphicalFeatureModelNode): number {
        // This fixes a bug when removing many nodes at once, and the tree no longer
        // has a node of the specified depth. In that case, we just use the node's
        // estimated width to achieve a smooth transition (this only occurs on node exits).
        if (typeof this.widestTextOnLayer[node.depth] === 'undefined')
            return this.treeNode.estimateTextWidth(node);
        return this.widestTextOnLayer[node.depth];
    }

    updateWidestTextOnLayer(nodes: GraphicalFeatureModelNode[]): void {
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