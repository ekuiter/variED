import Constants from '../Constants';

export function getStruct(featureModel) {
    const STRUCT = Constants.server.featureModelTags.STRUCT;
    if (!featureModel || !featureModel[STRUCT] || featureModel[STRUCT].length !== 1)
        throw new Error('feature model has no struct');
    return featureModel[STRUCT][0];
}

export function getNodeName(node) {
    return node.data[Constants.server.featureModelTags.NAME];
}

export function getNodeType(node) {
    return node.data[Constants.server.featureModelTags.TYPE];
}

export function getNodeProperty(node, key) {
    if (typeof key === 'function')
        return key(node);
    return node.data[key] ? 'yes' : 'no';
}

export function isGroupNode(node) {
    return getNodeType(node) === Constants.server.featureModelTags.OR || getNodeType(node) === Constants.server.featureModelTags.ALT;
}

export function isNonEmptyGroupNode(node) {
    return node.children && node.children.length > 0 && isGroupNode(node);
}