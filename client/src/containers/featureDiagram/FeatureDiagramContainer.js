import React from 'react';
import FeatureDiagram from '../../components/featureDiagram/FeatureDiagram';
import {connect} from 'react-redux';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';
import {getFeatureModel} from '../../store/selectors';
import actions from '../../store/actions';

export default connect(
    state => ({
        settings: state.settings,
        layout: state.ui.featureDiagramLayout,
        isSelectMultipleFeatures: state.ui.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.selectedFeatureNames,
        featureModel: getFeatureModel(state),
        overlay: state.ui.overlay,
        overlayProps: state.ui.overlayProps
    }),
    dispatch => ({
        onShowOverlay: (...args) => dispatch(actions.ui.overlay.show(...args)),
        onHideOverlayFn: overlay => () => dispatch(actions.ui.overlay.hide(overlay)),
        onSetSelectMultipleFeatures: isSelectMultipleFeatures => dispatch(actions.ui.features.setSelectMultiple(isSelectMultipleFeatures)),
        onSelectFeature: featureName => dispatch(actions.ui.feature.select(featureName)),
        onDeselectFeature: featureName => dispatch(actions.ui.feature.deselect(featureName)),
        onExpandFeature: featureName => dispatch(actions.ui.feature.expand(featureName)),
        onDeselectAllFeatures: () => dispatch(actions.ui.features.deselectAll())
    })
)(props =>
    props.featureModel
        ? <FeatureDiagram {...props}/>
        : <Spinner size={SpinnerSize.large}/>);