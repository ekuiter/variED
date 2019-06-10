import React from 'react';
import {KernelConflictDescriptor} from '../../modeling/types';
import '../../stylesheets/conflict.css';
import i18n from '../../i18n';
import Operation from './Operation';
import {Collaborator, OnVoteFunction} from '../../store/types';
import {Link} from 'office-ui-fabric-react/lib/Link';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';

interface Props {
    conflictDescriptor: KernelConflictDescriptor,
    myself?: Collaborator,
    collaborators: Collaborator[],
    onVote: OnVoteFunction
};

interface State {
    discardActive: boolean,
    activeOperationID?: string
}

export default class extends React.Component<Props> {
    state: State = {discardActive: false}

    onDiscardActive = () => this.setState({discardActive: true});
    onDiscardInactive = () => this.setState({discardActive: false});
    onSetActiveOperationID = (activeOperationID?: string) => this.setState({activeOperationID});
    onVoteNeutral = () => this.props.onVote({versionID: 'neutral'});

    render(): JSX.Element {
        const {conflictDescriptor, myself, collaborators} = this.props;

        return (
            <div className="conflict">
                <div className="header">
                    <div className="heading">{i18n.t('conflictResolution.header')}</div>&nbsp;&nbsp;
                    {!conflictDescriptor.synchronized && <Spinner size={SpinnerSize.small}/>}
                    <div>
                        <Link
                            onClick={this.onVoteNeutral}
                            onMouseOver={this.onDiscardActive}
                            onMouseOut={this.onDiscardInactive}
                            {...conflictDescriptor.synchronized ? {} : {disabled: true}}>
                            {i18n.t('conflictResolution.cancel')}
                        </Link>
                    </div>
                </div>
                <div className="versions">
                    {Object.entries(conflictDescriptor.versions).map(
                        ([versionID, operationIDs], index) =>
                        versionID !== 'neutral' &&
                            <div className="version" key={versionID}>
                                <div>
                                    <div className="header">
                                        {i18n.t('conflictResolution.version')} {String.fromCharCode(65 + index)}
                                    </div>
                                    {operationIDs.map(operationID =>
                                        <Operation
                                            conflictDescriptor={conflictDescriptor}
                                            versionID={versionID}
                                            operationID={operationID}
                                            activeOperationID={this.state.activeOperationID}
                                            onSetActiveOperationID={this.onSetActiveOperationID}
                                            discardActive={this.state.discardActive}
                                            myself={myself}
                                            collaborators={collaborators}/>)}
                                </div>
                            </div>)}
                </div>
            </div>
        );
    }
}