import React from 'react';
import FeatureDiagram from './FeatureDiagram';
import {connect} from 'react-redux';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';
import {getFeatureModel} from '../selectors';
import Actions from '../Actions';

export default connect(
    state => ({
        settings: state.settings,
        layout: state.ui.featureDiagramLayout,
        featureModel: getFeatureModel(state)
    }),
    dispatch => ({
        onShowPanel: (panel, panelProps) => dispatch(Actions.ui.showPanel(panel, panelProps))
    })
)(props =>
    props.featureModel
        ? <FeatureDiagram {...props}/>
        : <Spinner size={SpinnerSize.large}/>);