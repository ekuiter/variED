export default function<T extends any[]>(func: (...args: T) => void, wait: number): (this: any, ...args: T) => number {
    let timer: number;
    return function(...args) {
        clearTimeout(timer);
        return timer = window.setTimeout(() => func.apply(this, args), wait);
    };
}