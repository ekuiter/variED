import React from 'react';
import GraphicalFeatureModel from '../../modeling/GraphicalFeatureModel';
import stringify from 'json-stable-stringify';
import {StateDerivedProps} from '../../store/types';

export function showConstraintView(props: StateDerivedProps) {
    return props.graphicalFeatureModel && props.graphicalFeatureModel.constraints.length > 0;
}

interface Props {
    graphicalFeatureModel: GraphicalFeatureModel
};

export default class extends React.Component<Props> {
    render(): JSX.Element {
        return (
            <div>
                <ul>
                    {this.props.graphicalFeatureModel.constraints.map(constraint => (
                        <li key={stringify(constraint)}>
                            {stringify(constraint)}
                        </li>
                    ))}
                </ul>
            </div>
        );
    }
}