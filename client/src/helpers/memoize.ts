export default function<T extends any[], R>(fn: (...args: T) => R, keyFn?: (...args: T) => string): (...args: T) => R {
    let cache = {};
    return (...args) => {
        let key = keyFn ? keyFn(...args) : JSON.stringify(args);
        return cache[key] = cache[key] || fn(...args);
    };
}