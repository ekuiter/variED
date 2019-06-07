import React from 'react';
import {KernelConflictDescriptor} from '../../modeling/types';
import '../../stylesheets/conflict.css';

interface Props {
    conflictDescriptor: KernelConflictDescriptor
};

export default class extends React.Component<Props> {
    render(): JSX.Element {
        const {conflictDescriptor} = this.props;

        return (
            <div className="conflict">
                    {Object.entries(conflictDescriptor.versions).map(
                        ([versionID, operationIDs]) =>
                        <div className="version" key={versionID}>
                            <strong>Version <em>{versionID}</em></strong>
                            <ul>
                                {operationIDs.map(operationID =>
                                <li key={operationID}>
                                    <p><strong>{operationID}</strong></p>
                                    {conflictDescriptor.conflicts[versionID][operationID] &&
                                    Object.entries(conflictDescriptor.conflicts[versionID][operationID]).map(
                                        ([otherOperationID, {reason}]) =>
                                        <span>
                                            Conflicts with <em>{otherOperationID}</em> due to the {reason}.&nbsp;
                                        </span>)}
                                </li>)}
                            </ul>
                        </div>)}
            </div>
        );
    }
}