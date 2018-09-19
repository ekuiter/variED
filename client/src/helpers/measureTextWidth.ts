import memoize from './memoize';

export default memoize((fontFamily: string, fontSize: string, text: string): number => {
    const context = document.createElement('canvas').getContext('2d')!;
    context.font = `${fontSize}px '${fontFamily}'`;
    return context.measureText(text).width;
});