/**
 * Implementation of feature diagram export algorithms.
 * Because these algorithms are only used on-demand (when the user triggers an export) and the
 * involved libraries have a large footprint, dynamic import() is used for these libraries.
 */

import {layoutTypes, formatTypes} from '../../types';
import FeatureModel from '../../server/FeatureModel';
import {saveAs} from 'file-saver';

type BlobPromise = Promise<Blob | null>;

function svgData(scale = 1): {svg: SVGElement, string: string, width: number, height: number} {
    const svg = FeatureModel.getSvg().cloneNode(true) as SVGElement,
        estimatedBbox = JSON.parse(svg.getAttribute('data-estimated-bbox')!),
        estimatedBboxWidth = estimatedBbox[1][0] - estimatedBbox[0][0],
        estimatedBboxHeight = estimatedBbox[1][1] - estimatedBbox[0][1];
    svg.removeAttribute('data-estimated-bbox');
    svg.setAttribute('width', (estimatedBboxWidth * scale).toString());
    svg.setAttribute('height', (estimatedBboxHeight * scale).toString());
    svg.querySelector('g')!.setAttribute('transform',
        `translate(${-estimatedBbox[0][0] * scale},${-estimatedBbox[0][1] * scale}) scale(${scale})`);
    return {
        svg,
        string: new XMLSerializer().serializeToString(svg),
        width: estimatedBboxWidth * scale,
        height: estimatedBboxHeight * scale
    };
}

function exportSvg(): BlobPromise {
    return Promise.resolve(new Blob([svgData().string], {type: 'image/svg+xml;charset=utf-8'}));
}

function exportPng({scale = 1}): BlobPromise {
    const canvas = document.createElement('canvas');
    return import('canvg')
        .then(canvg => (canvg as any)(canvas, svgData(scale).string))
        .then(() => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png')));
}

function exportJpg({scale = 1, quality = 0.8}): BlobPromise {
    const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d')!,
        {string, width, height} = svgData(scale);
    canvas.setAttribute('width', width.toString());
    canvas.setAttribute('height', height.toString());
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    return import('canvg')
        .then(() => (ctx as any).drawSvg(string, 0, 0, width, height))
        .then(() => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality)));
}

function exportPdf({}, fileName: string): BlobPromise {
    const {svg, width, height} = svgData();
    // @ts-ignore: there are no type declarations for these modules
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
    return Promise.resolve(null);
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

export function canExport(featureDiagramLayout: string, format: string): boolean {
    return !!exportMap[featureDiagramLayout][format];
}

export function doExport(featureDiagramLayout: string, format: string, options: object): void {
    const fileName = `featureModel-${new Date().toLocaleDateString()}.${format}`,
        promise: BlobPromise = exportMap[featureDiagramLayout][format](options, fileName);
    promise.then(blob => blob && saveAs(blob, fileName));
}