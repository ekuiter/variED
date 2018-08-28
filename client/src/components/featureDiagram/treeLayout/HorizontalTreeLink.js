import AbstractTreeLink from './AbstractTreeLink';
import {getSetting} from '../../../store/settings';
import {attrIfPresent, drawCurve, drawLine} from '../../../helpers/svg';
import {estimateRectWidth} from './estimation';

function leftSideX(x, rectInfo) {
    return x + rectInfo.x;
}

function rightSide(settings, x, rectInfo, estimatedTextWidth) {
    return x + rectInfo.x + estimateRectWidth(settings, estimatedTextWidth);
}

function sideY(y, rectInfo) {
    return y + rectInfo.y + rectInfo.height / 2;
}

export default class extends AbstractTreeLink {
    groupAnchor(node) {
        const rectInfo = this.getRectInfo();
        return {x: rightSide(this.settings, 0, rectInfo, this.estimateTextWidth(node)), y: sideY(0, rectInfo)};
    }

    collapseAnchor(node) {
        return {
            x: rightSide(this.settings, 0, this.getRectInfo(), this.estimateTextWidth(node)) +
                getSetting(this.settings, 'featureDiagram.font.size') / 2
        };
    }

    groupRadius() {
        return Math.floor(this.getRectInfo().height / 2);
    }

    sweepFlag() {
        return false;
    }

    emptyArcPath(relativeGroupAnchor, arcPathFn) {
        return arcPathFn(relativeGroupAnchor, 0, -90, 90, this.sweepFlag());
    }

    arcPath(arcPathFn, center, radius, _startAngle, _endAngle, sweepFlag) {
        return arcPathFn(center, radius, -90, 90, sweepFlag);
    }

    drawLink = (selection, selector, {klass, from, to, style}) => {
        const settings = this.settings,
            g = (!selector ? selection.append('g') : selection.select(selector))
                .call(attrIfPresent, 'class', klass),
            _to = d => {
                const {x, y} = to(d);
                return {
                    x: Math.max(x, from(d).x - getSetting(settings, 'featureDiagram.treeLayout.horizontal.layerMargin')),
                    y
                };
            };
        drawLine(g, !selector ? null : 'path.innerLine', {
            klass: 'innerLine', from: _to, to, style,
            fn: innerLine => innerLine.attr('opacity', d => d.parent.children[0] === d ? 1 : 0)
        });
        drawCurve(g, !selector ? null : 'path.curve', {
            klass: 'curve', from, to: _to, style,
            inset: getSetting(this.settings, 'featureDiagram.treeLayout.horizontal.layerMargin') / 2
        });
        return g;
    };

    from(node, _phase) {
        return {
            x: leftSideX(this.nodeX(node), this.getRectInfo()),
            y: sideY(this.nodeY(node), this.getRectInfo())
        };
    }

    to(node, phase) {
        const rectInfo = this.getRectInfo();
        return phase === 'enter' ? {
            x: rightSide(this.settings, this.getPreviousParentCoordinate(node, 'x'), rectInfo, this.estimateTextWidth(node.parent)),
            y: sideY(this.getPreviousParentCoordinate(node, 'y'), rectInfo)
        } : phase === 'update' ? {
            x: rightSide(this.settings, this.nodeX(node.parent), rectInfo, this.estimateTextWidth(node.parent)),
            y: sideY(this.nodeY(node.parent), rectInfo)
        } : {
            x: rightSide(this.settings, this.getCurrentParentCoordinate(node, 'x'), rectInfo, this.estimateTextWidth(node.parent)),
            y: sideY(this.getCurrentParentCoordinate(node, 'y'), rectInfo)
        };
    }
}