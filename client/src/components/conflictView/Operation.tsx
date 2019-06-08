import React from 'react';
import {ActivityItem} from 'office-ui-fabric-react/lib/ActivityItem';
import {Icon} from 'office-ui-fabric-react/lib/Icon';
import i18n from '../../i18n';
import {Link} from 'office-ui-fabric-react/lib/Link';
import {KernelConflictDescriptor} from '../../modeling/types';

export default ({conflictDescriptor, versionID, operationID, activeOperationID, onSetActiveOperationID}:
    {conflictDescriptor: KernelConflictDescriptor, versionID: string, operationID: string, activeOperationID?: string,
        onSetActiveOperationID: (activeOperationID?: string) => void}) => {
    // TODO: personas & datetime / icon based on operation / "... created a feature below ... ."
    const metadata = conflictDescriptor.metadata[operationID],
        hasConflicts = conflictDescriptor.conflicts[versionID][operationID],
        conflictKeys = hasConflicts && Object.keys(conflictDescriptor.conflicts[versionID][operationID]),
        conflictEntries = hasConflicts && Object.entries(conflictDescriptor.conflicts[versionID][operationID]);
    return (
    <ActivityItem
        key={operationID}
        activityDescription={<span dangerouslySetInnerHTML={{__html: metadata.description}} />}
        activityIcon={<Icon iconName={metadata.icon} />}
        className={activeOperationID &&
            (operationID === activeOperationID ||
            (hasConflicts && conflictKeys.includes(activeOperationID)))
                ? 'highlight'
                : undefined}
        comments={hasConflicts && conflictEntries.length > 0
            ? <span>
                <Link
                    onMouseOver={() => onSetActiveOperationID(operationID)}
                    onMouseLeave={() => onSetActiveOperationID(undefined)}>
                    {i18n.getFunction('conflictResolution.conflict')(conflictEntries.length)}
                </Link>:
                {conflictEntries.map(([otherOperationID, {reason}]) =>
                    <span key={otherOperationID}>&nbsp;<span dangerouslySetInnerHTML={{__html: reason}}/></span>)}
            </span>
            : null}
        timeStamp={metadata.timestamp}/>
    );
};