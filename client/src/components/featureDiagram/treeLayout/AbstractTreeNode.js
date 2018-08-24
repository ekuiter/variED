import 'd3-selection-multi';
import {event as d3Event, select as d3Select} from 'd3-selection';
import {getSetting} from '../../../store/settings';
import measureTextWidth from '../../../helpers/measureTextWidth';
import {addStyle, appendCross, translateTransform} from '../../../helpers/svg';
import styles from './styles';
import {isCommand} from '../../../helpers/withKeys';

function widenBbox({x, y, width, height}, paddingX, paddingY) {
    return {x: x - paddingX, y: y - paddingY, width: width + 2 * paddingX, height: height + 2 * paddingY};
}

function makeRect(settings, textBbox) {
    const nodeSettings = getSetting(settings, 'featureDiagram.treeLayout.node');
    return widenBbox(
        textBbox,
        nodeSettings.paddingX + nodeSettings.strokeWidth,
        nodeSettings.paddingY + nodeSettings.strokeWidth);
}

function makeText(settings, selection, isGettingRectInfo, textStyle) {
    if (isGettingRectInfo) {
        let rectInfo = null;
        selection.append('text')
            .text('some text used to determine rect y and height')
            .each(function() {
                rectInfo = makeRect(settings, this.getBBox());
            }).remove();
        return rectInfo;
    } else {
        const bboxes = [];
        selection.append('text')
            .text(d => d.feature().name)
            .call(addStyle, textStyle, styles.node.hidden(settings))
            .each(function() {
                bboxes.push(this.getBBox());
            });
        return bboxes;
    }
}

class AbstractTreeNode {
    constructor(settings, isSelectMultipleFeatures, setActiveNode, onShowPanel) {
        this.settings = settings;
        this.isSelectMultipleFeatures = isSelectMultipleFeatures;
        this.setActiveNode = setActiveNode;
        this.onShowPanel = onShowPanel;
    }

    x(node) {
        throw new Error('abstract method not implemented');
    }

    y(node) {
        throw new Error('abstract method not implemented');
    }

    getTextStyle() {
        throw new Error('abstract method not implemented');
    }

    createSvgHook(g) {
        this.rectInfo = makeText(this.settings, g, true, this.getTextStyle());
    }

    enter(node) {
        const self = this,
            nodeEnter = node.append('g')
                .attr('class', 'node')
                .call(translateTransform, d => this.x(d), d => this.y(d))
                .attr('opacity', 0),
            rectAndText = nodeEnter.append('g')
                .attr('class', 'rectAndText')
                .on('mouseover', function() {
                    d3Select(this).attr('class', 'rectAndText active');
                })
                .on('mouseout', function() {
                    d3Select(this).attr('class', 'rectAndText');
                })
                .on('click', function(d) {
                    self.setActiveNode(isCommand(d3Event) ? 'select' : 'callout', d, this);
                })
                .on('contextmenu', function(d) {
                    d3Event.preventDefault();
                    self.setActiveNode(isCommand(d3Event) ? 'select' : 'contextualMenu', d, this);
                })
                .on('dblclick', d => {
                    if (!this.isSelectMultipleFeatures)
                        this.onShowPanel('feature', {featureName: d.feature().name});
                }),
            bboxes = makeText(this.settings, rectAndText, false, this.getTextStyle());

        let i = 0;
        rectAndText.insert('rect', 'text')
            .attrs(() => makeRect(this.settings, bboxes[i++]))
            .call(addStyle, styles.node.abstract(this.settings));

        const arcSegment = nodeEnter.insert('path', 'g.rectAndText')
                .attr('class', 'arcSegment')
                .call(addStyle, styles.node.arcSegment(this.settings)),
            arcSlice = nodeEnter.insert('path', 'g.rectAndText')
                .attr('class', 'arcSlice')
                .call(addStyle, styles.node.arcSlice(this.settings));
        this.treeLink.drawGroup(arcSegment, arcSlice);

        if (getSetting(this.settings, 'featureDiagram.treeLayout.debug'))
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
        return measureTextWidth(
            getSetting(this.settings, 'featureDiagram.font.family'),
            getSetting(this.settings, 'featureDiagram.font.size'),
            node.feature().name);
    }
}

export default AbstractTreeNode;
