import Constants from '../../Constants';
import {
    arcSegmentPath,
    arcSlicePath,
    cartesianToAngle,
    drawCircle
} from '../../helpers/svgUtils';
import {getNodeType, isNonEmptyGroupNode} from '../../server/featureModel';

class AbstractTreeLink {
    constructor(getCurrentParentCoordinate, getPreviousParentCoordinate, treeNode) {
        this.getCurrentParentCoordinate = getCurrentParentCoordinate;
        this.getPreviousParentCoordinate = getPreviousParentCoordinate;
        this.treeNode = treeNode;
    }

    nodeX(node) {
        return this.treeNode.x(node);
    }

    nodeY(node) {
        return this.treeNode.y(node);
    }

    estimateTextWidth(node) {
        return this.treeNode.estimateTextWidth(node);
    }

    getRectInfo() {
        return this.treeNode.rectInfo;
    }

    groupAnchor(node) {
        throw new Error("abstract method not implemented");
    }

    sweepFlag() {
        throw new Error("abstract method not implemented");
    }

    emptyArcPath(relativeGroupAnchor, arcPathFn) {
        throw new Error("abstract method not implemented");
    }

    arcPath(...args) {
        throw new Error("abstract method not implemented");
    }

    drawLink(...args) {
        throw new Error("abstract method not implemented");
    }

    from(node, phase) {
        throw new Error("abstract method not implemented");
    }

    to(node, phase) {
        throw new Error("abstract method not implemented");
    }

    drawGroup(arcSegment, arcSlice) {
        const drawArc = (node, arcPathFn, checkType = () => true) =>
            node.attr('opacity', d => isNonEmptyGroupNode(d) && checkType(d) ? 1 : 0)
                .attr('d', d => {
                    const relativeGroupAnchor = this.groupAnchor(d),
                        absoluteGroupAnchor = {
                            x: relativeGroupAnchor.x + this.nodeX(d),
                            y: relativeGroupAnchor.y + this.nodeY(d)
                        };
                    if (!isNonEmptyGroupNode(d) || !checkType(d))
                        return this.emptyArcPath(relativeGroupAnchor, arcPathFn);
                    const firstChild = d.children[0],
                        lastChild = d.children[d.children.length - 1],
                        startAngle = cartesianToAngle(absoluteGroupAnchor, this.from(firstChild)),
                        endAngle = cartesianToAngle(absoluteGroupAnchor, this.from(lastChild));
                    return this.arcPath(arcPathFn, relativeGroupAnchor, Constants.treeLayout.link.groupRadius,
                        startAngle, endAngle, this.sweepFlag());
                });
        drawArc(arcSegment, arcSegmentPath);
        drawArc(arcSlice, arcSlicePath, d => getNodeType(d) === Constants.server.featureModelTags.OR);
    }

    enter(link, zIndex) {
        const linkEnter = link.append('g')
                .attr('class', 'link')
                .attr('opacity', 0),
            from = d => this.from(d, 'enter'),
            to = d => this.to(d, 'enter');

        if (zIndex === 'inBack')
            linkEnter
                .call(this.drawLink, null, {klass: 'line', from, to, style: Constants.treeLayout.style.link.line});

        if (zIndex === 'inFront')
            linkEnter.call(drawCircle, null, {center: from, radius: 0, style: Constants.treeLayout.style.link.mandatory});

        return linkEnter;
    }

    update(link, zIndex) {
        const from = d => this.from(d, 'update'),
            to = d => this.to(d, 'update'),
            radius = Constants.treeLayout.link.circleRadius;
        link.attr('opacity', 1);

        if (zIndex === 'inBack')
            link.call(this.drawLink, '.line', {from, to});

        if (zIndex === 'inFront')
            link.call(drawCircle, 'circle', {center: from, radius, style: Constants.treeLayout.style.link.mandatory});
    }

    exit(link, zIndex) {
        const from = d => this.from(d, 'exit'),
            to = d => this.to(d, 'exit');
        link.attr('opacity', 0).remove();

        if (zIndex === 'inBack')
            link.call(this.drawLink, '.line', {from, to});

        if (zIndex === 'inFront')
            link.call(drawCircle, 'circle', {center: from, radius: 0});
    }
}

export default AbstractTreeLink;
