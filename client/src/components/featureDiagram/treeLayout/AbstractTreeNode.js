import 'd3-selection-multi';
import {event as d3Event} from 'd3-selection';
import {getSetting} from '../../../store/settings';
import measureTextWidth from '../../../helpers/measureTextWidth';
import {addStyle, appendCross, translateTransform} from '../../../helpers/svg';
import styles from './styles';
import {isCommand} from '../../../helpers/withKeys';
import {overlayTypes} from '../../../types';

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
    constructor(settings, isSelectMultipleFeatures, setActiveNode, onShowOverlay) {
        this.settings = settings;
        this.isSelectMultipleFeatures = isSelectMultipleFeatures;
        this.setActiveNode = setActiveNode;
        this.onShowOverlay = onShowOverlay;
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
        const nodeEnter = node.append('g')
                .attr('class', 'node')
                .attr('data-feature', d => d.feature().name)
                .call(translateTransform, d => this.x(d), d => this.y(d))
                .attr('opacity', 0),
            rectAndText = nodeEnter.append('g')
                .attr('class', 'rectAndText')
                .on('click', d => this.setActiveNode(isCommand(d3Event) ? 'select' : overlayTypes.featureCallout, d))
                .on('contextmenu', d => {
                    d3Event.preventDefault();
                    this.setActiveNode(isCommand(d3Event) ? 'select' : overlayTypes.featureContextualMenu, d);
                })
                .on('dblclick', d => {
                    if (!this.isSelectMultipleFeatures)
                        this.onShowOverlay(overlayTypes.featurePanel, {featureName: d.feature().name});
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
        node.select('g.rectAndText rect').call(addStyle, styles.node.abstract(this.settings));
        node.select('g.rectAndText text').call(addStyle, styles.node.hidden(this.settings));
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
