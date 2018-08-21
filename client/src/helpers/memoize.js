export default function(fn) {
    let cache = {};
    return (...args) => {
        let stringifiedArgs = JSON.stringify(args);
        return cache[stringifiedArgs] = cache[stringifiedArgs] || fn(...args);
    };
};