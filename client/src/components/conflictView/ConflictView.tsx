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
                                    <p dangerouslySetInnerHTML={{__html: conflictDescriptor.descriptions[operationID]}} />
                                    {conflictDescriptor.conflicts[versionID][operationID] &&
                                    Object.entries(conflictDescriptor.conflicts[versionID][operationID]).map(
                                        ([otherOperationID, {reason}]) =>
                                        <span>
                                            Conflicts with <em>{otherOperationID}</em>.
                                            Reason: <span dangerouslySetInnerHTML={{__html: reason}} />
                                        </span>)}
                                </li>)}
                            </ul>
                        </div>)}
            </div>
        );
    }
}