/**
 * Manages the root application component.
 */

import React from 'react';
import {openWebSocket} from '../server/webSocket';
import {connect} from 'react-redux';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import OverlayContainer from './overlays/OverlayContainer';
import CommandBarContainer from './CommandBarContainer';
import ShortcutContainer from './ShortcutContainer';
import actions from '../store/actions';
import {StateDerivedProps, State} from '../store/types';
import logger, {setLogLevel, LogLevel} from '../helpers/logger';
import {flushOutgoingMessageQueue, queueingMessageHandler} from '../server/messageQueue';
import {artifactPathToString} from '../types';
import {history, getCurrentArtifactPath} from '../router';
import {Router, Route, Switch} from 'react-router-dom';
import i18n from '../i18n';
import FeatureDiagramRouteContainer from './FeatureDiagramRouteContainer';

class AppContainer extends React.Component<StateDerivedProps> {
    flushOutgoingMessageQueueInterval: number;

    componentDidMount() {
        openWebSocket(queueingMessageHandler(this.props.handleMessage));

        this.flushOutgoingMessageQueueInterval = window.setInterval(
            flushOutgoingMessageQueue, this.props.settings!.intervals.flushOutgoingMessageQueue);

        if (this.props.settings!.developer.debug)
            setLogLevel(LogLevel.info);
    }

    componentWillUnmount() {
        window.clearInterval(this.flushOutgoingMessageQueueInterval);
    }

    componentDidUpdate() {
        const currentArtifactPath = getCurrentArtifactPath(this.props.collaborativeSessions!);
        document.title = currentArtifactPath
            ? `${artifactPathToString(currentArtifactPath)} | variED`
            : 'variED';
    }

    render() {
        return (
            <Router history={history}>
                <Fabric className="fabricRoot">
                    <div className="header">
                        <CommandBarContainer/>
                    </div>
                    <OverlayContainer/>
                    <ShortcutContainer/>
                    <Switch>
                        <Route path="/:project/:artifact" component={FeatureDiagramRouteContainer}/>
                        <Route component={() => i18n.getFunction('noCollaborativeSessions')(this.props.onShowOverlay)}/>
                    </Switch>
                </Fabric>
            </Router>
        );
    }
}

export default connect(
    logger.mapStateToProps('AppContainer', (state: State): StateDerivedProps => ({
        settings: state.settings,
        collaborativeSessions: state.collaborativeSessions
    })),
    (dispatch): StateDerivedProps => ({
        handleMessage: message => dispatch(actions.server.receive(message)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload))
    })
)(AppContainer);