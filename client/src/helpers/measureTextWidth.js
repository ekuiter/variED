import Constants from '../Constants';

function memoize(fn) {
    let cache = {};
    return (...args) => {
        let stringifiedArgs = JSON.stringify(args);
        return cache[stringifiedArgs] = cache[stringifiedArgs] || fn(...args);
    };
}

export default memoize((text) => {
    const context = document.createElement('canvas').getContext('2d');
    context.font = Constants.font.textMeasure;
    return context.measureText(text).width;
});