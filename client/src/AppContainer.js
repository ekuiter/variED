import React from 'react';
import {openWebSocket} from './server/webSocket';
import FeatureDiagramContainer from './featureDiagram/FeatureDiagramContainer';
import {connect} from 'react-redux';
import withKeys from './helpers/withKeys';
import { Fabric } from 'office-ui-fabric-react/lib/Fabric';
import actions from './Actions';

class AppContainer extends React.Component {
    componentDidMount() {
        openWebSocket(this.props.dispatch);
    }

    render() {
        return (
            <Fabric className="fabricRoot">
                <FeatureDiagramContainer/>
            </Fabric>
        );
    }
}

export default connect(
    null,
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
    action: (e, refs, {dispatch}) => dispatch(actions.setSetting('featureDiagram.treeLayout.useTransitions', bool => !bool))
}, {
    key: e => e.key === 'v',
    action: (e, refs, {dispatch}) => dispatch(actions.setSetting('featureDiagram.treeLayout.debug', bool => !bool))
}, {
    key: e => e.key === 'b',
    action: (e, refs, {dispatch}) => dispatch(actions.setSetting('featureDiagram.layout', layout => layout === 'verticalTree' ? 'horizontalTree' : 'verticalTree'))
})(AppContainer));
