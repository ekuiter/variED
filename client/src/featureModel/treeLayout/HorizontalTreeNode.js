import AbstractTreeNode from './AbstractTreeNode';
import Constants from '../../Constants';

class HorizontalTreeNode extends AbstractTreeNode {
    x(node) {
        let x = 0, parent = node;
        while ((parent = parent.parent))
            x += Constants.treeLayout.node.estimateRectWidth(this.getWidestTextOnLayer(parent)) +
                Constants.treeLayout.horizontal.layerMargin;
        return x;
    }

    y(node) {
        return node.x;
    }

    getTextStyle() {
        return Constants.treeLayout.style.horizontal.text;
    }
}

export default HorizontalTreeNode;