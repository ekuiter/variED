import {layoutTypes} from '../../types';
import FeatureModel from '../../server/FeatureModel';
import {saveAs} from 'file-saver';
import canvg from 'canvg';

function svgString() {
    const svg = FeatureModel.getSvg().cloneNode(true),
        estimatedBbox = JSON.parse(svg.getAttribute('data-estimated-bbox')),
        estimatedBboxWidth = estimatedBbox[1][0] - estimatedBbox[0][0],
        estimatedBboxHeight = estimatedBbox[1][1] - estimatedBbox[0][1];
    svg.removeAttribute('data-estimated-bbox');
    svg.setAttribute('width', estimatedBboxWidth);
    svg.setAttribute('height', estimatedBboxHeight);
    svg.querySelector('g').setAttribute('transform',
        `translate(${-estimatedBbox[0][0]},${-estimatedBbox[0][1]})`);
    return new XMLSerializer().serializeToString(svg);
}

function svg() {
    return Promise.resolve(new Blob([svgString()], {type: 'image/svg+xml;charset=utf-8'}));
}

function png() {
    const canvas = document.createElement('canvas');
    canvg(canvas, svgString());
    return new Promise(resolve => canvas.toBlob(resolve));
}

const exportMap = {
    [layoutTypes.verticalTree]: {svg, png},
    [layoutTypes.horizontalTree]: {svg, png}
};

export function canExport(featureDiagramLayout, type) {
    return !!exportMap[featureDiagramLayout][type];
}

export function doExport(featureDiagramLayout, type, ...args) {
    const promise = exportMap[featureDiagramLayout][type](...args);
    if (promise)
        promise.then(blob =>
            saveAs(blob, `featureModel-${new Date().toLocaleDateString()}.${type}`));
}