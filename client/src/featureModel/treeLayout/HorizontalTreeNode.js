import AbstractTreeNode from './AbstractTreeNode';
import Styles from './Styles';
import {estimateRectWidth} from './estimateUtils';
import {getSetting} from '../../Settings';

class HorizontalTreeNode extends AbstractTreeNode {
    x(node) {
        let x = 0, parent = node;
        while ((parent = parent.parent))
            x += estimateRectWidth(this.settings, this.getWidestTextOnLayer(parent)) +
                getSetting(this.settings, 'featureModel.treeLayout.horizontal.layerMargin');
        return x;
    }

    y(node) {
        return node.x;
    }

    getTextStyle() {
        return Styles.horizontal.text;
    }
}

export default HorizontalTreeNode;