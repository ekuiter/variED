/**
 * Manages the root application component.
 */

import React from 'react';
import {openWebSocket} from '../server/webSocket';
import FeatureDiagramContainer from './featureDiagram/FeatureDiagramContainer';
import {connect} from 'react-redux';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import OverlayContainer from './overlays/OverlayContainer';
import CommandBarContainer from './CommandBarContainer';
import ShortcutContainer from './ShortcutContainer';
import actions from '../store/actions';
import {StateDerivedProps} from '../store/types';

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
                <FeatureDiagramContainer className="content"/>
                <OverlayContainer/>
                <ShortcutContainer/>
            </Fabric>
        );
    }
}

export default connect(
    null,
    (dispatch): StateDerivedProps => ({
        handleMessage: message => dispatch(actions.server.receive(message))
    })
)(AppContainer);
