/**
 * Throttles a function.
 * A throttled function will only be called once in a given time interval.
 * When requested, the function will be called immediately, but is then set up in a way that prevents
 * further function calls for the rest of the time interval.
 * Other than debouncing, the function call is not postponed, but performed at once.
 * @param func function to throttle
 * @param wait minimum time between two function calls
 */
export default function<T extends any[]>(func: (...args: T) => void, wait: number): (this: any, ...args: T) => number | undefined {
    let timer: number | undefined;
    return function(...args) {
        if (typeof timer === 'undefined')
            return timer = window.setTimeout(() => {
                func.apply(this, args);
                timer = undefined;
            }, wait);
        return undefined;
    };
}