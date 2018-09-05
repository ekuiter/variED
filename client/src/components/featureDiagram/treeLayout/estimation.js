import {getSetting} from '../../../store/settings';
import {layoutTypes} from '../../../types';
import measureTextWidth from '../../../helpers/measureTextWidth';
import {getName} from '../../../server/FeatureModel';
import constants from '../../../constants';

// estimates the width of a node's rectangle
export function estimateRectWidth(settings, estimatedTextWidth) {
    return estimatedTextWidth +
        2 * getSetting(settings, 'featureDiagram.treeLayout.node.paddingX') +
        2 * getSetting(settings, 'featureDiagram.treeLayout.node.strokeWidth');
}

// estimates the height of a node's rectangle
export function estimateRectHeight(settings) {
    return getSetting(settings, 'featureDiagram.font.size') +
        2 * getSetting(settings, 'featureDiagram.treeLayout.node.paddingY') +
        2 * getSetting(settings, 'featureDiagram.treeLayout.node.strokeWidth');
}

// estimates the x coordinate of a node's rectangle left or right side
export function estimateXOffset(settings, sgn, estimatedTextWidth, layout) {
    const nodeSettings = getSetting(settings, 'featureDiagram.treeLayout.node');
    return sgn * (estimatedTextWidth * (layout === layoutTypes.verticalTree ? 0.5 : sgn === 1 ? 1 : 0) +
        nodeSettings.paddingX + nodeSettings.strokeWidth + nodeSettings.bboxPadding);
}

// estimated distance of the font's baseline and descent in px
function baselineHeight(settings) {
    return getSetting(settings, 'featureDiagram.font.size') * 0.3;
}

// estimates the y coordinate of a node's rectangle top or bottom side
export function estimateYOffset(settings, sgn, _layout) {
    const nodeSettings = getSetting(settings, 'featureDiagram.treeLayout.node');
    return sgn === 1
        ? baselineHeight(settings) + nodeSettings.paddingY + nodeSettings.strokeWidth + nodeSettings.bboxPadding
        : (-1) * (getSetting(settings, 'featureDiagram.font.size') + nodeSettings.paddingY + nodeSettings.strokeWidth + nodeSettings.bboxPadding);
}

// estimates minimum size of the given hierarchy without layouting it
// and proposes features that can be collapsed to reduce the size
export function estimateHierarchySize(nodes, collapsedFeatureNames, featureDiagramLayout,
    {fontFamily, fontSize, widthPadding, rectHeight}) {

    const maxCollapsibleNodes = constants.featureDiagram.autoCollapse.maxCollapsibleNodes(nodes),
        minLayerSizes = [], collapsibleNodesPerLayer = [];
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
            featureDiagramLayout === layoutTypes.verticalTree
                ? measureTextWidth(fontFamily, fontSize, getName(node)) + widthPadding
                : rectHeight;
    });
    
    layerNum++;
    minLayerSizes.sort((a, b) => b.size - a.size);
    let collapsibleNodes = [];
    for (let i = 0; i < layerNum; i++) {
        if (minLayerSizes[i].depth === 0)
            continue;
        collapsibleNodes = collapsibleNodes.concat(collapsibleNodesPerLayer[minLayerSizes[i].depth - 1]);
        break;
    }

    return {
        estimatedSize: minLayerSizes[0].size,
        collapsibleNodes
    };
}