/**
 * Links (or edges) for the vertical tree layout.
 */

import AbstractTreeLink from './AbstractTreeLink';
import {drawLine, ArcPathFunction, Style} from '../../../helpers/svg';
import {Rect, Point, FeatureModelNode, D3Selection, NodePointFunction} from '../../../types';

function topSide(y: number, rectInfo: Rect): number {
    return y + rectInfo.y;
}

function bottomSide(y: number, rectInfo: Rect): number {
    return y + rectInfo.y + rectInfo.height;
}

export default class extends AbstractTreeLink {
    groupAnchor(_node: FeatureModelNode): Point {
        return {x: 0, y: bottomSide(0, this.getRectInfo())};
    }

    collapseAnchor(_node: FeatureModelNode): Partial<Point> {
        return {y: bottomSide(0, this.getRectInfo()) + this.settings.featureDiagram.font.size};
    }

    groupRadius(): number {
        return this.settings.featureDiagram.treeLayout.vertical.groupRadius;
    }

    sweepFlag(): boolean {
        return true;
    }

    emptyArcPath(relativeGroupAnchor: Point, arcPathFn: ArcPathFunction): string {
        return arcPathFn(relativeGroupAnchor, 0, 0, 180, this.sweepFlag());
    }

    arcPath(arcPathFn: ArcPathFunction, center: Point, radius: number, startAngle: number, endAngle: number, sweepFlag?: boolean): string {
        return arcPathFn(center, radius, startAngle, endAngle, sweepFlag);
    }

    drawLink(selection: D3Selection, selector: string | undefined, {klass, from, to, style}: {klass?: string, from: NodePointFunction, to: NodePointFunction, style?: Style}): void {
        drawLine(selection, selector, {klass, from, to, style});
    }

    from(node: FeatureModelNode, _phase?: string): Point {
        return {
            x: this.nodeX(node),
            y: topSide(this.nodeY(node), this.getRectInfo())
        };
    }

    to(node: FeatureModelNode, phase?: string): Point {
        const rectInfo = this.getRectInfo();
        const parent = node.parent!; // we only draw links for non-root nodes, so node always has a parent
        return phase === 'enter' ? {
            x: this.getPreviousParentCoordinate(node, 'x'),
            y: bottomSide(this.getPreviousParentCoordinate(node, 'y'), rectInfo)
        } : phase === 'update' ? {
            x: this.nodeX(parent),
            y: bottomSide(this.nodeY(parent), rectInfo)
        } : {
            x: this.getCurrentParentCoordinate(node, 'x'),
            y: bottomSide(this.getCurrentParentCoordinate(node, 'y'), rectInfo)
        };
    }
}