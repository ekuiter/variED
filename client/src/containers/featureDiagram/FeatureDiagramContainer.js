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
        featureModel: getFeatureModel(state)
    }),
    dispatch => ({
        onShowPanel: (panel, panelProps) => dispatch(actions.ui.showPanel(panel, panelProps)),
        onShowDialog: (dialog, dialogProps) => dispatch(actions.ui.showDialog(dialog, dialogProps)),
        onSetSelectMultipleFeatures: isSelectMultipleFeatures => dispatch(actions.ui.setSelectMultipleFeatures(isSelectMultipleFeatures)),
        onSelectFeature: featureName => dispatch(actions.ui.selectFeature(featureName)),
        onSelectOneFeature: featureName => dispatch(actions.ui.selectOneFeature(featureName)),
        onDeselectFeature: featureName => dispatch(actions.ui.deselectFeature(featureName)),
        onSelectAllFeatures: () => dispatch(actions.ui.selectAllFeatures()),
        onDeselectAllFeatures: () => dispatch(actions.ui.deselectAllFeatures())
    })
)(props =>
    props.featureModel
        ? <FeatureDiagram {...props}/>
        : <Spinner size={SpinnerSize.large}/>);