/**
 * Manages the feature diagram of the feature model that is currently edited.
 */

import React from 'react';
import FeatureDiagram from './FeatureDiagram';
import {connect} from 'react-redux';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentFeatureModel} from '../../store/selectors';
import actions from '../../store/actions';
import {State, StateDerivedProps} from '../../store/types';
import logger from '../../helpers/logger';

export default connect(
    logger.mapStateToProps('FeatureDiagramContainer', (state: State): StateDerivedProps => {
        const collaborativeSession = getCurrentCollaborativeSession(state);
        if (!collaborativeSession || !isFeatureDiagramCollaborativeSession(collaborativeSession))
            return {};
        return {
            settings: state.settings,
            featureDiagramLayout: collaborativeSession.layout,
            isSelectMultipleFeatures: collaborativeSession.isSelectMultipleFeatures,
            selectedFeatureNames: collaborativeSession.selectedFeatureNames,
            featureModel: getCurrentFeatureModel(state),
            overlay: state.overlay,
            overlayProps: state.overlayProps
        };
    }),
    (dispatch): StateDerivedProps => ({
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload)),
        onHideOverlay: payload => dispatch(actions.ui.overlay.hide(payload)),
        onSetSelectMultipleFeatures: payload => dispatch(actions.ui.featureDiagram.feature.setSelectMultiple(payload)),
        onSelectFeature: payload => dispatch(actions.ui.featureDiagram.feature.select(payload)),
        onDeselectFeature: payload => dispatch(actions.ui.featureDiagram.feature.deselect(payload)),
        onExpandFeatures: payload => dispatch(actions.ui.featureDiagram.feature.expand(payload)),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onToggleFeatureGroup: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.toggleGroup(payload)),
        onToggleFeatureMandatory: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.toggleMandatory(payload)),
    })
)((props: StateDerivedProps & {className: string}) =>
    props.featureModel
        ? <FeatureDiagram featureDiagramLayout={props.featureDiagramLayout!} settings={props.settings!} {...props}/>
        : <Spinner size={SpinnerSize.large}/>);