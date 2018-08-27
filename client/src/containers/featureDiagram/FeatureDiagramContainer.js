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
        onShowOverlay: (...args) => dispatch(actions.ui.showOverlay(...args)),
        onHideOverlayFn: overlay => () => dispatch(actions.ui.hideOverlay(overlay)),
        onSetSelectMultipleFeatures: isSelectMultipleFeatures => dispatch(actions.ui.setSelectMultipleFeatures(isSelectMultipleFeatures)),
        onSelectFeature: featureName => dispatch(actions.ui.selectFeature(featureName)),
        onDeselectFeature: featureName => dispatch(actions.ui.deselectFeature(featureName)),
        onExpandFeature: featureName => dispatch(actions.ui.expandFeature(featureName)),
        onDeselectAllFeatures: () => dispatch(actions.ui.deselectAllFeatures())
    })
)(props =>
    props.featureModel
        ? <FeatureDiagram {...props}/>
        : <Spinner size={SpinnerSize.large}/>);