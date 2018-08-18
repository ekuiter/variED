import React from 'react';
import {openWebSocket} from './server/webSocket';
import FeatureModelContainer from './featureModel/FeatureModelViewContainer';
import {connect} from 'react-redux';
import actions from './actions';
import withKeys from './helpers/withKeys';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';

class AppContainer extends React.Component {
    componentDidMount() {
        openWebSocket(this.props.dispatch);
    }

    render() {
        return (
            <Fabric className="fabric">
                <FeatureModelContainer/>
            </Fabric>
        );
    }
}

export default connect(
    state => ({layout: state.ui.layout}),
    dispatch => ({dispatch})
)(withKeys({
    key: e => e.isCommand('z'),
    action: actions.server.undo
}, {
    key: e => e.isCommand('y'),
    action: actions.server.redo
}, {
    key: e => e.key === 'x',
    action: () => actions.server.featureAdd(prompt('belowFeature'))
}, {
    key: e => e.key === 'y',
    action: () => actions.server.featureDelete(prompt('feature'))
}, {
    key: e => e.key === 'n',
    action: () => actions.server.featureNameChanged(prompt('oldFeature'), prompt('newFeature'))
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
