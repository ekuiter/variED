/**
 * JavaScript code to detect available availability of a
 * particular font in a browser using JavaScript and CSS.
 * Author : Lalit Patel
 * Website: http://www.lalit.org/lab/javascript-css-font-detect/
 */

import memoize from './memoize';

const baseFonts = ['monospace', 'sans-serif', 'serif'],
    testString = 'mmmmmmmmmmlli',
    testSize = '72px',
    defaultWidth = {},
    defaultHeight = {},
    body = document.getElementsByTagName('body')[0],
    span = document.createElement('span');

span.style.fontSize = testSize;
span.innerHTML = testString;
baseFonts.forEach(baseFont => {
    span.style.fontFamily = baseFont;
    body.appendChild(span);
    defaultWidth[baseFont] = span.offsetWidth;
    defaultHeight[baseFont] = span.offsetHeight;
    body.removeChild(span);
});

/**
 * Returns whether a font is installed on the system.
 * This is an expensive operation, so we memoize its results for further use.
 * We do not expect the system's installed functions to change while the application is running.
 * @param font font family to detect, should NOT be a CSS-like list of font families
 */
export default <(font: string) => boolean>memoize(function(font) {
    let detected = false;
    baseFonts.forEach(baseFont => {
        span.style.fontFamily = `${font},${baseFont}`;
        body.appendChild(span);
        detected = detected || ((span.offsetWidth !== defaultWidth[baseFont] || span.offsetHeight !== defaultHeight[baseFont]));
        body.removeChild(span);
    });
    return detected;
});