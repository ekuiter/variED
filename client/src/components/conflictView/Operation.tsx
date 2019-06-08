import React from 'react';
import {ActivityItem} from 'office-ui-fabric-react/lib/ActivityItem';
import {Icon} from 'office-ui-fabric-react/lib/Icon';
import i18n from '../../i18n';
import {Link} from 'office-ui-fabric-react/lib/Link';
import {KernelConflictDescriptor} from '../../modeling/types';
import {distanceInWordsToNow} from 'date-fns';
import {Collaborator} from '../../store/types';

interface Props {
    conflictDescriptor: KernelConflictDescriptor,
    versionID: string,
    operationID: string,
    activeOperationID?: string,
    onSetActiveOperationID: (activeOperationID?: string) => void,
    myself?: Collaborator,
    collaborators: Collaborator[]
};

interface State {
    time: number
}

export default class extends React.Component<Props, State> {
    state: State = {time: Date.now()}
    interval: number

    componentDidMount() {
        // rerender component to update the timestamp
        this.interval = window.setInterval(() => this.setState({time: Date.now()}), 10 * 1000);
    }

    componentWillUnmount() {
        window.clearInterval(this.interval);
    }

    render()  {
        const {conflictDescriptor, versionID, operationID,
            activeOperationID, onSetActiveOperationID, myself, collaborators} = this.props,
            metadata = conflictDescriptor.metadata[operationID],
            hasConflicts = conflictDescriptor.conflicts[versionID][operationID],
            conflictKeys = hasConflicts && Object.keys(conflictDescriptor.conflicts[versionID][operationID]),
            conflictEntries = hasConflicts && Object.entries(conflictDescriptor.conflicts[versionID][operationID]),
            collaborator = myself && myself.siteID === metadata.siteID
                ? myself
                : collaborators.find(collaborator => collaborator.siteID === metadata.siteID);

        return (
        <ActivityItem
            key={operationID}
            activityDescription={<span>{collaborator === myself ? 'You have' : collaborator ? <span><strong>{collaborator.name}</strong> has</span> : 'A collaborator has'} <span dangerouslySetInnerHTML={{__html: metadata.description}} />.</span>}
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
            timeStamp={distanceInWordsToNow(new Date(metadata.timestamp), {includeSeconds: true, addSuffix: true})}/>
        );
    }
};