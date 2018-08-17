import React from 'react';

export default (...keyBindings) =>
    WrappedComponent =>
        class extends React.Component {
            _refs = {};

            componentDidMount() {
                document.addEventListener('keydown', this.handleKey);
            }

            componentWillUnmount() {
                document.removeEventListener('keydown', this.handleKey);
            }

            handleKey = event => {
                event.isCommand = key =>
                    (event.ctrlKey || event.metaKey) && event.key === key;

                for (let i = 0; i < keyBindings.length; i++) {
                    const {key, action} = keyBindings[i];
                    if (key(event, this._refs, this.props)) {
                        action(event, this._refs, this.props);
                        break;
                    }
                }
            };

            render() {
                let keyRef = key => element => this._refs[key] = element;
                return <WrappedComponent keyRef={keyRef} {...this.props} />;
            }
        };