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