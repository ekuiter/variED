import React from 'react';
import {openWebSocket, sendMessage} from './server/webSocket';
import FeatureModelContainer from './featureModel/FeatureModelContainer';
import {connect} from 'react-redux';
import actions from './actions';

class AppContainer extends React.Component {
    componentDidMount() {
        openWebSocket(this.props.handleMessage);

        document.addEventListener('keydown', ({key}) => {
            return key === 'x' ? sendMessage({"type": "FEATURE_ADD", "belowFeature": "FeatureIDE"})
                : key === 'y' ? sendMessage({"type": "UNDO"})
                    : key === 'c' ? this.props.dispatch(actions.ui.toggleUseTransitions())
                        : key === 'v' ? this.props.dispatch(actions.ui.toggleDebug()) :
                            key === 'b' ? this.props.dispatch(actions.ui.setLayout(this.props.layout === 'verticalTree' ? 'horizontalTree' : 'verticalTree')) : null;
        });
    }

    render() {
        return <FeatureModelContainer layout="horizontalTree"/>;
    }
}

export default connect(
    state => ({layout: state.ui.layout}),
    dispatch => ({handleMessage: dispatch, dispatch})
)(AppContainer);
