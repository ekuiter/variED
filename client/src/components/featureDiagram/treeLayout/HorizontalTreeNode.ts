/**
 * Nodes for the horizontal tree layout.
 */

import AbstractTreeNode from './AbstractTreeNode';
import {estimateRectWidth} from './estimation';
import {FeatureModelNode} from '../../../types';
import {StyleDescriptor} from '../../../helpers/svg';

export default class extends AbstractTreeNode {
    x(node: FeatureModelNode): number {
        let x = 0, parent: FeatureModelNode | null = node;
        while ((parent = parent.parent))
            x += estimateRectWidth(this.settings, this.getWidestTextOnLayer(parent)) +
                this.settings.featureDiagram.treeLayout.horizontal.layerMargin;
        return x;
    }

    y(node: FeatureModelNode): number {
        return node.x;
    }

    getTextStyle(): StyleDescriptor {
        return {'text-anchor': 'start'};
    }
}