import {layoutTypes, formatTypes} from '../../types';
import FeatureModel from '../../server/FeatureModel';
import {saveAs} from 'file-saver';
import canvg from 'canvg';

function svgData(scale = 1) {
    const svg = FeatureModel.getSvg().cloneNode(true),
        estimatedBbox = JSON.parse(svg.getAttribute('data-estimated-bbox')),
        estimatedBboxWidth = estimatedBbox[1][0] - estimatedBbox[0][0],
        estimatedBboxHeight = estimatedBbox[1][1] - estimatedBbox[0][1];
    svg.removeAttribute('data-estimated-bbox');
    svg.setAttribute('width', estimatedBboxWidth * scale);
    svg.setAttribute('height', estimatedBboxHeight * scale);
    svg.querySelector('g').setAttribute('transform',
        `translate(${-estimatedBbox[0][0] * scale},${-estimatedBbox[0][1] * scale}) scale(${scale})`);
    return {
        string: new XMLSerializer().serializeToString(svg),
        width: estimatedBboxWidth * scale,
        height: estimatedBboxHeight * scale
    };
}

function exportSvg() {
    return Promise.resolve(new Blob([svgData().string], {type: 'image/svg+xml;charset=utf-8'}));
}

function exportPng({scale = 1}) {
    const canvas = document.createElement('canvas');
    canvg(canvas, svgData(scale).string);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
}

function exportJpg({scale = 1, quality = 0.8}) {
    const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        {string, width, height} = svgData(scale);
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    ctx.drawSvg(string, 0, 0, width, height);
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
}

const exportMap = {
    [layoutTypes.verticalTree]: {
        [formatTypes.svg]: exportSvg,
        [formatTypes.png]: exportPng,
        [formatTypes.jpg]: exportJpg
    },
    [layoutTypes.horizontalTree]: {
        [formatTypes.svg]: exportSvg,
        [formatTypes.png]: exportPng,
        [formatTypes.jpg]: exportJpg
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