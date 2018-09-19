import React from 'react';

export const isCommand = (event: KeyboardEvent): boolean =>
        (event.ctrlKey || event.metaKey || event.altKey) && !event.shiftKey;

export const isShiftCommand = (event: KeyboardEvent): boolean =>
        (event.ctrlKey || event.metaKey || event.altKey) && event.shiftKey;

type ExtendedKeyboardEvent = KeyboardEvent & {
    isCommand: (key: string) => boolean,
    isShiftCommand: (key: string) => boolean
};

export type KeyBindingAction = ({event, props}: {event: ExtendedKeyboardEvent, props: object}) => void;

export type KeyBinding = {
    key: ({event, props}: {event: ExtendedKeyboardEvent, props: object}) => boolean,
    action: KeyBindingAction
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
                event.isCommand = key => isCommand(event) && (key ? event.key === key : true);
                event.isShiftCommand = key => isShiftCommand(event) && (key ? event.key === key : true);

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