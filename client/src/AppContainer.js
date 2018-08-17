import React from 'react';
import {openWebSocket, sendMessage} from './server/webSocket';
import FeatureModelContainer from './featureModel/FeatureModelContainer';
import {connect} from 'react-redux';
import actions from './actions';
import withKeys from './helpers/withKeys';

class AppContainer extends React.Component {
    componentDidMount() {
        openWebSocket(this.props.handleMessage);
    }

    render() {
        return <FeatureModelContainer layout="horizontalTree"/>;
    }
}

export default connect(
    state => ({layout: state.ui.layout}),
    dispatch => ({handleMessage: dispatch, dispatch})
)(withKeys({
    key: e => e.isCommand('z'),
    action: () => sendMessage(actions.server.undo())
}, {
    key: e => e.isCommand('y'),
    action: () => sendMessage(actions.server.redo())
}, {
    key: e => e.key === 'x',
    action: () => sendMessage(actions.server.featureAdd(prompt('belowFeature')))
}, {
    key: e => e.key === 'y',
    action: () => sendMessage(actions.server.featureDelete(prompt('feature')))
}, {
    key: e => e.key === 'n',
    action: () => sendMessage(actions.server.featureNameChanged(prompt('oldFeature'), prompt('newFeature')))
}, {
    key: e => e.key === 'c',
    action: (e, refs, {dispatch}) => dispatch(actions.ui.toggleUseTransitions())
}, {
    key: e => e.key === 'v',
    action: (e, refs, {dispatch}) => dispatch(actions.ui.toggleDebug())
}, {
    key: e => e.key === 'b',
    action: (e, refs, {dispatch, layout}) => dispatch(actions.ui.setLayout(layout === 'verticalTree' ? 'horizontalTree' : 'verticalTree'))
})(AppContainer));
