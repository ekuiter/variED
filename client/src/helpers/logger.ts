const logger = {
    log(...args: any[]): void {
        console.log(...args);
    },

    warn(...args: any[]): void {
        console.warn(...args);
    }
};

export default logger;