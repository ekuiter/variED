/**
 * Nodes for the vertical tree layout.
 */

import AbstractTreeNode from './AbstractTreeNode';
import {getSetting} from '../../../store/settings';
import {FeatureModelNode} from '../../../types';
import {StyleDescriptor} from '../../../helpers/svg';

export default class extends AbstractTreeNode {
    x(node: FeatureModelNode): number {
        return node.x;
    }

    y(node: FeatureModelNode): number {
        return node.y * getSetting(this.settings, 'featureDiagram.treeLayout.vertical.layerHeight');
    }

    getTextStyle(): StyleDescriptor {
        return {'text-anchor': 'middle'};
    }
}