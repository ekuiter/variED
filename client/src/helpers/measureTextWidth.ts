import memoize from './memoize';

export default <(fontFamily: string, fontSize: string, text: string) => number>memoize((fontFamily, fontSize, text) => {
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = `${fontSize}px '${fontFamily}'`;
    return context.measureText(text).width;
});