let detailedLogs = false;

const mapStateToPropsCache = {},
    
    truncate = (string: string, length = 80): string =>
        string.substr(0, length - 1) + (string.length > length ? '…' : ''),
    
    shouldSerialize = (value: any): boolean =>
        value && (
            value !== Object(value) ||
            value.constructor.name === 'Object' ||
            (Array.isArray(value) && value.reduce((acc, val) => acc && shouldSerialize(val), true))),

    stringify = (value: any): string =>
        truncate(shouldSerialize(value) ? JSON.stringify(value) : String(value)),

    tagged = (logFn: (...args: any[]) => void) => ({tag, color = 'white', backgroundColor = 'slategrey'}:
        {tag: string, color?: string, backgroundColor?: string}, ...args: any[]): void =>
        logFn(`%c${tag.toUpperCase()}`,
            `color: ${color}; background-color: ${backgroundColor}; padding: 2px 5px; font-weight: bold`,
            ...args),

    colored = (logFn: (...args: any[]) => void) => ({color = 'inherit', backgroundColor = 'inherit'}:
        {color?: string, backgroundColor?: string}, ...args: any[]): void =>
        logFn(`%c${args.join(' ')}`, `color: ${color}; background-color: ${backgroundColor}; padding: 1px 3px`),

    log = console.log.bind(console),
    warn = console.warn.bind(console);

const logger = {
    log,
    warn,
    logTagged: tagged(log),
    warnTagged: tagged(warn),
    logColored: colored(log),
    warnColored: colored(warn),

    mapStateToProps(containerName: string, mapStateToProps: (state: object) => object) {
        return (state: object): object => {
            const newProps = mapStateToProps(state);
            if (detailedLogs && mapStateToPropsCache[containerName] &&
                Object.entries(newProps).some(([key, value]) => value !== mapStateToPropsCache[containerName][key])) {
                console.group(containerName);
                Object.entries(newProps).forEach(([key, value]) => {
                    const oldValue = mapStateToPropsCache[containerName][key];
                    if (value !== oldValue) {
                        console.groupCollapsed(key);
                        logger.logColored({color: 'black', backgroundColor: '#faa'}, stringify(oldValue));
                        logger.logColored({color: 'black', backgroundColor: '#afa'}, stringify(value));
                        console.groupEnd();
                    }
                });
                console.groupEnd();
            }
            return mapStateToPropsCache[containerName] = newProps;
        };
    }
};

declare var window: any;
window.app = window.app || {};
window.app.toggleDetailedLogs = () => detailedLogs = !detailedLogs;

export default logger;