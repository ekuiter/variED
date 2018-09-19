export default <T extends any[]>(fn: (...args: T) => void): (...args: T) => number =>
    (...args) => window.setTimeout(() => fn(...args), 0);