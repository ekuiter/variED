/**
 * Nodes for the abstract tree layout.
 */

import 'd3-selection-multi';
import {event as d3Event} from 'd3-selection';
import {Settings} from '../../../store/settings';
import measureTextWidth from '../../../helpers/measureTextWidth';
import {addStyle, appendCross, drawCircle, translateTransform, StyleDescriptor, Style} from '../../../helpers/svg';
import styles from './styles';
import {isCommand} from '../../../helpers/withKeys';
import {OverlayType, Rect, D3Selection, Point} from '../../../types';
import {OnShowOverlayFunction, OnExpandFeaturesFunction, OnToggleFeatureGroupFunction} from '../../../store/types';
import {GraphicalFeatureModelNode} from '../../../modeling/types';

declare class AbstractTreeLink {
    collapseAnchor(_node: GraphicalFeatureModelNode): Partial<Point>;
    drawGroup(arcSegment: D3Selection, arcSlice: D3Selection, arcClick: D3Selection): void;
}

function widenBbox({x, y, width, height}: Rect, paddingX: number, paddingY: number): Rect {
    return {x: x - paddingX, y: y - paddingY, width: width + 2 * paddingX, height: height + 2 * paddingY};
}

function makeRect(settings: Settings, textBbox: Rect): Rect {
    const nodeSettings = settings.featureDiagram.treeLayout.node;
    return widenBbox(
        textBbox,
        nodeSettings.paddingX + nodeSettings.strokeWidth,
        nodeSettings.paddingY + nodeSettings.strokeWidth);
}

function addFontStyle(selection: D3Selection, settings: Settings): void {
    selection.attrs({
        'font-family': settings.featureDiagram.font.family,
        'font-size': settings.featureDiagram.font.size
    });
}

function makeText(settings: Settings, selection: D3Selection, isGettingRectInfo: boolean, textStyle: StyleDescriptor): Rect | Rect[] | undefined {
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
    getWidestTextOnLayer: (node: GraphicalFeatureModelNode) => number;

    constructor(public settings: Settings, public isSelectMultipleFeatures: boolean, public debug: boolean,
        public setActiveNode: (overlay: OverlayType | 'select', activeNode: GraphicalFeatureModelNode) => void,
        public onShowOverlay: OnShowOverlayFunction, public onExpandFeatures: OnExpandFeaturesFunction,
        public onToggleFeatureGroup: OnToggleFeatureGroupFunction) {}

    x(_node: GraphicalFeatureModelNode): number {
        throw new Error('abstract method not implemented');
    }

    y(_node: GraphicalFeatureModelNode): number {
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
                .attr('data-feature', (d: GraphicalFeatureModelNode) => d.feature().name)
                .call(translateTransform, (d: GraphicalFeatureModelNode) => this.x(d), (d: GraphicalFeatureModelNode) => this.y(d))
                .attr('opacity', 0),
            rectAndText = nodeEnter.append('g')
                .attr('class', 'rectAndText')
                .on('click', (d: GraphicalFeatureModelNode) => this.setActiveNode(isCommand(d3Event) ? 'select' : OverlayType.featureCallout, d))
                .on('contextmenu', (d: GraphicalFeatureModelNode) => {
                    d3Event.preventDefault();
                    this.setActiveNode(isCommand(d3Event) ? 'select' : OverlayType.featureContextualMenu, d);
                })
                .on('dblclick', (d: GraphicalFeatureModelNode) => {
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
                .on('dblclick', (d: GraphicalFeatureModelNode) => this.onToggleFeatureGroup({feature: d.feature()}));
        this.treeLink.drawGroup(arcSegment, arcSlice, arcClick);

        const expandFeature = (d: GraphicalFeatureModelNode) => d.feature().isCollapsed && this.onExpandFeatures({featureNames: [d.feature().name]});
        i = 0;
        bboxes = [];
        nodeEnter.insert('text', 'path.arcClick')
            .call(addFontStyle, this.settings)
            .attr('fill', this.settings.featureDiagram.treeLayout.node.visibleFill)
            .attr('class', 'collapse')
            .attr('text-anchor', 'middle')
            .attrs((d: GraphicalFeatureModelNode) => this.treeLink.collapseAnchor(d) as Style)
            .call(addStyle, styles.node.collapseText(this.settings))
            .text((d: GraphicalFeatureModelNode) => d.feature().getNumberOfFeaturesBelow())
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

        if (this.debug)
            appendCross(nodeEnter);

        return nodeEnter;
    }

    update(node: D3Selection): void {
        node.call(translateTransform, (d: GraphicalFeatureModelNode) => this.x(d), (d: GraphicalFeatureModelNode) => this.y(d))
            .attr('opacity', 1);
        node.select('g.rectAndText rect').call(addStyle, styles.node.abstract(this.settings));
        node.select('g.rectAndText text').call(addStyle, styles.node.hidden(this.settings));
        node.select('text.collapse')
            .text((d: GraphicalFeatureModelNode) => d.feature().getNumberOfFeaturesBelow())
            .attr('cursor', (d: GraphicalFeatureModelNode) => d.feature().isCollapsed ? 'pointer' : null)
            .attr('opacity', (d: GraphicalFeatureModelNode) => d.feature().isCollapsed ? 1 : 0);
        node.select('circle').attr('r', (d: GraphicalFeatureModelNode) =>
            d.feature().isCollapsed ? this.settings.featureDiagram.font.size : 0);
        this.treeLink.drawGroup(node.select('path.arcSegment'), node.select('path.arcSlice'), node.select('path.arcClick'));
    }

    exit(node: D3Selection): void {
        node.attr('opacity', 0).remove();
    }

    estimateTextWidth(node: GraphicalFeatureModelNode): number {
        return measureTextWidth(
            this.settings.featureDiagram.font.family,
            this.settings.featureDiagram.font.size,
            node.feature().name);
    }
}