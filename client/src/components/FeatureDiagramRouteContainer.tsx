import React, {CSSProperties} from 'react';
import {StateDerivedProps, State} from '../store/types';
import {getArtifactPathFromLocation} from '../router';
import {isArtifactPathEqual, RouteProps} from '../types';
import SplitView from './SplitView';
import ConstraintsView, {enableConstraintsView} from './constraintsView/ConstraintsView';
import logger from '../helpers/logger';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentFeatureModel, getCurrentConflictDescriptor} from '../store/selectors';
import actions from '../store/actions';
import {withRouter} from 'react-router';
import {connect} from 'react-redux';
import FeatureDiagramView from './featureDiagramView/FeatureDiagramView';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';
import ConflictView from './conflictView/ConflictView';

type FeatureDiagramRouteProps = StateDerivedProps & RouteProps;

class FeatureDiagramRoute extends React.Component<FeatureDiagramRouteProps> {
    componentDidMount() {
        this.onRouteChanged();
    }

    componentDidUpdate(prevProps: FeatureDiagramRouteProps) {
        if (this.props.location !== prevProps.location)
            this.onRouteChanged();
    }

    onRouteChanged() {
        const artifactPath = getArtifactPathFromLocation();
            if (artifactPath && !this.props.collaborativeSessions!.find(collaborativeSession =>
                isArtifactPathEqual(collaborativeSession.artifactPath, artifactPath))) {
                    this.props.onJoinRequest!({artifactPath}); // TODO: error handling
                }
    }

    render() {
        return <SplitView
            settings={this.props.settings!}
            onSetSetting={this.props.onSetSetting!}
            renderPrimaryView={(style: CSSProperties) =>
                this.props.featureModel
                    ? <FeatureDiagramView
                        featureDiagramLayout={this.props.featureDiagramLayout!}
                        currentArtifactPath={this.props.currentArtifactPath!}
                        settings={this.props.settings!}
                        {...this.props}
                        style={style}/>
                    : this.props.conflictDescriptor
                        ? <ConflictView
                            conflictDescriptor={this.props.conflictDescriptor}
                            myself={this.props.myself!}
                            collaborators={this.props.collaborators!}
                            voterSiteIDs={this.props.voterSiteIDs}
                            votes={this.props.votes!}
                            onVote={this.props.onVote!}
                            settings={this.props.settings!}/>
                        : <div style={{display: 'flex'}}>
                            <Spinner size={SpinnerSize.large}/>
                    </div>}
            renderSecondaryView={() => <ConstraintsView featureModel={this.props.featureModel!}/>}
            enableSecondaryView={() => enableConstraintsView(this.props.featureModel)}/>;
    }
}

export default withRouter(connect(
    logger.mapStateToProps('FeatureModelRouteContainer', (state: State): StateDerivedProps => {
        const collaborativeSession = getCurrentCollaborativeSession(state),
            props: StateDerivedProps = {
                settings: state.settings,
                collaborativeSessions: state.collaborativeSessions,
                overlay: state.overlay,
                overlayProps: state.overlayProps,
                myself: state.myself
            };
            if (!collaborativeSession || !isFeatureDiagramCollaborativeSession(collaborativeSession))
                return props;
        return {
            ...props,
            featureModel: getCurrentFeatureModel(state),
            conflictDescriptor: getCurrentConflictDescriptor(state),
            currentArtifactPath: collaborativeSession.artifactPath,
            featureDiagramLayout: collaborativeSession.layout,
            isSelectMultipleFeatures: collaborativeSession.isSelectMultipleFeatures,
            selectedFeatureIDs: collaborativeSession.selectedFeatureIDs,
            collaborators: collaborativeSession.collaborators,
            voterSiteIDs: collaborativeSession.voterSiteIDs,
            votes: collaborativeSession.votes
        };
    }),
    (dispatch): StateDerivedProps => ({
        onSetSetting: payload => dispatch(actions.settings.set(payload)),
        onJoinRequest: payload => dispatch<any>(actions.server.joinRequest(payload)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload)),
        onHideOverlay: payload => dispatch(actions.ui.overlay.hide(payload)),
        onSetSelectMultipleFeatures: payload => dispatch(actions.ui.featureDiagram.feature.setSelectMultiple(payload)),
        onSelectFeature: payload => dispatch(actions.ui.featureDiagram.feature.select(payload)),
        onDeselectFeature: payload => dispatch(actions.ui.featureDiagram.feature.deselect(payload)),
        onExpandFeatures: payload => dispatch(actions.ui.featureDiagram.feature.expand(payload)),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onToggleFeatureGroupType: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.toggleGroup(payload)),
        onToggleFeatureOptional: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.toggleOptional(payload)),
        onVote: payload => dispatch<any>(actions.server.featureDiagram.vote(payload))
    })
)(FeatureDiagramRoute));