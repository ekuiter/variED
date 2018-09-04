import {layoutTypes} from '../../types';
import FeatureModel from '../../server/FeatureModel';
import {saveAs} from 'file-saver';

function svg() {
    const svg = FeatureModel.getSvg(),
        string = new XMLSerializer().serializeToString(svg);
    return new Blob([string], {type: 'image/svg+xml;charset=utf-8'});
}

const exportMap = {
    [layoutTypes.verticalTree]: {svg},
    [layoutTypes.horizontalTree]: {svg}
};

export function canExport(featureDiagramLayout, type) {
    return !!exportMap[featureDiagramLayout][type];
}

export function doExport(featureDiagramLayout, type, ...args) {
    const blob = exportMap[featureDiagramLayout][type](...args);
    saveAs(blob, `featureModel-${new Date().toLocaleDateString()}.${type}`);
}