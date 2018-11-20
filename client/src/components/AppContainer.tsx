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
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentGraphicalFeatureModel} from '../store/selectors';
import {showConstraintView} from './constraintView/ConstraintView';
import withDimensions from '../helpers/withDimensions';
import {wait} from '../helpers/wait';
import constants from '../constants';

interface Props {
    width: number,
    height: number
};

class AppContainer extends React.Component<StateDerivedProps & Props> {
    contentRef = React.createRef<HTMLDivElement>();
    handlerRef = React.createRef<HTMLDivElement>();

    componentDidMount() {
        openWebSocket(this.props.handleMessage);
        let isDragging = false, wasDragged = false, wasSwitched = false;

        this.handlerRef.current!.addEventListener('mousedown', () => {
            isDragging = true;
        });

        document.addEventListener('mousemove', e => {
            if (!isDragging)
                return false;

            const content = this.contentRef.current!,
                value = this.props.settings!.views.splitDirection === 'horizontal'
                ? (e.clientX - content.offsetLeft) / content.offsetWidth
                : (e.clientY - content.offsetTop) / content.offsetHeight;
            this.props.onSetSetting!({
                path: 'views.splitAt',
                value: Math.min(1, Math.max(0, value))
            });
            wasDragged = true;

            return true;
        });

        document.addEventListener('mouseup', (e) => {
            if (!wasDragged && this.handlerRef.current!.contains(e.target as any))
                wait(200).then(() => {
                    if (!wasSwitched)
                        this.props.onSetSetting!({
                            path: 'views.splitAt',
                            value: this.props.settings!.views.splitAt === 1 ? constants.views.splitMiddle :
                                this.props.settings!.views.splitAt === constants.views.splitMiddle ? 0 : 1
                        });
                });
            wasDragged = isDragging = wasSwitched = false;
        });

        this.handlerRef.current!.addEventListener('dblclick', () => {
            this.props.onSetSetting!({
                path: 'views.splitDirection',
                value: this.props.settings!.views.splitDirection === 'horizontal' ? 'vertical' : 'horizontal'
            });
            wasSwitched = true;
        });
    }

    render() {
        return (
            <Fabric className="fabricRoot">
                <div className="header">
                    <CommandBarContainer/>
                </div>
                <div className={'content ' + this.props.settings!.views.splitDirection} ref={this.contentRef}>
                    <FeatureDiagramViewContainer style={
                        showConstraintView(this.props)
                        ? {
                            flex: '0 0 auto',
                            ...this.props.settings!.views.splitDirection === 'horizontal'
                            ? {width: this.props.settings!.views.splitAt * (this.contentRef.current!.offsetWidth - 12)}
                            : {height: this.props.settings!.views.splitAt * (this.contentRef.current!.offsetHeight - 12)}
                        }
                        : undefined}/>
                    <div className="handler" ref={this.handlerRef} style={{
                        display: showConstraintView(this.props) ? 'block' : 'none'
                    }}>
                        <div className="handler-content">…</div>
                    </div>
                    {showConstraintView(this.props) && <ConstraintViewContainer/>}
                </div>
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
)(withDimensions(AppContainer));
