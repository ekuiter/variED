import React from 'react';
import FeatureModelView from './FeatureModelView';
import {connect} from 'react-redux';
import {getFeatureModel} from '../server/featureModel';

export default connect(
    state => ({
        featureModel: getFeatureModel(state),
        layout: state.ui.layout,
        debug: state.ui.debug,
        useTransitions: state.ui.useTransitions
    })
)(props =>
    props.featureModel
        ? <FeatureModelView {...props}/>
        : <div className="loading"/>);