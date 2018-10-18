/**
 * Dynamic imports.
 * Because some features of the application are only used on-demand and the involved
 * libraries have a large footprint, dynamic import() is used for these libraries.
 * All the imports are exported from this JavaScript file because Jest doesn't like
 * import statements in TypeScript files for some reason…
 */

export const importCanvg = () => import('canvg');
export const importSvg2PdfJs = () => import('svg2pdf.js');
export const importJspdfYworks = () => import('jspdf-yworks');