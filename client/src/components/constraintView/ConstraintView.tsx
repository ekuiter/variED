import React from 'react';
import GraphicalFeatureModel from '../../modeling/GraphicalFeatureModel';
import Constraint from './Constraint';

export function enableConstraintView(graphicalFeatureModel?: GraphicalFeatureModel): boolean {
    return graphicalFeatureModel ? graphicalFeatureModel.constraints.length > 0 : false;
}

interface Props {
    graphicalFeatureModel: GraphicalFeatureModel
};

const concatTimes = <T extends {}>(a: T[], t = 5): T[] => t == 0 ? a : concatTimes(a.concat(a), t - 1); // TODO

export default class extends React.Component<Props> {
    render(): JSX.Element {
        return (
            <div>
                <ul>
                    {concatTimes(this.props.graphicalFeatureModel.constraints).map(constraint => (
                        <Constraint key={constraint.getKey()} constraint={constraint}/>
                    ))}
                </ul>
            </div>
        );
    }
}