import React from 'react';

export const isCommand = event => (event.ctrlKey || event.metaKey) && !event.shiftKey,
    isShiftCommand = event => (event.ctrlKey || event.metaKey) && event.shiftKey;

export default (...keyBindings) =>
    WrappedComponent =>
        class extends React.Component {
            _refs = {};
            state = {};

            componentDidMount() {
                document.addEventListener('keydown', this.handleKey);
            }

            componentWillUnmount() {
                document.removeEventListener('keydown', this.handleKey);
            }

            injectProp = (prop, value) => this.setState({[prop]: value});

            handleKey = event => {
                const refs = this._refs, props = this.props;
                event.isCommand = key => isCommand(event) && (key ? event.key === key : true);
                event.isShiftCommand = key => isShiftCommand(event) && (key ? event.key === key : true);

                for (let i = 0; i < keyBindings.length; i++) {
                    const {key, action, injectProp} = keyBindings[i];
                    if (key({event, refs, props})) {
                        event.preventDefault();
                        if (injectProp)
                            this.injectProp(injectProp.prop, injectProp.value);
                        action({event, refs, props, injectProp: this.injectProp});
                        break;
                    }
                }
            };

            render() {
                let keyRef = key => element => this._refs[key] = element;
                return <WrappedComponent keyRef={keyRef} {...this.props} {...this.state} />;
            }
        };