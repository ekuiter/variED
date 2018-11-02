/**
 * Nodes for the vertical tree layout.
 */

import AbstractTreeNode from './AbstractTreeNode';
import {StyleDescriptor} from '../../../helpers/svg';
import {GraphicalFeatureModelNode} from '../../../modeling/types';

export default class extends AbstractTreeNode {
    x(node: GraphicalFeatureModelNode): number {
        return node.x;
    }

    y(node: GraphicalFeatureModelNode): number {
        return node.y * this.settings.featureDiagram.treeLayout.vertical.layerHeight;
    }

    getTextStyle(): StyleDescriptor {
        return {'text-anchor': 'middle'};
    }
}