import AbstractTreeNode from './AbstractTreeNode';
import Constants from '../../Constants';

class VerticalTreeNode extends AbstractTreeNode {
    x(node) {
        return node.x;
    }

    y(node) {
        return node.y * Constants.treeLayout.vertical.layerHeight;
    }

    getTextStyle() {
        return Constants.treeLayout.style.vertical.text;
    }
};

export default VerticalTreeNode;