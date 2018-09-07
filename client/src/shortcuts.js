import objectPath from 'object-path';

const COMMAND = 'COMMAND', SHIFT = 'SHIFT';

function shortcutText(...keys) {
    keys = keys
        .map(key =>
            key === COMMAND && navigator.platform.startsWith('Mac')
                ? '⌘'
                : key === COMMAND
                    ? 'Ctrl'
                    : key === SHIFT
                        ? '⇧'
                        : key.toUpperCase());
    const joinWith = keys.find(key => key.charCodeAt(0) >= 256) &&
        keys.filter(key => key.charCodeAt(0) < 256).length <= 1 ? '' : '+';
    return keys.join(joinWith);
}

const shortcut = key => ({
    text: key,
    keyBinding: (conditionFn, action) => ({
        key: ({event, props}) => conditionFn(props) && event.key === key,
        action
    })
});

const commandShortcut = key => ({
    text: shortcutText(COMMAND, key),
    keyBinding: (conditionFn, action) => ({
        key: ({event, props}) => conditionFn(props) && event.isCommand(key),
        action
    })
});

const shiftCommandShortcut = key => ({
    text: shortcutText(SHIFT, COMMAND, key),
    keyBinding: (conditionFn, action) => ({
        key: ({event, props}) => conditionFn(props) && event.isShiftCommand(key),
        action
    })
});

export const shortcuts = {
    undo: commandShortcut('z'),
    redo: commandShortcut('y'),
    settings: commandShortcut(','),
    featureDiagram: {
        feature: {
            new: commandShortcut('n'),
            remove: {
                text: '⌫',
                keyBinding: (conditionFn, action) => ({
                    key: ({event, props}) =>
                        conditionFn(props) && (event.key === 'Backspace' || event.key === 'Delete'),
                    action
                })
            },
            rename: shortcut('F2'),
            details: commandShortcut(','),
            selectAll: commandShortcut('a'),
            deselectAll: shiftCommandShortcut('a'),
            collapse: commandShortcut('c'),
            expand: shiftCommandShortcut('c')
        }
    }
};

function getShortcut(...paths) {
    const path = paths.join('.');
    if (!objectPath.has(shortcuts, path))
        throw new Error(`shortcut ${path} does not exist`);
    return objectPath.get(shortcuts, path);
}

export function getShortcutKeyBinding(path, conditionFn, action) {
    return getShortcut(path).keyBinding(conditionFn, action);
}

export function getShortcutText(...paths) {
    return getShortcut(...paths).text;
}