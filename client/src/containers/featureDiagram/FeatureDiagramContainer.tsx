/**
 * Manages the feature diagram of the feature model that is currently edited.
 */

import React from 'react';
import FeatureDiagram from '../../components/featureDiagram/FeatureDiagram';
import {connect} from 'react-redux';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';
import {getFeatureModel} from '../../store/selectors';
import actions from '../../store/actions';
import {State, StateDerivedProps} from '../../store/types';

export default connect(
    (state: State): StateDerivedProps => ({
        settings: state.settings,
        featureDiagramLayout: state.ui.featureDiagram.layout,
        isSelectMultipleFeatures: state.ui.featureDiagram.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.featureDiagram.selectedFeatureNames,
        featureModel: getFeatureModel(state),
        overlay: state.ui.overlay,
        overlayProps: state.ui.overlayProps
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