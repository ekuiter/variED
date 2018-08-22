import {getSetting} from '../../settings';

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
    return sgn * (estimatedTextWidth * (layout === 'vertical' ? 0.5 : sgn === 1 ? 1 : 0) +
        nodeSettings.paddingX + nodeSettings.strokeWidth + nodeSettings.bboxPadding);
}

// estimated distance of the font's baseline and descent in px
function baselineHeight(settings) {
    return getSetting(settings, 'featureDiagram.font.size') * 0.3;
}

// estimates the y coordinate of a node's rectangle top or bottom side
export function estimateYOffset(settings, sgn, layout) {
    const nodeSettings = getSetting(settings, 'featureDiagram.treeLayout.node');
    return sgn === 1
        ? baselineHeight(settings) + nodeSettings.paddingY + nodeSettings.strokeWidth + nodeSettings.bboxPadding
        : (-1) * (getSetting(settings, 'featureDiagram.font.size') + nodeSettings.paddingY + nodeSettings.strokeWidth + nodeSettings.bboxPadding);
}