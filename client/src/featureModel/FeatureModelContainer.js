import React from 'react';
import FeatureModel from './FeatureModel';
import {connect} from 'react-redux';

export default connect(
    state => ({
        featureModel: state.server.featureModel,
        layout: state.ui.layout,
        debug: state.ui.debug,
        useTransitions: state.ui.useTransitions
    })
)(props =>
    props.featureModel
        ? <FeatureModel {...props}/>
        : <div className="loading"/>);