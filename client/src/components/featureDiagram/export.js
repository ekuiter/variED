import {layoutTypes, formatTypes} from '../../types';
import FeatureModel from '../../server/FeatureModel';
import {saveAs} from 'file-saver';

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
        svg,
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
    return import('canvg')
        .then(canvg => canvg(canvas, svgData(scale).string))
        .then(() => new Promise(resolve => canvas.toBlob(resolve, 'image/png')));
}

function exportJpg({scale = 1, quality = 0.8}) {
    const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        {string, width, height} = svgData(scale);
    canvas.setAttribute('width', width);
    canvas.setAttribute('height', height);
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    return import('canvg')
        .then(() => ctx.drawSvg(string, 0, 0, width, height))
        .then(() => new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality)));
}

function exportPdf(_options, fileName) {
    const {svg, width, height} = svgData();
    Promise.all([import('svg2pdf.js'), import('jspdf-yworks')])
        .then(([svg2pdf, jsPDF]) => {
            const pdf = new jsPDF({
                orientation: 'landscape',
                unit: 'pt',
                format: [width, height]
            });
            try {
                svg2pdf(svg, pdf, {
                    xOffset: 0,
                    yOffset: 0,
                    scale: 1
                });
                pdf.save(fileName);
            } catch (e) {
                console.warn('PDF export failed - choose Arial as font and try again');
            }
        });
}

const exportMap = {
    [layoutTypes.verticalTree]: {
        [formatTypes.svg]: exportSvg,
        [formatTypes.png]: exportPng,
        [formatTypes.jpg]: exportJpg,
        [formatTypes.pdf]: exportPdf
    },
    [layoutTypes.horizontalTree]: {
        [formatTypes.svg]: exportSvg,
        [formatTypes.png]: exportPng,
        [formatTypes.jpg]: exportJpg,
        [formatTypes.pdf]: exportPdf
    }
};

export function canExport(featureDiagramLayout, format) {
    return !!exportMap[featureDiagramLayout][format];
}

export function doExport(featureDiagramLayout, format, options) {
    const fileName = `featureModel-${new Date().toLocaleDateString()}.${format}`,
        promise = exportMap[featureDiagramLayout][format](options, fileName);
    if (promise)
        promise.then(blob => saveAs(blob, fileName));
}