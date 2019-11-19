/**
 * Implementation of feature diagram export algorithms.
 */

import FeatureModel from '../../modeling/FeatureModel';
import {saveAs} from 'file-saver';
import {importSvg2PdfJs, importJspdfYworks, importCanvg} from '../../imports';
import {FeatureDiagramLayoutType, FormatType, FormatOptions, ArtifactPath, ClientFormatType, ServerFormatType} from '../../types';
import logger from '../../helpers/logger';
import {getCurrentArtifactPath} from '../../router';

type BlobPromise = Promise<Blob | null>;
const BlobPromise = Promise; // see https://github.com/Microsoft/TypeScript/issues/12776

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

async function exportSvg(): BlobPromise {
    return new Blob([svgData().string], {type: 'image/svg+xml;charset=utf-8'});
}

async function exportPng({scale = 1}: FormatOptions): BlobPromise {
    const canvas = document.createElement('canvas');
    const canvg = await importCanvg();
    (canvg as any)(canvas, svgData(scale).string);
    return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
}

async function exportJpg({scale = 1, quality = 0.8}: FormatOptions): BlobPromise {
    const canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d')!,
        {string, width, height} = svgData(scale);
    canvas.setAttribute('width', width.toString());
    canvas.setAttribute('height', height.toString());
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, width, height);
    await importCanvg();
    (ctx as any).drawSvg(string, 0, 0, width, height);
    return new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
}

async function exportPdf({}, fileName: string): BlobPromise {
    const {svg, width, height} = svgData();
    const [svg2pdf, jsPDF] = await Promise.all([importSvg2PdfJs(), importJspdfYworks()]);
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
        logger.warn(() => 'PDF export failed - choose Arial as font and try again');
    }
    return null;
}

const exportServer = (format: ServerFormatType) => async (): BlobPromise => {
    const store = (window as any).app && (window as any).app.store;
    if (!store)
        throw 'store not accessible, can not export';
    const actions = (window as any).app && (window as any).app.actions;
    if (!actions)
        throw 'actions not accessible, can not export';
    const artifactPath: ArtifactPath | undefined = getCurrentArtifactPath(store.getState().collaborativeSessions);
    if (!artifactPath)
        throw 'no current artifact path';
    store.dispatch(actions.server.exportArtifact({artifactPath, format}));
    return null;
};

const exportMap: {
    [x in FeatureDiagramLayoutType]: {
        [x in FormatType]: (options: FormatOptions, fileName: string) => BlobPromise
    }
} = {
    [FeatureDiagramLayoutType.verticalTree]: {
        [ClientFormatType.svg]: exportSvg,
        [ClientFormatType.png]: exportPng,
        [ClientFormatType.jpg]: exportJpg,
        [ClientFormatType.pdf]: exportPdf,
        [ServerFormatType.XmlFeatureModelFormat]: exportServer(ServerFormatType.XmlFeatureModelFormat),
        [ServerFormatType.DIMACSFormat]: exportServer(ServerFormatType.DIMACSFormat),
        [ServerFormatType.SXFMFormat]: exportServer(ServerFormatType.SXFMFormat),
        [ServerFormatType.GuidslFormat]: exportServer(ServerFormatType.GuidslFormat),
        [ServerFormatType.ConquererFMWriter]: exportServer(ServerFormatType.ConquererFMWriter),
        [ServerFormatType.CNFFormat]: exportServer(ServerFormatType.CNFFormat)
    },
    [FeatureDiagramLayoutType.horizontalTree]: {
        [ClientFormatType.svg]: exportSvg,
        [ClientFormatType.png]: exportPng,
        [ClientFormatType.jpg]: exportJpg,
        [ClientFormatType.pdf]: exportPdf,
        [ServerFormatType.XmlFeatureModelFormat]: exportServer(ServerFormatType.XmlFeatureModelFormat),
        [ServerFormatType.DIMACSFormat]: exportServer(ServerFormatType.DIMACSFormat),
        [ServerFormatType.SXFMFormat]: exportServer(ServerFormatType.SXFMFormat),
        [ServerFormatType.GuidslFormat]: exportServer(ServerFormatType.GuidslFormat),
        [ServerFormatType.ConquererFMWriter]: exportServer(ServerFormatType.ConquererFMWriter),
        [ServerFormatType.CNFFormat]: exportServer(ServerFormatType.CNFFormat)
    }
};

const extensionMap: {
    [x in FormatType]: string
} = {
    [ClientFormatType.svg]: 'svg',
    [ClientFormatType.png]: 'png',
    [ClientFormatType.jpg]: 'jpg',
    [ClientFormatType.pdf]: 'pdf',
    [ServerFormatType.XmlFeatureModelFormat]: 'xml',
    [ServerFormatType.DIMACSFormat]: 'dimacs',
    [ServerFormatType.SXFMFormat]: 'xml',
    [ServerFormatType.GuidslFormat]: 'm',
    [ServerFormatType.ConquererFMWriter]: 'xml',
    [ServerFormatType.CNFFormat]: 'txt'
};

export function getExportFileName(format: FormatType) {
    return `featureModel-${new Date().toLocaleDateString()}.${extensionMap[format]}`;
}

export function canExport(featureDiagramLayout: FeatureDiagramLayoutType, format: FormatType): boolean {
    return !!exportMap[featureDiagramLayout][format];
}

export function doExport(featureDiagramLayout: FeatureDiagramLayoutType, format: FormatType, options: FormatOptions): void {
    const fileName = getExportFileName(format),
        promise: BlobPromise = exportMap[featureDiagramLayout][format](options, fileName);
    promise.then(blob => blob && saveAs(blob, fileName));
}