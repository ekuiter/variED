import React from 'react';
import {State, StateDerivedProps} from '../../store/types';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentGraphicalFeatureModel} from '../../store/selectors';
import logger from '../../helpers/logger';
import {connect} from 'react-redux';
import ConstraintView, {enableConstraintView} from './ConstraintView';

export default connect(
    logger.mapStateToProps('ConstraintViewContainer', (state: State): StateDerivedProps => {
        const collaborativeSession = getCurrentCollaborativeSession(state);
        if (!collaborativeSession || !isFeatureDiagramCollaborativeSession(collaborativeSession))
            return {};
        return {
            graphicalFeatureModel: getCurrentGraphicalFeatureModel(state)
        };
    }),
    (dispatch): StateDerivedProps => ({})
)((props: StateDerivedProps) =>
    enableConstraintView(props.graphicalFeatureModel)
        ? <ConstraintView graphicalFeatureModel={props.graphicalFeatureModel!}/>
        : null);