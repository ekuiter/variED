import {layoutTypes, formatTypes} from '../../types';
import FeatureModel from '../../server/FeatureModel';
import {saveAs} from 'file-saver';
import canvg from 'canvg';

function svgString(scale = 1) {
    const svg = FeatureModel.getSvg().cloneNode(true),
        estimatedBbox = JSON.parse(svg.getAttribute('data-estimated-bbox')),
        estimatedBboxWidth = estimatedBbox[1][0] - estimatedBbox[0][0],
        estimatedBboxHeight = estimatedBbox[1][1] - estimatedBbox[0][1];
    svg.removeAttribute('data-estimated-bbox');
    svg.setAttribute('width', estimatedBboxWidth * scale);
    svg.setAttribute('height', estimatedBboxHeight * scale);
    svg.querySelector('g').setAttribute('transform',
        `translate(${-estimatedBbox[0][0] * scale},${-estimatedBbox[0][1] * scale}) scale(${scale})`);
    return new XMLSerializer().serializeToString(svg);
}

function exportSvg() {
    return Promise.resolve(new Blob([svgString()], {type: 'image/svg+xml;charset=utf-8'}));
}

function exportPng(scale) {
    const canvas = document.createElement('canvas');
    canvg(canvas, svgString(scale));
    return new Promise(resolve => canvas.toBlob(resolve));
}

const exportMap = {
    [layoutTypes.verticalTree]: {
        [formatTypes.svg]: exportSvg,
        [formatTypes.png]: exportPng
    },
    [layoutTypes.horizontalTree]: {
        [formatTypes.svg]: exportSvg,
        [formatTypes.png]: exportPng
    }
};

export function canExport(featureDiagramLayout, format) {
    return !!exportMap[featureDiagramLayout][format];
}

export function doExport(featureDiagramLayout, format, ...args) {
    const promise = exportMap[featureDiagramLayout][format](...args);
    if (promise)
        promise.then(blob =>
            saveAs(blob, `featureModel-${new Date().toLocaleDateString()}.${format}`));
}