/**
 * Higher-order component that listens for key events and calls actions for bound keys.
 * As a higher-order component, it can be wrapped around any component and handle
 * keys for that component's lifetime. This way, local key bindings (only available
 * when certain components are visible) are possible.
 */

import React from 'react';

export const isCommand = (event: KeyboardEvent): boolean =>
        (event.ctrlKey || event.metaKey || event.altKey) && !event.shiftKey;

export const isShiftCommand = (event: KeyboardEvent): boolean =>
        (event.ctrlKey || event.metaKey || event.altKey) && event.shiftKey;

type ExtendedKeyboardEvent = KeyboardEvent & {
    isCommand: (key: string) => boolean,
    isShiftCommand: (key: string) => boolean
};

export type KeyBindingActionFunction = ({event, props}: {event: ExtendedKeyboardEvent, props: object}) => void;

export interface KeyBinding {
    key: ({event, props}: {event: ExtendedKeyboardEvent, props: object}) => boolean,
    action: KeyBindingActionFunction
};

export default (...keyBindings: KeyBinding[]) =>
    (WrappedComponent: React.ComponentClass): React.ComponentClass =>
        class extends React.Component {
            componentDidMount() {
                document.addEventListener('keydown', this.handleKey);
            }

            componentWillUnmount() {
                document.removeEventListener('keydown', this.handleKey);
            }

            handleKey = (event: ExtendedKeyboardEvent) => {
                const props = this.props;
                event.isCommand = key => isCommand(event) && (key ? event.key.toLowerCase() === key.toLowerCase() : true);
                event.isShiftCommand = key => isShiftCommand(event) && (key ? event.key.toLowerCase() === key.toLowerCase() : true);

                for (let i = 0; i < keyBindings.length; i++) {
                    const {key, action} = keyBindings[i];
                    if (key({event, props})) {
                        event.preventDefault();
                        action({event, props});
                        break;
                    }
                }
            };

            render() {
                return <WrappedComponent {...this.props}/>;
            }
        };