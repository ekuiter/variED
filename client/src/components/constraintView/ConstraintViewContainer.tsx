import React from 'react';
import {State, StateDerivedProps} from '../../store/types';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentGraphicalFeatureModel} from '../../store/selectors';
import logger from '../../helpers/logger';
import {connect} from 'react-redux';
import ConstraintView from './ConstraintView';

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
    props.graphicalFeatureModel && props.graphicalFeatureModel.constraints.length > 0
        ? <ConstraintView graphicalFeatureModel={props.graphicalFeatureModel}/>
        : null);