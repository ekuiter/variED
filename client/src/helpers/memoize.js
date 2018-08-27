export default function(fn, keyFn) {
    let cache = {};
    return (...args) => {
        let key = keyFn ? keyFn(...args) : JSON.stringify(args);
        return cache[key] = cache[key] || fn(...args);
    };
};