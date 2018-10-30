/**
 * Returns a promise that is resolved after a specified time.
 * @param time time to wait in milliseconds
 */
export function wait(time = 10): Promise<void> {
    return time === 0
        ? Promise.resolve()
        : new Promise(resolve => window.setTimeout(resolve, time));
}