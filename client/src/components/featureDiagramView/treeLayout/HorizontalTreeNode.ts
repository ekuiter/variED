/**
 * Nodes for the horizontal tree layout.
 */

import AbstractTreeNode from './AbstractTreeNode';
import {estimateRectWidth} from './estimation';
import {GraphicalFeatureNode} from '../../../modeling/types';
import {StyleDescriptor} from '../../../helpers/svg';

export default class extends AbstractTreeNode {
    x(node: GraphicalFeatureNode): number {
        let x = 0, parent: GraphicalFeatureNode | null = node;
        while ((parent = parent.parent))
            x += estimateRectWidth(this.settings, this.getWidestTextOnLayer(parent)) +
                this.settings.featureDiagram.treeLayout.horizontal.layerMargin;
        return x;
    }

    y(node: GraphicalFeatureNode): number {
        return node.x;
    }

    getTextStyle(): StyleDescriptor {
        return {'text-anchor': 'start'};
    }
}