import Constants from '../Constants';

export function getNodeName(node) {
    return node.data[Constants.featureModelTags.NAME];
}

export function getNodeType(node) {
    return node.data[Constants.featureModelTags.TYPE];
}

export function getNodeProperty(node, key) {
    if (typeof key === 'function')
        return key(node);
    return node.data[key] ? 'yes' : 'no';
}

export function isGroupNode(node) {
    return getNodeType(node) === Constants.featureModelTags.OR || getNodeType(node) === Constants.featureModelTags.ALT;
}

export function isNonEmptyGroupNode(node) {
    return node.children && node.children.length > 0 && isGroupNode(node);
}