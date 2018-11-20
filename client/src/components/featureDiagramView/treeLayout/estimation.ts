/**
 * Helpers to estimate positions and dimensions of elements in a feature diagram.
 */

import {Settings} from '../../../store/settings';
import {FeatureDiagramLayoutType} from '../../../types';
import measureTextWidth from '../../../helpers/measureTextWidth';
import constants from '../../../constants';
import logger from '../../../helpers/logger';
import {GraphicalFeatureNode} from '../../../modeling/types';

// estimates the width of a node's rectangle
export function estimateRectWidth(settings: Settings, estimatedTextWidth: number): number {
    return estimatedTextWidth +
        2 * settings.featureDiagram.treeLayout.node.paddingX +
        2 * settings.featureDiagram.treeLayout.node.strokeWidth;
}

// estimates the height of a node's rectangle
export function estimateRectHeight(settings: Settings): number {
    return settings.featureDiagram.font.size +
        2 * settings.featureDiagram.treeLayout.node.paddingY +
        2 * settings.featureDiagram.treeLayout.node.strokeWidth;
}

// estimates the x coordinate of a node's rectangle left or right side
export function estimateXOffset(settings: Settings, sgn: number, estimatedTextWidth: number, layout: FeatureDiagramLayoutType): number {
    const nodeSettings = settings.featureDiagram.treeLayout.node;
    return sgn * (estimatedTextWidth * (layout === FeatureDiagramLayoutType.verticalTree ? 0.5 : sgn === 1 ? 1 : 0) +
        nodeSettings.paddingX + nodeSettings.strokeWidth + nodeSettings.bboxPadding);
}

// estimated distance of the font's baseline and descent in px
function baselineHeight(settings: Settings): number {
    return settings.featureDiagram.font.size * 0.3;
}

// estimates the y coordinate of a node's rectangle top or bottom side
export function estimateYOffset(settings: Settings, sgn: number, _layout: FeatureDiagramLayoutType): number {
    const nodeSettings = settings.featureDiagram.treeLayout.node;
    return sgn === 1
        ? baselineHeight(settings) + nodeSettings.paddingY + nodeSettings.strokeWidth + nodeSettings.bboxPadding
        : (-1) * (settings.featureDiagram.font.size + nodeSettings.paddingY + nodeSettings.strokeWidth + nodeSettings.bboxPadding);
}

// estimates minimum size of the given hierarchy without layouting it
// and proposes features that can be collapsed to reduce the size
export function estimateHierarchySize(nodes: GraphicalFeatureNode[], collapsedFeatureUUIDs: string[], featureDiagramLayout: FeatureDiagramLayoutType,
    {fontFamily, fontSize, widthPadding, rectHeight, getUUID, scale}:
    {fontFamily: string, fontSize: number, widthPadding: number, rectHeight: number, getUUID: (node: GraphicalFeatureNode) => string, scale: number}):
    {estimatedSize: number, collapsibleNodes: GraphicalFeatureNode[]} {

    const maxCollapsibleNodes = constants.featureDiagram.fitToScreen.maxCollapsibleNodes(nodes),
        layerSizes: {depth: number, size: number}[] = [], collapsibleNodesPerLayer: GraphicalFeatureNode[][] = [];
    let layerNum = -1;
    logger.infoBeginCollapsed(() => `estimating size for ${nodes.length} feature(s) (${collapsedFeatureUUIDs.length} collapsed), ` +
        `may collapse up to ${maxCollapsibleNodes} feature(s)`);
    const logLayer = (layerNum: number) => layerNum >= 0 && logger.info(() => `layer ${layerSizes[layerNum].depth} ` +
        `has estimated size ${layerSizes[layerNum].size.toFixed(0)}px, may collapse ${JSON.stringify(collapsibleNodesPerLayer[layerNum].map(getUUID))}`);
    
    nodes.forEach(node => {
        if (node.depth > layerNum) {
            logLayer(layerNum);
            layerNum = node.depth;
            layerSizes.push({depth: node.depth, size: 0});
            collapsibleNodesPerLayer.push([]);
        }
        if (collapsibleNodesPerLayer[node.depth].length < maxCollapsibleNodes &&
            !collapsedFeatureUUIDs.includes(getUUID(node)))
            collapsibleNodesPerLayer[node.depth].push(node);
        layerSizes[node.depth].size +=
            (featureDiagramLayout === FeatureDiagramLayoutType.verticalTree
                ? measureTextWidth(fontFamily, fontSize, getUUID(node)) + widthPadding
                : rectHeight) * scale;
    });
    
    logLayer(layerNum);
    layerNum++;
    layerSizes.sort((a, b) => b.size - a.size);
    let collapsibleNodes: GraphicalFeatureNode[] = [];
    for (let i = 0; i < layerNum; i++) {
        if (layerSizes[i].depth <= 1) // do not collapse the root feature
            continue;
        collapsibleNodes = collapsibleNodes.concat(collapsibleNodesPerLayer[layerSizes[i].depth - 1]);
        logger.info(() => `maximum size ${layerSizes[i].size.toFixed(0)}px estimated for layer ${layerSizes[i].depth}, ` +
            `suggest to collapse ${JSON.stringify(collapsibleNodes.map(getUUID))}`);
        break;
    }

    logger.infoEnd();
    return {estimatedSize: layerSizes[0].size, collapsibleNodes};
}