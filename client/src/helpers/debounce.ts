/**
 * Debounces a function.
 * A debounced function will only be called once in a given time interval.
 * The function will only be called after an idle time (where no function call was requested) has been passed,
 * so debouncing is a way of postponing a function call to the end of a number of function call requests.
 * @param func function to debounce
 * @param wait minimum time between two function calls
 */
export default function<T extends any[]>(func: (...args: T) => void, wait: number): (this: any, ...args: T) => number {
    let timer: number;
    return function(...args) {
        clearTimeout(timer);
        return timer = window.setTimeout(() => func.apply(this, args), wait);
    };
}