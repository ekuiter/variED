/**
 * Manages the feature diagram of the feature model that is currently edited.
 */

import React from 'react';
import FeatureDiagram from './FeatureDiagram';
import {connect} from 'react-redux';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentGraphicalFeatureModel} from '../../store/selectors';
import actions from '../../store/actions';
import {State, StateDerivedProps} from '../../store/types';
import logger from '../../helpers/logger';
import i18n from '../../i18n';
import {OverlayType} from '../../types';

export default connect(
    logger.mapStateToProps('FeatureDiagramContainer', (state: State): StateDerivedProps => {
        const collaborativeSession = getCurrentCollaborativeSession(state),
            props: StateDerivedProps = {
                settings: state.settings,
                overlay: state.overlay,
                overlayProps: state.overlayProps
            };
        if (!collaborativeSession || !isFeatureDiagramCollaborativeSession(collaborativeSession))
            return props;
        return {
            ...props,
            featureDiagramLayout: collaborativeSession.layout,
            isSelectMultipleFeatures: collaborativeSession.isSelectMultipleFeatures,
            selectedFeatureNames: collaborativeSession.selectedFeatureNames,
            graphicalFeatureModel: getCurrentGraphicalFeatureModel(state)
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
    props.graphicalFeatureModel // TODO: distinguish between "not editing a feature model" and "editing a feature model which is being loaded"
        ? <FeatureDiagram featureDiagramLayout={props.featureDiagramLayout!} settings={props.settings!} {...props}/>
        : i18n.getFunction('noCollaborativeSessions')(() => props.onShowOverlay!({overlay: OverlayType.commandPalette, overlayProps: {}})));