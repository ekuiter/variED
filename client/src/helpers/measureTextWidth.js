function memoize(fn) {
    let cache = {};
    return (...args) => {
        let stringifiedArgs = JSON.stringify(args);
        return cache[stringifiedArgs] = cache[stringifiedArgs] || fn(...args);
    };
}

export default memoize((fontFamily, fontSize, text) => {
    const context = document.createElement('canvas').getContext('2d');
    context.font = `${fontSize}px ${fontFamily}`;
    return context.measureText(text).width;
});