import React from 'react';
import FeatureDiagram from './FeatureDiagram';
import {connect} from 'react-redux';
import {getFeatureModel} from '../server/FeatureModel';
import {getSetting} from '../settings';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';

export default connect(
    state => ({
        settings: state.settings,
        layout: getSetting(state.settings, 'featureDiagram.layout'),
        featureModel: getFeatureModel(state)
    })
)(props =>
    props.featureModel
        ? <FeatureDiagram {...props}/>
        : <Spinner size={SpinnerSize.large}/>);