/**
 * Memoizes a function by caching its results.
 * This assumes that the memoized function is pure and deterministic, i.e., only depends on its
 * arguments and always returns the same results for the same arguments.
 * This works best when the function takes primitive data types such as strings or numbers.
 * (Complex data types require a key function to be supplied.)
 * @param fn    function to memoize
 * @param keyFn function that serializes the memoized function's arguments (JSON.stringify by default)
 */
export default function<T extends any[], R>(fn: (...args: T) => R, keyFn?: (...args: T) => string): (...args: T) => R {
    let cache = {};
    return (...args) => {
        let key = keyFn ? keyFn(...args) : JSON.stringify(args);
        return cache[key] = cache[key] || fn(...args);
    };
}