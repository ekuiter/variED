/**
 * Implementation of feature diagram export algorithms.
 */

import FeatureModel from '../../server/FeatureModel';
import {saveAs} from 'file-saver';
import {importSvg2PdfJs, importJspdfYworks, importCanvg} from '../../imports';
import {FeatureDiagramLayoutType, FormatType, FormatOptions} from '../../types';

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

function exportPng({scale = 1}: FormatOptions): BlobPromise {
    const canvas = document.createElement('canvas');
    return importCanvg()
        .then(canvg => (canvg as any)(canvas, svgData(scale).string))
        .then(() => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png')));
}

function exportJpg({scale = 1, quality = 0.8}: FormatOptions): BlobPromise {
    const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d')!,
        {string, width, height} = svgData(scale);
    canvas.setAttribute('width', width.toString());
    canvas.setAttribute('height', height.toString());
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    return importCanvg()
        .then(() => (ctx as any).drawSvg(string, 0, 0, width, height))
        .then(() => new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality)));
}

function exportPdf({}, fileName: string): BlobPromise {
    const {svg, width, height} = svgData();
    // @ts-ignore: there are no type declarations for these modules
    Promise.all([importSvg2PdfJs(), importJspdfYworks()])
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

const exportMap: {
    [x in FeatureDiagramLayoutType]: {
        [x in FormatType]: (options: FormatOptions, fileName: string) => BlobPromise
    }
} = {
    [FeatureDiagramLayoutType.verticalTree]: {
        [FormatType.svg]: exportSvg,
        [FormatType.png]: exportPng,
        [FormatType.jpg]: exportJpg,
        [FormatType.pdf]: exportPdf
    },
    [FeatureDiagramLayoutType.horizontalTree]: {
        [FormatType.svg]: exportSvg,
        [FormatType.png]: exportPng,
        [FormatType.jpg]: exportJpg,
        [FormatType.pdf]: exportPdf
    }
};

export function canExport(featureDiagramLayout: FeatureDiagramLayoutType, format: FormatType): boolean {
    return !!exportMap[featureDiagramLayout][format];
}

export function doExport(featureDiagramLayout: FeatureDiagramLayoutType, format: FormatType, options: FormatOptions): void {
    const fileName = `featureModel-${new Date().toLocaleDateString()}.${format}`,
        promise: BlobPromise = exportMap[featureDiagramLayout][format](options, fileName);
    promise.then(blob => blob && saveAs(blob, fileName));
}