/**
 * Helpers to estimate positions and dimensions of elements in a feature diagram.
 */

import {Settings} from '../../../store/settings';
import {FeatureModelNode, FeatureDiagramLayoutType} from '../../../types';
import measureTextWidth from '../../../helpers/measureTextWidth';
import {getName} from '../../../server/FeatureModel';
import constants from '../../../constants';

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
export function estimateHierarchySize(nodes: FeatureModelNode[], collapsedFeatureNames: string[], featureDiagramLayout: FeatureDiagramLayoutType,
    {fontFamily, fontSize, widthPadding, rectHeight}: {fontFamily: string, fontSize: number, widthPadding: number, rectHeight: number}):
    {estimatedSize: number, collapsibleNodes: FeatureModelNode[]} {

    const maxCollapsibleNodes = constants.featureDiagram.fitToScreen.maxCollapsibleNodes(nodes),
        minLayerSizes: {depth: number, size: number}[] = [], collapsibleNodesPerLayer: FeatureModelNode[][] = [];
    let layerNum = -1;
    
    nodes.forEach(node => {
        if (node.depth > layerNum) {
            layerNum = node.depth;
            minLayerSizes.push({depth: node.depth, size: 0});
            collapsibleNodesPerLayer.push([]);
        }
        if (collapsibleNodesPerLayer[node.depth].length < maxCollapsibleNodes &&
            !collapsedFeatureNames.includes(getName(node)))
            collapsibleNodesPerLayer[node.depth].push(node);
        minLayerSizes[node.depth].size +=
            featureDiagramLayout === FeatureDiagramLayoutType.verticalTree
                ? measureTextWidth(fontFamily, fontSize, getName(node)) + widthPadding
                : rectHeight;
    });
    
    layerNum++;
    minLayerSizes.sort((a, b) => b.size - a.size);
    let collapsibleNodes: FeatureModelNode[] = [];
    for (let i = 0; i < layerNum; i++) {
        if (minLayerSizes[i].depth === 0)
            continue;
        collapsibleNodes = collapsibleNodes.concat(collapsibleNodesPerLayer[minLayerSizes[i].depth - 1]);
        break;
    }

    return {estimatedSize: minLayerSizes[0].size, collapsibleNodes};
}