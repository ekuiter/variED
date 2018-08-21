import AbstractTreeNode from './AbstractTreeNode';
import {getSetting} from '../../Settings';
import Styles from './Styles';

class VerticalTreeNode extends AbstractTreeNode {
    x(node) {
        return node.x;
    }

    y(node) {
        return node.y * getSetting(this.settings, 'featureModel.treeLayout.vertical.layerHeight');
    }

    getTextStyle() {
        return Styles.vertical.text;
    }
};

export default VerticalTreeNode;