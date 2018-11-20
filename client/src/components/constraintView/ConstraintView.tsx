import React from 'react';
import GraphicalFeatureModel, {GraphicalConstraint} from '../../modeling/GraphicalFeatureModel';
import {DetailsList, IColumn, SelectionMode} from 'office-ui-fabric-react/lib/DetailsList';
import i18n from '../../i18n';
import Constraint from './Constraint';

export function enableConstraintView(graphicalFeatureModel?: GraphicalFeatureModel): boolean {
    return graphicalFeatureModel ? graphicalFeatureModel.constraints.length > 0 : false;
}

interface Props {
    graphicalFeatureModel: GraphicalFeatureModel
};

export default class extends React.Component<Props> {
    render(): JSX.Element {
        const columns: IColumn[] = [{
            key: 'constraint',
            name: i18n.t('constraint.constraint'),
            minWidth: 0,
            isRowHeader: true,
            onRender: (constraint: GraphicalConstraint) => (
                <Constraint key={constraint.getKey()} constraint={constraint}/>
            )
        }];

        return (
            <DetailsList
                items={this.props.graphicalFeatureModel.constraints}
                columns={columns}
                compact={true}
                selectionMode={SelectionMode.none}
                isHeaderVisible={false}/>
        );
    }
}