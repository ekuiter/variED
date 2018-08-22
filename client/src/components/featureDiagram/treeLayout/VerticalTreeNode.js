import AbstractTreeNode from './AbstractTreeNode';
import {getSetting} from '../../../store/settings';

class VerticalTreeNode extends AbstractTreeNode {
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

export default VerticalTreeNode;