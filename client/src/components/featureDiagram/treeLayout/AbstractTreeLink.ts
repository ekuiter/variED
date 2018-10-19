/**
 * Links (or edges) for the abstract tree layout.
 */

import {Settings} from '../../../store/settings';
import {
    arcSegmentPath,
    arcSlicePath,
    cartesianToAngle,
    drawCircle,
    ArcPathFunction,
    Style
} from '../../../helpers/svg';
import styles from './styles';
import actions from '../../../store/actions';
import AbstractTreeNode from './AbstractTreeNode';
import {FeatureModelNode, Rect, Point, D3Selection, NodePointFunction, NodeCoordinateForAxisFunction, FeatureType} from '../../../types';

export default class {
    constructor(public settings: Settings, public getCurrentParentCoordinate: NodeCoordinateForAxisFunction,
        public getPreviousParentCoordinate: NodeCoordinateForAxisFunction, public treeNode: AbstractTreeNode) {}

    nodeX(node: FeatureModelNode): number {
        return this.treeNode.x(node);
    }

    nodeY(node: FeatureModelNode): number {
        return this.treeNode.y(node);
    }

    estimateTextWidth(node: FeatureModelNode): number {
        return this.treeNode.estimateTextWidth(node);
    }

    getRectInfo(): Rect {
        return this.treeNode.rectInfo;
    }

    groupAnchor(_node: FeatureModelNode): Point {
        throw new Error('abstract method not implemented');
    }

    collapseAnchor(_node: FeatureModelNode): Partial<Point> {
        throw new Error('abstract method not implemented');
    }

    groupRadius(): number {
        throw new Error('abstract method not implemented');
    }

    sweepFlag(): boolean {
        throw new Error('abstract method not implemented');
    }

    emptyArcPath(_relativeGroupAnchor: Point, _arcPathFn: ArcPathFunction): string {
        throw new Error('abstract method not implemented');
    }

    arcPath(_arcPathFn: ArcPathFunction, _center: Point, _radius: number, _startAngle: number, _endAngle: number, _sweepFlag?: boolean): string {
        throw new Error('abstract method not implemented');
    }

    drawLink(_selection: D3Selection, _selector: string | undefined, {klass, from, to, style}: {klass?: string, from: NodePointFunction, to: NodePointFunction, style?: Style}): void {
        throw new Error('abstract method not implemented');
    }

    from(_node: FeatureModelNode, _phase?: string): Point {
        throw new Error('abstract method not implemented');
    }

    to(_node: FeatureModelNode, _phase?: string): Point {
        throw new Error('abstract method not implemented');
    }

    drawGroup(arcSegment: D3Selection, arcSlice: D3Selection, arcClick: D3Selection): void {
        const drawArc = (node: D3Selection, arcPathFn: ArcPathFunction, checkType = (d: FeatureModelNode): boolean | string => true) =>
            node.attr('opacity', (d: FeatureModelNode) => d.feature().isGroup && d.feature().hasChildren && checkType(d) ? 1 : 0)
                .attr('d', (d: FeatureModelNode) => {
                    const relativeGroupAnchor = this.groupAnchor(d),
                        absoluteGroupAnchor = {
                            x: relativeGroupAnchor.x + this.nodeX(d),
                            y: relativeGroupAnchor.y + this.nodeY(d)
                        };
                    if ((checkType(d) !== 'always' && !d.feature().isGroup) || !d.feature().hasChildren || !checkType(d))
                        return this.emptyArcPath(relativeGroupAnchor, arcPathFn);
                    const firstChild = d.children![0],
                        lastChild = d.children![d.children!.length - 1],
                        startAngle = cartesianToAngle(absoluteGroupAnchor, this.from(firstChild)),
                        endAngle = cartesianToAngle(absoluteGroupAnchor, this.from(lastChild));
                    return this.arcPath(arcPathFn, relativeGroupAnchor, this.groupRadius(),
                        startAngle, endAngle, this.sweepFlag());
                });
        drawArc(arcSegment, arcSegmentPath);
        drawArc(arcSlice, arcSlicePath, d => d.feature().type === FeatureType.or);
        drawArc(arcClick, arcSlicePath, () => 'always');
    }

    enter(link: D3Selection, zIndex: string): D3Selection {
        const linkEnter = link.append('g')
                .attr('class', 'link')
                .attr('opacity', 0),
            from = (d: FeatureModelNode) => this.from(d, 'enter'),
            to = (d: FeatureModelNode) => this.to(d, 'enter');

        if (zIndex === 'inBack')
            linkEnter
                .call(this.drawLink, null, {klass: 'line', from, to, style: styles.link.line(this.settings)});

        if (zIndex === 'inFront')
            linkEnter.call(drawCircle, null, {
                center: from,
                radius: 0,
                style: styles.link.mandatory(this.settings),
                fn: (circle: D3Selection) => circle.on('dblclick', d => actions.server.featureDiagram.feature.properties.toggleMandatory(d.feature()))
            });

        return linkEnter;
    }

    update(link: D3Selection, zIndex: string): void {
        const from = (d: FeatureModelNode) => this.from(d, 'update'),
            to = (d: FeatureModelNode) => this.to(d, 'update'),
            radius = this.settings.featureDiagram.treeLayout.link.circleRadius;
        link.attr('opacity', 1);

        if (zIndex === 'inBack')
            link.call(this.drawLink, '.line', {from, to});

        if (zIndex === 'inFront')
            link.call(drawCircle, 'circle', {center: from, radius, style: styles.link.mandatory(this.settings)});
    }

    exit(link: D3Selection, zIndex: string): void {
        const from = (d: FeatureModelNode) => this.from(d, 'exit'),
            to = (d: FeatureModelNode) => this.to(d, 'exit');
        link.attr('opacity', 0).remove();

        if (zIndex === 'inBack')
            link.call(this.drawLink, '.line', {from, to});

        if (zIndex === 'inFront')
            link.call(drawCircle, 'circle', {center: from, radius: 0});
    }
}