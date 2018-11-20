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
import ConstraintViewContainer from './constraintView/ConstraintViewContainer';
import logger from '../helpers/logger';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentGraphicalFeatureModel} from '../store/selectors';
import SplitView from './SplitView';
import {enableConstraintView} from './constraintView/ConstraintView';

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
                <SplitView
                    settings={this.props.settings!}
                    onSetSetting={this.props.onSetSetting!}
                    renderPrimaryView={(style: CSSProperties) => <FeatureDiagramViewContainer style={style}/>}
                    renderSecondaryView={() => <ConstraintViewContainer/>}
                    enableSecondaryView={() => enableConstraintView(this.props.graphicalFeatureModel)}/>
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
            graphicalFeatureModel: getCurrentGraphicalFeatureModel(state)
        };
    }),
    (dispatch): StateDerivedProps => ({
        handleMessage: message => dispatch(actions.server.receive(message)),
        onSetSetting: payload => dispatch(actions.settings.set(payload))
    })
)(AppContainer);
