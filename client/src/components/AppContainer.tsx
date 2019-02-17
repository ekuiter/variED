/**
 * Manages the root application component.
 */

import React, {CSSProperties} from 'react';
import {openWebSocket} from '../server/webSocket';
import FeatureDiagramViewContainer from './featureDiagramView/FeatureDiagramViewContainer';
import {connect} from 'react-redux';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import OverlayContainer from './overlays/OverlayContainer';
import CommandBarContainer from './CommandBarContainer';
import ShortcutContainer from './ShortcutContainer';
import actions from '../store/actions';
import {StateDerivedProps, State} from '../store/types';
import ConstraintsViewContainer from './constraintsView/ConstraintsViewContainer';
import logger from '../helpers/logger';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentFeatureModel} from '../store/selectors';
import SplitView from './SplitView';
import {enableConstraintsView} from './constraintsView/ConstraintsView';
import {flushMessageQueue} from 'src/server/messageQueue';

class AppContainer extends React.Component<StateDerivedProps> {
    flushMessageQueueInterval: number;

    componentDidMount() {
        openWebSocket(this.props.handleMessage);
        this.flushMessageQueueInterval = window.setInterval(
            flushMessageQueue, this.props.settings!.intervals.flushMessageQueue);
    }

    componentWillUnmount() {
        window.clearInterval(this.flushMessageQueueInterval);
    }

    render() {
        return (
            <Fabric className="fabricRoot">
                <div className="header">
                    <CommandBarContainer/>
                </div>
                <SplitView
                    settings={this.props.settings!}
                    onSetSetting={this.props.onSetSetting!}
                    renderPrimaryView={(style: CSSProperties) => <FeatureDiagramViewContainer style={style}/>}
                    renderSecondaryView={() => <ConstraintsViewContainer/>}
                    enableSecondaryView={() => enableConstraintsView(this.props.featureModel)}/>
                <OverlayContainer/>
                <ShortcutContainer/>
            </Fabric>
        );
    }
}

export default connect(
    logger.mapStateToProps('AppContainer', (state: State): StateDerivedProps => {
        const collaborativeSession = getCurrentCollaborativeSession(state),
            props: StateDerivedProps = {
                settings: state.settings
            };
        if (!collaborativeSession || !isFeatureDiagramCollaborativeSession(collaborativeSession))
            return props;
        return {
            ...props,
            featureModel: getCurrentFeatureModel(state)
        };
    }),
    (dispatch): StateDerivedProps => ({
        handleMessage: message => dispatch(actions.server.receive(message)),
        onSetSetting: payload => dispatch(actions.settings.set(payload))
    })
)(AppContainer);
