/**
 * Links (or edges) for the horizontal tree layout.
 */

import AbstractTreeLink from './AbstractTreeLink';
import {Settings} from '../../../store/settings';
import {attrIfPresent, drawCurve, drawLine, ArcPathFunction, Style} from '../../../helpers/svg';
import {estimateRectWidth} from './estimation';
import {Point, D3Selection, Rect} from '../../../types';
import {GraphicalFeatureModelNode, NodePointFunction} from '../../../modeling/types';

function leftSideX(x: number, rectInfo: Rect): number {
    return x + rectInfo.x;
}

function rightSide(settings: Settings, x: number, rectInfo: Rect, estimatedTextWidth: number): number {
    return x + rectInfo.x + estimateRectWidth(settings, estimatedTextWidth);
}

function sideY(y: number, rectInfo: Rect): number {
    return y + rectInfo.y + rectInfo.height / 2;
}

export default class extends AbstractTreeLink {
    groupAnchor(node: GraphicalFeatureModelNode): Point {
        const rectInfo = this.getRectInfo();
        return {x: rightSide(this.settings, 0, rectInfo, this.estimateTextWidth(node)), y: sideY(0, rectInfo)};
    }

    collapseAnchor(node: GraphicalFeatureModelNode): Partial<Point> {
        return {
            x: rightSide(this.settings, 0, this.getRectInfo(), this.estimateTextWidth(node)) +
                this.settings.featureDiagram.font.size / 2
        };
    }

    groupRadius(): number {
        return Math.floor(this.getRectInfo().height / 2);
    }

    sweepFlag(): boolean {
        return false;
    }

    emptyArcPath(relativeGroupAnchor: Point, arcPathFn: ArcPathFunction): string {
        return arcPathFn(relativeGroupAnchor, 0, -90, 90, this.sweepFlag());
    }

    arcPath(arcPathFn: ArcPathFunction, center: Point, radius: number, _startAngle: number, _endAngle: number, sweepFlag?: boolean): string {
        return arcPathFn(center, radius, -90, 90, sweepFlag);
    }

    drawLink = (selection: D3Selection, selector: string | undefined, {klass, from, to, style}: {klass?: string, from: NodePointFunction, to: NodePointFunction, style?: Style}): void => {
        const settings = this.settings,
            g = (!selector ? selection.append('g') : selection.select(selector))
                .call(attrIfPresent, 'class', klass),
            _to = (d: GraphicalFeatureModelNode) => {
                const {x, y} = to(d);
                return {
                    x: Math.max(x, from(d).x - settings.featureDiagram.treeLayout.horizontal.layerMargin),
                    y
                };
            };
        drawLine(g, !selector ? undefined : 'path.innerLine', {
            klass: 'innerLine', from: _to, to, style,
            fn: innerLine => innerLine.attr('opacity', (d: GraphicalFeatureModelNode) => d.parent!.children![0] === d ? 1 : 0)
        });
        drawCurve(g, !selector ? undefined : 'path.curve', {
            klass: 'curve', from, to: _to, style,
            inset: this.settings.featureDiagram.treeLayout.horizontal.layerMargin / 2
        });
    };

    from(node: GraphicalFeatureModelNode, _phase?: string): Point {
        return {
            x: leftSideX(this.nodeX(node), this.getRectInfo()),
            y: sideY(this.nodeY(node), this.getRectInfo())
        };
    }

    to(node: GraphicalFeatureModelNode, phase?: string): Point {
        const rectInfo = this.getRectInfo();
        const parent = node.parent!; // we only draw links for non-root nodes, so node always has a parent
        return phase === 'enter' ? {
            x: rightSide(this.settings, this.getPreviousParentCoordinate(node, 'x'), rectInfo, this.estimateTextWidth(parent)),
            y: sideY(this.getPreviousParentCoordinate(node, 'y'), rectInfo)
        } : phase === 'update' ? {
            x: rightSide(this.settings, this.nodeX(parent), rectInfo, this.estimateTextWidth(parent)),
            y: sideY(this.nodeY(parent), rectInfo)
        } : {
            x: rightSide(this.settings, this.getCurrentParentCoordinate(node, 'x'), rectInfo, this.estimateTextWidth(parent)),
            y: sideY(this.getCurrentParentCoordinate(node, 'y'), rectInfo)
        };
    }
}