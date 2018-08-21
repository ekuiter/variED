import memoize from './memoize';

export default memoize((fontFamily, fontSize, text) => {
    const context = document.createElement('canvas').getContext('2d');
    context.font = `${fontSize}px '${fontFamily}'`;
    return context.measureText(text).width;
});