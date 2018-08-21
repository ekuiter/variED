import memoize from './memoize';

/**
 * JavaScript code to detect available availability of a
 * particular font in a browser using JavaScript and CSS.
 * Author : Lalit Patel
 * Website: http://www.lalit.org/lab/javascript-css-font-detect/
 */

const baseFonts = ['monospace', 'sans-serif', 'serif'],
    testString = 'mmmmmmmmmmlli',
    testSize = '72px',
    defaultWidth = {},
    defaultHeight = {},
    body = document.getElementsByTagName("body")[0],
    span = document.createElement("span");

span.style.fontSize = testSize;
span.innerHTML = testString;
baseFonts.forEach(baseFont => {
    span.style.fontFamily = baseFont;
    body.appendChild(span);
    defaultWidth[baseFont] = span.offsetWidth;
    defaultHeight[baseFont] = span.offsetHeight;
    body.removeChild(span);
});

export default memoize(function(font) {
    let detected = false;
    baseFonts.forEach(baseFont => {
        span.style.fontFamily = `${font},${baseFont}`;
        body.appendChild(span);
        detected = detected || ((span.offsetWidth !== defaultWidth[baseFont] || span.offsetHeight !== defaultHeight[baseFont]));
        body.removeChild(span);
    });
    return detected;
});