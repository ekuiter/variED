import AbstractTreeLink from './AbstractTreeLink';
import {drawLine} from '../../../helpers/svgUtils';
import {getSetting} from '../../../store/settings';

function topSide(y, rectInfo) {
    return y + rectInfo.y;
}

function bottomSide(y, rectInfo) {
    return y + rectInfo.y + rectInfo.height;
}

class VerticalTreeLink extends AbstractTreeLink {
    groupAnchor(node) {
        return {x: 0, y: bottomSide(0, this.getRectInfo())};
    }

    groupRadius() {
        return getSetting(this.settings, 'featureDiagram.treeLayout.vertical.groupRadius');
    }

    sweepFlag() {
        return true;
    }

    emptyArcPath(relativeGroupAnchor, arcPathFn) {
        return arcPathFn(relativeGroupAnchor, 0, 0, 180, this.sweepFlag());
    }

    arcPath(arcPathFn, ...args) {
        return arcPathFn(...args);
    }

    drawLink(...args) {
        return drawLine(...args);
    }

    from(node, phase) {
        return {
            x: this.nodeX(node),
            y: topSide(this.nodeY(node), this.getRectInfo())
        };
    }

    to(node, phase) {
        const rectInfo = this.getRectInfo();
        return phase === 'enter' ? {
            x: this.getPreviousParentCoordinate(node, 'x'),
            y: bottomSide(this.getPreviousParentCoordinate(node, 'y'), rectInfo)
        } : phase === 'update' ? {
            x: this.nodeX(node.parent),
            y: bottomSide(this.nodeY(node.parent), rectInfo)
        } : {
            x: this.getCurrentParentCoordinate(node, 'x'),
            y: bottomSide(this.getCurrentParentCoordinate(node, 'y'), rectInfo)
        };
    }
}

export default VerticalTreeLink;