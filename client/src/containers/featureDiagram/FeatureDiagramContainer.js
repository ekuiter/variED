import React from 'react';
import FeatureDiagram from '../../components/featureDiagram/FeatureDiagram';
import {connect} from 'react-redux';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';
import {getFeatureModel} from '../../store/selectors';
import actions from '../../store/actions';

export default connect(
    state => ({
        settings: state.settings,
        layout: state.ui.featureDiagram.layout,
        isSelectMultipleFeatures: state.ui.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.selectedFeatureNames,
        featureModel: getFeatureModel(state),
        overlay: state.ui.overlay,
        overlayProps: state.ui.overlayProps
    }),
    dispatch => ({
        onShowOverlay: (...args) => dispatch(actions.ui.overlay.show(...args)),
        onHideOverlay: overlay => dispatch(actions.ui.overlay.hide(overlay)),
        onSetSelectMultipleFeatures: isSelectMultipleFeatures => dispatch(actions.ui.featureDiagram.feature.setSelectMultiple(isSelectMultipleFeatures)),
        onSelectFeature: featureName => dispatch(actions.ui.featureDiagram.feature.select(featureName)),
        onDeselectFeature: featureName => dispatch(actions.ui.featureDiagram.feature.deselect(featureName)),
        onExpandFeatures: featureName => dispatch(actions.ui.featureDiagram.feature.expand(featureName)),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll())
    })
)(props =>
    props.featureModel
        ? <FeatureDiagram {...props}/>
        : <Spinner size={SpinnerSize.large}/>);