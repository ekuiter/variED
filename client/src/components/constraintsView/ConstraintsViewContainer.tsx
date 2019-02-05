import React from 'react';
import {State, StateDerivedProps} from '../../store/types';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentFeatureModel} from '../../store/selectors';
import logger from '../../helpers/logger';
import {connect} from 'react-redux';
import ConstraintsView, {enableConstraintsView} from './ConstraintsView';

export default connect(
    logger.mapStateToProps('ConstraintsViewContainer', (state: State): StateDerivedProps => {
        const collaborativeSession = getCurrentCollaborativeSession(state);
        if (!collaborativeSession || !isFeatureDiagramCollaborativeSession(collaborativeSession))
            return {};
        return {
            featureModel: getCurrentFeatureModel(state)
        };
    }),
    (dispatch): StateDerivedProps => ({})
)((props: StateDerivedProps) =>
    enableConstraintsView(props.featureModel)
        ? <ConstraintsView featureModel={props.featureModel!}/>
        : null);