/**
 * Manages key shortcut definitions.
 * This file defines the actual shortcuts along with text hints.
 * Shortcut actions are defined in the ShortcutContainer.
 */

import objectPath from 'object-path';
import {KeyBinding, KeyBindingActionFunction} from './helpers/withKeys';

const COMMAND = 'COMMAND', SHIFT = 'SHIFT';

function shortcutText(...keys: string[]): string {
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

type ShortcutConditionFunction = (props: object) => boolean;

interface Shortcut {
    text: string,
    keyBinding: (conditionFn: ShortcutConditionFunction, action: KeyBindingActionFunction) => KeyBinding
};

const shortcut = (key: string): Shortcut => ({
    text: key,
    keyBinding: (conditionFn, action) => ({
        key: ({event, props}) => conditionFn(props) && event.key === key,
        action
    })
});

const commandShortcut = (key: string): Shortcut => ({
    text: shortcutText(COMMAND, key),
    keyBinding: (conditionFn, action) => ({
        key: ({event, props}) => conditionFn(props) && event.isCommand(key),
        action
    })
});

const shiftCommandShortcut = (key: string): Shortcut => ({
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
            remove: <Shortcut>{
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

function getShortcut(...paths: string[]): Shortcut {
    const path = paths.join('.');
    if (!objectPath.has(shortcuts, path))
        throw new Error(`shortcut ${path} does not exist`);
    return objectPath.get(shortcuts, path);
}

export function getShortcutKeyBinding(path: string, conditionFn: ShortcutConditionFunction, action: KeyBindingActionFunction): KeyBinding {
    return getShortcut(path).keyBinding(conditionFn, action);
}

export function getShortcutText(...paths: string[]): string {
    return getShortcut(...paths).text;
}