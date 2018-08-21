import {getSetting} from '../../Settings';

// estimates the width of a node's rectangle
export function estimateRectWidth(settings, estimatedTextWidth) {
    return estimatedTextWidth +
        2 * getSetting(settings, 'featureModel.treeLayout.node.paddingX') +
        2 * getSetting(settings, 'featureModel.treeLayout.node.strokeWidth');
}

// estimates the height of a node's rectangle
export function estimateRectHeight(settings) {
    return getSetting(settings, 'featureModel.font.size') +
        2 * getSetting(settings, 'featureModel.treeLayout.node.paddingY') +
        2 * getSetting(settings, 'featureModel.treeLayout.node.strokeWidth');
}

// estimates the x coordinate of a node's rectangle left or right side
export function estimateXOffset(settings, sgn, estimatedTextWidth, layout) {
    const nodeSettings = getSetting(settings, 'featureModel.treeLayout.node');
    return sgn * (estimatedTextWidth * (layout === 'vertical' ? 0.5 : sgn === 1 ? 1 : 0) +
        nodeSettings.paddingX + nodeSettings.strokeWidth + nodeSettings.bboxPadding);
}

// estimates the y coordinate of a node's rectangle top or bottom side
export function estimateYOffset(settings, sgn, layout) {
    const nodeSettings = getSetting(settings, 'featureModel.treeLayout.node');
    return sgn === 1
        ? nodeSettings.baselineHeight + nodeSettings.paddingY + nodeSettings.strokeWidth + nodeSettings.bboxPadding
        : (-1) * (getSetting(settings, 'featureModel.font.size') + nodeSettings.paddingY + nodeSettings.strokeWidth + nodeSettings.bboxPadding);
}