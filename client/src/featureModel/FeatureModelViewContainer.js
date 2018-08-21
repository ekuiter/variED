import React from 'react';
import FeatureModelView from './FeatureModelView';
import {connect} from 'react-redux';
import {getFeatureModel} from '../server/FeatureModel';
import {getSetting} from '../Settings';

export default connect(
    state => ({
        settings: state.settings,
        layout: getSetting(state.settings, 'featureModel.layout'),
        featureModel: getFeatureModel(state)
    })
)(props =>
    props.featureModel
        ? <FeatureModelView {...props}/>
        : <div className="loading"/>);