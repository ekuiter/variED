import React, {ReactNode} from 'react';
import {Constraint, createConstraintRenderer} from '../../modeling/FeatureModel';
import constants from '../../constants';

interface Props {
    constraint: Constraint
};

const reactConstraintRenderer = createConstraintRenderer<ReactNode>({
    neutral: null,
    _return: s => s,
    returnFeature: (s, idx) => <span key={idx} style={constants.constraint.featureStyle}>{s}</span>,
    join: (ts, t) => ts.reduce((acc: ReactNode[], elem) =>
        acc === null ? [elem] : [...acc, t, elem], null),
    cacheKey: 'react'
});

export default class extends React.Component<Props> {
    render(): ReactNode {
        return (
            <span className="constraint">
                {this.props.constraint.render(reactConstraintRenderer)}
            </span>
        );
    }
};