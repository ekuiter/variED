import React from 'react';
import {KernelConflictDescriptor} from '../../modeling/types';
import '../../stylesheets/conflict.css';
import i18n from '../../i18n';
import Operation from './Operation';

interface Props {
    conflictDescriptor: KernelConflictDescriptor
};

interface State {
    activeOperationID?: string
}

export default class extends React.Component<Props> {
    state: State = {}

    onSetActiveOperationID = (activeOperationID?: string) => this.setState({activeOperationID});

    render(): JSX.Element {
        const {conflictDescriptor} = this.props;

        return (
            <div className="conflict">
                    {Object.entries(conflictDescriptor.versions).map(
                        ([versionID, operationIDs], index) =>
                        <div className="version" key={versionID}>
                            <div>
                                <div className="header">
                                    {versionID === 'neutral'
                                        ? i18n.t('conflictResolution.neutralVersion')
                                        : `${i18n.t('conflictResolution.version')} ${String.fromCharCode(65 + index)}`}
                                </div>
                                {operationIDs.map(operationID =>
                                    <Operation
                                        conflictDescriptor={conflictDescriptor}
                                        versionID={versionID}
                                        operationID={operationID}
                                        activeOperationID={this.state.activeOperationID}
                                        onSetActiveOperationID={this.onSetActiveOperationID}/>)}
                            </div>
                        </div>)}
            </div>
        );
    }
}