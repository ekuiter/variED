/**
 * Manages the root application component.
 */

import React from 'react';
import {openWebSocket} from '../server/webSocket';
import FeatureDiagramViewContainer from './featureDiagramView/FeatureDiagramViewContainer';
import {connect} from 'react-redux';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import OverlayContainer from './overlays/OverlayContainer';
import CommandBarContainer from './CommandBarContainer';
import ShortcutContainer from './ShortcutContainer';
import actions from '../store/actions';
import {StateDerivedProps, State} from '../store/types';
import ConstraintViewContainer from './constraintView/ConstraintViewContainer';
import logger from '../helpers/logger';

class AppContainer extends React.Component<StateDerivedProps> {
    componentDidMount() {
        openWebSocket(this.props.handleMessage);
    }

    render() {
        return (
            <Fabric className="fabricRoot">
                <div className="header">
                    <CommandBarContainer/>
                </div>
                <div className={'content ' + this.props.settings!.views.splitDirection}>
                    <FeatureDiagramViewContainer/>
                    <ConstraintViewContainer/>
                </div>
                <OverlayContainer/>
                <ShortcutContainer/>
            </Fabric>
        );
    }
}

export default connect(
    logger.mapStateToProps('AppContainer', (state: State): StateDerivedProps => ({
        settings: state.settings
    })),
    (dispatch): StateDerivedProps => ({
        handleMessage: message => dispatch(actions.server.receive(message))
    })
)(AppContainer);
