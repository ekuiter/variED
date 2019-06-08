import React from 'react';
import {KernelConflictDescriptor} from '../../modeling/types';
import '../../stylesheets/conflict.css';
import {ActivityItem} from 'office-ui-fabric-react/lib/ActivityItem';
import {Icon} from 'office-ui-fabric-react/lib/Icon';
import i18n from '../../i18n';
import {Link} from 'office-ui-fabric-react/lib/Link';

interface Props {
    conflictDescriptor: KernelConflictDescriptor
};

interface State {
    operationID?: string
}

export default class extends React.Component<Props> {
    state: State = {}

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
                                {operationIDs.map(operationID => {
                                    // TODO: personas & datetime / icon based on operation / "... created a feature below ... ."
                                    const description = conflictDescriptor.descriptions[operationID],
                                        icon = conflictDescriptor.icons[operationID],
                                        hasConflicts = conflictDescriptor.conflicts[versionID][operationID],
                                        conflictKeys = hasConflicts && Object.keys(conflictDescriptor.conflicts[versionID][operationID]),
                                        conflictEntries = hasConflicts && Object.entries(conflictDescriptor.conflicts[versionID][operationID]);
                                    return (
                                    <ActivityItem
                                        key={operationID}
                                        activityDescription={<span dangerouslySetInnerHTML={{__html: description}} />}
                                        activityIcon={<Icon iconName={icon} />}
                                        className={this.state.operationID &&
                                            (operationID === this.state.operationID ||
                                            (hasConflicts && conflictKeys.includes(this.state.operationID)))
                                                ? 'highlight'
                                                : undefined}
                                        comments={
                                            hasConflicts && conflictEntries.map(
                                                ([otherOperationID, {reason}]) =>
                                                <span key={otherOperationID}>
                                                    <Link
                                                        onMouseOver={() => this.setState({operationID})}
                                                        onMouseLeave={() => this.setState({operationID: undefined})}>
                                                        {i18n.t('conflictResolution.conflict')}
                                                    </Link>: <span dangerouslySetInnerHTML={{__html: reason}} />
                                                </span>)}/>
                                    );
                                })}
                            </div>
                        </div>)}
            </div>
        );
    }
}