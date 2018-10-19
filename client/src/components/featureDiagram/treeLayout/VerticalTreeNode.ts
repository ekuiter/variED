/**
 * Nodes for the vertical tree layout.
 */

import AbstractTreeNode from './AbstractTreeNode';
import {FeatureModelNode} from '../../../types';
import {StyleDescriptor} from '../../../helpers/svg';

export default class extends AbstractTreeNode {
    x(node: FeatureModelNode): number {
        return node.x;
    }

    y(node: FeatureModelNode): number {
        return node.y * this.settings.featureDiagram.treeLayout.vertical.layerHeight;
    }

    getTextStyle(): StyleDescriptor {
        return {'text-anchor': 'middle'};
    }
}