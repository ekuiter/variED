enum LogLevel {none, warn, log, info};
const defaultLogLevel = LogLevel.log;
let logLevel = defaultLogLevel;
type LogEntry = () => any;
type ConsoleFunction = (...args: any[]) => void;

const mapStateToPropsCache = {},
    
    truncate = (string: string, length = 80): string =>
        string.substr(0, length - 1) + (string.length > length ? '…' : ''),
    
    shouldSerialize = (value: any): boolean =>
        value && (
            value !== Object(value) || // may serialize primitive types
            value.constructor.name === 'Object' || // may serialize simple objects (no class instances)
            // may serialize array (if its elements should also be serialized)
            (Array.isArray(value) && value.reduce((acc, val) => acc && shouldSerialize(val), true))),

    stringify = (value: any): string =>
        // stringifies a value by serializing it or calling .toString() for complex (e.g., circular) objects
        truncate(shouldSerialize(value) ? JSON.stringify(value) : String(value)),

    taggedWrapper = (consoleFn: ConsoleFunction, minimumLogLevel: LogLevel) => ({tag, color = 'white', backgroundColor = 'slategrey'}:
        {tag: string, color?: string, backgroundColor?: string}, logEntry: LogEntry): void => {
        if (logLevel >= minimumLogLevel && logEntry)
            consoleFn(`%c${tag.toUpperCase()}`,
                `color: ${color}; background-color: ${backgroundColor}; padding: 2px 5px; font-weight: bold`,
                logEntry());
    },

    coloredWrapper = (consoleFn: ConsoleFunction, minimumLogLevel: LogLevel) => ({color = 'inherit', backgroundColor = 'inherit'}:
        {color?: string, backgroundColor?: string}, logEntry: LogEntry): void => {
        if (logLevel >= minimumLogLevel && logEntry)
            consoleFn(`%c${logEntry()}`, `color: ${color}; background-color: ${backgroundColor}; padding: 1px 3px`);
    },

    wrapper = (consoleFn: ConsoleFunction, minimumLogLevel: LogLevel) => (logEntry?: LogEntry): void => {
        if (logLevel >= minimumLogLevel)
            consoleFn(logEntry ? logEntry() : undefined);
    },

    consoleWarn = console.warn.bind(console),
    consoleLog = console.log.bind(console),
    consoleInfo = console.info.bind(console);

const logger = {
    warn: wrapper(consoleWarn, LogLevel.warn),
    log: wrapper(consoleLog, LogLevel.log),
    info: wrapper(consoleInfo, LogLevel.info),
    infoBegin: wrapper(console.group.bind(console), LogLevel.info),
    infoBeginCollapsed: wrapper(console.groupCollapsed.bind(console), LogLevel.info),
    infoEnd: wrapper(console.groupEnd.bind(console), LogLevel.info),
    warnTagged: taggedWrapper(consoleWarn, LogLevel.warn),
    logTagged: taggedWrapper(consoleLog, LogLevel.log),
    infoTagged: taggedWrapper(consoleInfo, LogLevel.info),
    warnColored: coloredWrapper(consoleWarn, LogLevel.warn),
    logColored: coloredWrapper(consoleLog, LogLevel.log),
    infoColored: coloredWrapper(consoleInfo, LogLevel.info),

    mapStateToProps(containerName: string, mapStateToProps: (state: object) => object) {
        return (state: object): object => {
            const newProps = mapStateToProps(state);
            if (logLevel >= LogLevel.info && mapStateToPropsCache[containerName] &&
                Object.entries(newProps).some(([key, value]) => value !== mapStateToPropsCache[containerName][key])) {
                logger.infoBeginCollapsed(() => `[mapStateToProps] props changed for ${containerName}`);
                Object.entries(newProps).forEach(([key, value]) => {
                    const oldValue = mapStateToPropsCache[containerName][key];
                    if (value !== oldValue) {
                        logger.infoBeginCollapsed(() => key);
                        logger.infoColored({color: 'black', backgroundColor: '#faa'}, () => stringify(oldValue));
                        logger.infoColored({color: 'black', backgroundColor: '#afa'}, () => stringify(value));
                        logger.infoEnd();
                    }
                });
                logger.infoEnd();
            }
            return mapStateToPropsCache[containerName] = newProps;
        };
    }
};

declare var window: any;
window.app = window.app || {};
window.app.setLogLevel = (_logLevel = defaultLogLevel) => logLevel = _logLevel;
window.app.LogLevel = LogLevel;

export default logger;