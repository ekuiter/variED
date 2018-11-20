import React from 'react';
import {GraphicalConstraint} from '../../modeling/GraphicalFeatureModel';

interface Props {
    constraint: GraphicalConstraint
};

export default class extends React.Component<Props> {
    render(): JSX.Element {
        return (
            <li>{this.props.constraint.toString()}</li>
        );
    }
};