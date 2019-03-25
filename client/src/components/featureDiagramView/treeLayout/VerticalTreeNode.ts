/**
 * Nodes for the vertical tree layout.
 */

import AbstractTreeNode from './AbstractTreeNode';
import {StyleDescriptor} from '../../../helpers/svg';
import {FeatureNode} from '../../../modeling/types';

export default class extends AbstractTreeNode {
    x(node: FeatureNode): number {
        return node.x;
    }

    y(node: FeatureNode): number {
        return node.y * this.settings.featureDiagram.treeLayout.vertical.layerHeight;
    }

    getTextStyle(): StyleDescriptor {
        return {'text-anchor': 'middle'};
    }
}