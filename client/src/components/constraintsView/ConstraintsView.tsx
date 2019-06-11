import React from 'react';
import FeatureModel, {Constraint} from '../../modeling/FeatureModel';
import {DetailsList, IColumn, SelectionMode} from 'office-ui-fabric-react/lib/DetailsList';
import i18n from '../../i18n';
import ConstraintView from './ConstraintView';
import {KernelConflictDescriptor} from '../../modeling/types';

export function enableConstraintsView(featureModel?: FeatureModel, transitionConflictDescriptor?: KernelConflictDescriptor): boolean {
    return featureModel && !transitionConflictDescriptor ? featureModel.constraints.length > 0 : false;
}

interface Props {
    featureModel: FeatureModel
};

export default class extends React.Component<Props> {
    render(): JSX.Element {
        const columns: IColumn[] = [{
            key: 'constraint',
            name: i18n.t('commandPalette.constraint'),
            minWidth: 0,
            isRowHeader: true,
            onRender: (constraint: Constraint) => (
                <ConstraintView key={constraint.getKey()} constraint={constraint}/>
            )
        }];

        return (
            <div data-is-scrollable={true} className="scrollable">
                <DetailsList
                    items={this.props.featureModel.constraints}
                    columns={columns}
                    compact={true}
                    selectionMode={SelectionMode.none}
                    isHeaderVisible={false}/>
            </div>
        );
    }
}