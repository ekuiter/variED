/**
 * Defers execution of a function to a later point in time.
 * Setting a timeout of 0 gives the JavaScript engine the opportunity to handle
 * other events first. (There are other ways to do this, e.g., setImmediate,
 * but this works fine for our purposes.)
 * @param fn the function to defer
 */
export default <T extends any[]>(fn: (...args: T) => void): (...args: T) => number =>
    (...args) => window.setTimeout(() => fn(...args), 0);