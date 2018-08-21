import AbstractTreeNode from './AbstractTreeNode';
import {estimateRectWidth} from './estimateUtils';
import {getSetting} from '../../settings';

class HorizontalTreeNode extends AbstractTreeNode {
    x(node) {
        let x = 0, parent = node;
        while ((parent = parent.parent))
            x += estimateRectWidth(this.settings, this.getWidestTextOnLayer(parent)) +
                getSetting(this.settings, 'featureDiagram.treeLayout.horizontal.layerMargin');
        return x;
    }

    y(node) {
        return node.x;
    }

    getTextStyle() {
        return {'text-anchor': 'start'};
    }
}

export default HorizontalTreeNode;