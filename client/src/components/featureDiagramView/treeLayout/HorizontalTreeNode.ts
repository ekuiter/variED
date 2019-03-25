/**
 * Nodes for the horizontal tree layout.
 */

import AbstractTreeNode from './AbstractTreeNode';
import {estimateRectWidth} from './estimation';
import {FeatureNode} from '../../../modeling/types';
import {StyleDescriptor} from '../../../helpers/svg';

export default class extends AbstractTreeNode {
    x(node: FeatureNode): number {
        let x = 0, parent: FeatureNode | null = node;
        while ((parent = parent.parent))
            x += estimateRectWidth(this.settings, this.getWidestTextOnLayer(parent)) +
                this.settings.featureDiagram.treeLayout.horizontal.layerMargin;
        return x;
    }

    y(node: FeatureNode): number {
        return node.x;
    }

    getTextStyle(): StyleDescriptor {
        return {'text-anchor': 'start'};
    }
}