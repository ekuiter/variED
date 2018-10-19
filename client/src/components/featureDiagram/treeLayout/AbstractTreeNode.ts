/**
 * Nodes for the abstract tree layout.
 */

import 'd3-selection-multi';
import {event as d3Event} from 'd3-selection';
import {getSetting} from '../../../store/settings';
import measureTextWidth from '../../../helpers/measureTextWidth';
import {addStyle, appendCross, drawCircle, translateTransform, StyleDescriptor, Style} from '../../../helpers/svg';
import styles from './styles';
import {isCommand} from '../../../helpers/withKeys';
import {OverlayType, Rect, D3Selection, FeatureModelNode} from '../../../types';
import actions from '../../../store/actions';
import AbstractTreeLink from './AbstractTreeLink';
import {OnShowOverlayFunction, OnExpandFeaturesFunction} from 'src/store/types';

function widenBbox({x, y, width, height}: Rect, paddingX: number, paddingY: number): Rect {
    return {x: x - paddingX, y: y - paddingY, width: width + 2 * paddingX, height: height + 2 * paddingY};
}

function makeRect(settings: object, textBbox: Rect): Rect {
    const nodeSettings = getSetting(settings, 'featureDiagram.treeLayout.node');
    return widenBbox(
        textBbox,
        nodeSettings.paddingX + nodeSettings.strokeWidth,
        nodeSettings.paddingY + nodeSettings.strokeWidth);
}

function addFontStyle(selection: D3Selection, settings: object): void {
    selection.attrs({
        'font-family': getSetting(settings, 'featureDiagram.font.family'),
        'font-size': getSetting(settings, 'featureDiagram.font.size')
    });
}

function makeText(settings: object, selection: D3Selection, isGettingRectInfo: boolean, textStyle: StyleDescriptor): Rect | Rect[] | undefined {
    if (isGettingRectInfo) {
        let rectInfo = undefined;
        selection.append('text')
            .call(addFontStyle, settings)
            .text('some text used to determine rect y and height')
            .each(function(this: SVGGraphicsElement) {
                rectInfo = makeRect(settings, this.getBBox());
            }).remove();
        return rectInfo;
    } else {
        const bboxes: Rect[] = [];
        selection.append('text')
            .call(addFontStyle, settings)
            .text(d => d.feature().name)
            .call(addStyle, textStyle, styles.node.hidden(settings))
            .each(function(this: SVGGraphicsElement) {
                bboxes.push(this.getBBox());
            });
        return bboxes;
    }
}

export default class {
    rectInfo: Rect;
    treeLink: AbstractTreeLink;
    getWidestTextOnLayer: (node: FeatureModelNode) => number;

    constructor(public settings: object, public isSelectMultipleFeatures: boolean,
        public setActiveNode: (overlay: OverlayType | 'select', activeNode: FeatureModelNode) => void,
        public onShowOverlay: OnShowOverlayFunction, public onExpandFeatures: OnExpandFeaturesFunction) {}

    x(_node: FeatureModelNode): number {
        throw new Error('abstract method not implemented');
    }

    y(_node: FeatureModelNode): number {
        throw new Error('abstract method not implemented');
    }

    getTextStyle(): StyleDescriptor {
        throw new Error('abstract method not implemented');
    }

    createSvgHook(g: D3Selection): void {
        this.rectInfo = makeText(this.settings, g, true, this.getTextStyle()) as Rect;
    }

    enter(node: D3Selection): D3Selection {
        const nodeEnter = node.append('g')
                .attr('class', 'node')
                .attr('data-feature', (d: FeatureModelNode) => d.feature().name)
                .call(translateTransform, (d: FeatureModelNode) => this.x(d), (d: FeatureModelNode) => this.y(d))
                .attr('opacity', 0),
            rectAndText = nodeEnter.append('g')
                .attr('class', 'rectAndText')
                .on('click', (d: FeatureModelNode) => this.setActiveNode(isCommand(d3Event) ? 'select' : OverlayType.featureCallout, d))
                .on('contextmenu', (d: FeatureModelNode) => {
                    d3Event.preventDefault();
                    this.setActiveNode(isCommand(d3Event) ? 'select' : OverlayType.featureContextualMenu, d);
                })
                .on('dblclick', (d: FeatureModelNode) => {
                    if (!this.isSelectMultipleFeatures)
                        this.onShowOverlay({overlay: OverlayType.featurePanel, overlayProps: {featureName: d.feature().name}});
                });

        let bboxes = makeText(this.settings, rectAndText, false, this.getTextStyle()) as Rect[];

        let i = 0;
        rectAndText.insert('rect', 'text')
            .attrs(() => makeRect(this.settings, bboxes[i++]))
            .call(addStyle, styles.node.abstract(this.settings));

        const arcSegment = nodeEnter.insert('path', 'g.rectAndText')
                .attr('class', 'arcSegment')
                .call(addStyle, styles.node.arcSegment(this.settings)),
            arcSlice = nodeEnter.insert('path', 'g.rectAndText')
                .attr('class', 'arcSlice')
                .call(addStyle, styles.node.arcSlice(this.settings)),
            arcClick = nodeEnter.append('path')
                .attr('class', 'arcClick')
                .call(addStyle, styles.node.arcClick(this.settings))
                .on('dblclick', (d: FeatureModelNode) => actions.server.featureDiagram.feature.properties.toggleGroup({feature: d.feature()}));
        this.treeLink.drawGroup(arcSegment, arcSlice, arcClick);

        const expandFeature = (d: FeatureModelNode) => d.feature().isCollapsed && this.onExpandFeatures({featureNames: [d.feature().name]});
        i = 0;
        bboxes = [];
        nodeEnter.insert('text', 'path.arcClick')
            .call(addFontStyle, this.settings)
            .attr('fill', getSetting(this.settings, 'featureDiagram.treeLayout.node.visibleFill'))
            .attr('class', 'collapse')
            .attr('text-anchor', 'middle')
            .attrs((d: FeatureModelNode) => this.treeLink.collapseAnchor(d) as Style)
            .call(addStyle, styles.node.collapseText(this.settings))
            .text((d: FeatureModelNode) => d.feature().getNumberOfFeaturesBelow())
            .attr('opacity', 0)
            .each(function(this: SVGGraphicsElement) {
                bboxes.push(this.getBBox());
            })
            .on('dblclick', expandFeature);

        nodeEnter.insert('circle', 'text.collapse');
        nodeEnter.call(drawCircle, 'circle', {
            center: () => {
                const bbox = bboxes[i++];
                return {x: bbox.x + bbox.width / 2, y: bbox.y + bbox.height / 2};
            },
            style: styles.node.collapseCircle(this.settings),
            radius: 0,
            fn: (circle: D3Selection) => circle.on('dblclick', expandFeature)
        });

        if (getSetting(this.settings, 'featureDiagram.treeLayout.debug'))
            appendCross(nodeEnter);

        return nodeEnter;
    }

    update(node: D3Selection): void {
        node.call(translateTransform, (d: FeatureModelNode) => this.x(d), (d: FeatureModelNode) => this.y(d))
            .attr('opacity', 1);
        node.select('g.rectAndText rect').call(addStyle, styles.node.abstract(this.settings));
        node.select('g.rectAndText text').call(addStyle, styles.node.hidden(this.settings));
        node.select('text.collapse')
            .text((d: FeatureModelNode) => d.feature().getNumberOfFeaturesBelow())
            .attr('cursor', (d: FeatureModelNode) => d.feature().isCollapsed ? 'pointer' : null)
            .attr('opacity', (d: FeatureModelNode) => d.feature().isCollapsed ? 1 : 0);
        node.select('circle').attr('r', (d: FeatureModelNode) =>
            d.feature().isCollapsed ? getSetting(this.settings, 'featureDiagram.font.size') : 0);
        this.treeLink.drawGroup(node.select('path.arcSegment'), node.select('path.arcSlice'), node.select('path.arcClick'));
    }

    exit(node: D3Selection): void {
        node.attr('opacity', 0).remove();
    }

    estimateTextWidth(node: FeatureModelNode): number {
        return measureTextWidth(
            getSetting(this.settings, 'featureDiagram.font.family'),
            getSetting(this.settings, 'featureDiagram.font.size'),
            node.feature().name);
    }
}