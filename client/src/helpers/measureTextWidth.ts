import memoize from './memoize';

/**
 * Measures the width of a text rendered in a particular font family and size.
 * As this is an expensive, but pure function, we can memoize it.
 * @param fontFamily font family to measure, does NOT accept a CSS-like list of font families
 * @param fontSize   font size to measure in px
 * @param text       the text to measure
 */
export default <(fontFamily: string, fontSize: number, text: string) => number>memoize((fontFamily, fontSize, text) => {
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = `${fontSize}px '${fontFamily}'`;
    return context.measureText(text).width;
});