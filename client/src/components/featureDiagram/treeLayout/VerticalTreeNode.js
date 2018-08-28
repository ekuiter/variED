import AbstractTreeNode from './AbstractTreeNode';
import {getSetting} from '../../../store/settings';

export default class extends AbstractTreeNode {
    x(node) {
        return node.x;
    }

    y(node) {
        return node.y * getSetting(this.settings, 'featureDiagram.treeLayout.vertical.layerHeight');
    }

    getTextStyle() {
        return {'text-anchor': 'middle'};
    }
}