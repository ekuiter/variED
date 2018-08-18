import 'd3-selection-multi';
import Constants from '../../Constants';
import measureTextWidth from '../../helpers/measureTextWidth';
import {addStyle, appendCross, translateTransform} from '../../helpers/svgUtils';

function widenBbox({x, y, width, height}, paddingX, paddingY) {
    return {x: x - paddingX, y: y - paddingY, width: width + 2 * paddingX, height: height + 2 * paddingY};
}

function makeRect(textBbox) {
    return widenBbox(
        textBbox,
        Constants.treeLayout.node.paddingX + Constants.treeLayout.node.strokeWidth,
        Constants.treeLayout.node.paddingY + Constants.treeLayout.node.strokeWidth);
}

function makeText(selection, isGettingRectInfo, textStyle) {
    if (isGettingRectInfo) {
        let rectInfo = null;
        selection.append('text')
            .text('some text used to determine rect y and height')
            .each(function() {
                rectInfo = makeRect(this.getBBox());
            }).remove();
        return rectInfo;
    } else {
        const bboxes = [];
        selection.append('text')
            .text(d => d.feature().name)
            .call(addStyle, textStyle, Constants.treeLayout.style.node.hidden)
            .each(function() {
                bboxes.push(this.getBBox());
            });
        return bboxes;
    }
}

class AbstractTreeNode {
    constructor(debug, setActiveNode) {
        this.debug = debug;
        this.setActiveNode = setActiveNode;
    }

    x(node) {
        throw new Error("abstract method not implemented");
    }

    y(node) {
        throw new Error("abstract method not implemented");
    }

    getTextStyle() {
        throw new Error("abstract method not implemented");
    }

    createSvgHook(g) {
        this.rectInfo = makeText(g, true, this.getTextStyle());
    }

    enter(node) {
        const nodeEnter = node.append('g')
                .attr('class', 'node')
                .call(translateTransform, d => this.x(d), d => this.y(d))
                .attr('opacity', 0)
                .on('click', this.setActiveNode),
            bboxes = makeText(nodeEnter, false, this.getTextStyle());

        let i = 0;
        nodeEnter.insert('rect', 'text')
            .attrs(() => makeRect(bboxes[i++]))
            .call(addStyle, Constants.treeLayout.style.node.abstract);

        const arcSegment = nodeEnter.insert('path', 'rect')
                .attr('class', 'arcSegment')
                .call(addStyle, Constants.treeLayout.style.node.arcSegment),
            arcSlice = nodeEnter.insert('path', 'rect')
                .attr('class', 'arcSlice')
                .call(addStyle, Constants.treeLayout.style.node.arcSlice);
        this.treeLink.drawGroup(arcSegment, arcSlice);

        if (this.debug)
            appendCross(nodeEnter);

        return nodeEnter;
    }

    update(node) {
        node.call(translateTransform, d => this.x(d), d => this.y(d))
            .attr('opacity', 1);
        this.treeLink.drawGroup(node.select('path.arcSegment'), node.select('path.arcSlice'));
    }

    exit(node) {
        node.attr('opacity', 0).remove();
    }

    estimateTextWidth(node) {
        return measureTextWidth(node.feature().name);
    }
}

export default AbstractTreeNode;
