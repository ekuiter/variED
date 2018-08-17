import React from 'react';
import {openWebSocket, sendMessage} from './server/webSocket';
import FeatureModelContainer from './featureModel/FeatureModelContainer';
import {connect} from 'react-redux';

class AppContainer extends React.Component {
    componentDidMount() {
        openWebSocket(this.props.handleMessage);

        document.addEventListener('keydown', ({key}) => {
            return key === 'x' ? sendMessage({"type": "FEATURE_ADD", "belowFeature": "B"})
                : key === 'y' ? sendMessage({"type": "UNDO"})
                    : key === 'c' ? this.props.handleMessage({"type": "UI_TOGGLE_USE_TRANSITIONS"})
                        : key === 'v' ? this.props.handleMessage({"type": "UI_LAYOUT", layout: this.props.layout === 'verticalTree' ? 'horizontalTree' : 'verticalTree'}) : null;
        });
    }

    render() {
        return <FeatureModelContainer layout="horizontalTree"/>;
    }
}

export default connect(
    state => ({layout: state.ui.layout}),
    dispatch => ({handleMessage: dispatch})
)(AppContainer);
