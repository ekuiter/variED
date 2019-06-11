import React from 'react';
import {KernelConflictDescriptor} from '../../modeling/types';
import '../../stylesheets/conflict.css';
import i18n from '../../i18n';
import {Collaborator, OnVoteFunction, Votes} from '../../store/types';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';
import {PrimaryButton, DefaultButton} from 'office-ui-fabric-react/lib/Button';
import CollaboratorFacepile from '../CollaboratorFacepile';
import {present} from '../../helpers/present';
import {Settings} from '../../store/settings';
import {PersonaSize} from 'office-ui-fabric-react/lib/Persona';
import Version from './Version';

interface Props {
    conflictDescriptor: KernelConflictDescriptor,
    myself: Collaborator,
    collaborators: Collaborator[],
    voterSiteIDs?: string[],
    votes: Votes,
    onVote: OnVoteFunction,
    settings: Settings
};

interface State {
    activeVersionID?: string,
    activeOperationID?: string
}

export default class extends React.Component<Props> {
    state: State = {}

    onSetActiveVersionID = (activeVersionID?: string) => () => this.setState({activeVersionID});
    onSetActiveOperationID = (activeOperationID?: string) => this.setState({activeOperationID});
    ownVotedVersionID = () => this.props.votes[this.props.myself.siteID];

    onVote = (versionID: string) => () =>
        this.props.onVote({versionID: versionID === this.ownVotedVersionID() ? undefined : versionID});

    collaboratorsInFavor = (versionID: string) =>
            Object.entries(this.props.votes)
                .filter(([_, _versionID]) => versionID === _versionID)
                .map(([siteID, _]) => this.props.collaborators.find(collaborator => collaborator.siteID === siteID))
                .filter(present);

    render(): JSX.Element {
        const {conflictDescriptor, myself, collaborators, voterSiteIDs, settings} = this.props,
            synchronized = conflictDescriptor.synchronized,
            pendingVotePermission = synchronized && !voterSiteIDs,
            allowedToVote = synchronized && !pendingVotePermission && voterSiteIDs!.includes(myself.siteID),
            disallowedToVote = synchronized && !pendingVotePermission && !allowedToVote,
            ButtonComponent = this.ownVotedVersionID() === 'neutral' ? PrimaryButton : DefaultButton;

        return (
            <div className="conflict">
                <div className="header">
                    <div className="heading">{i18n.t('conflictResolution.header')}</div>&nbsp;&nbsp;
                    {(!synchronized || pendingVotePermission || disallowedToVote) &&
                        <div className="info">
                            {(!synchronized || pendingVotePermission) &&
                                <Spinner size={SpinnerSize.small}/>}
                            {!synchronized && <div className="status">{i18n.t('conflictResolution.synchronizing')}</div>}
                            {pendingVotePermission && <div className="status">{i18n.t('conflictResolution.pendingVotePermission')}</div>}
                            {disallowedToVote && <div className="status">{i18n.t('conflictResolution.disallowedToVote')}</div>}
                        </div>}
                    <div className="clear neutral">
                        <ButtonComponent
                            onClick={this.onVote('neutral')}
                            onMouseOver={this.onSetActiveVersionID('neutral')}
                            onMouseOut={this.onSetActiveVersionID(undefined)}
                            iconProps={{iconName: 'Cancel'}}
                            {...allowedToVote ? {} : {disabled: true}}>
                            {i18n.t('conflictResolution.cancel')}
                        </ButtonComponent>
                        <CollaboratorFacepile
                            users={this.collaboratorsInFavor('neutral')}
                            settings={settings}
                            personaSize={PersonaSize.size24}/>
                        <div className="clear"/>
                    </div>
                </div>
                <div className="versions">
                    {Object.keys(conflictDescriptor.versions)
                        .sort((versionIDA: string, versionIDB: string) => versionIDA.localeCompare(versionIDB))
                        .map((versionID, versionIndex) =>
                            <Version
                                key={versionID}
                                conflictDescriptor={conflictDescriptor}
                                ownVotedVersionID={this.ownVotedVersionID()}
                                versionID={versionID}
                                versionIndex={versionIndex}
                                activeOperationID={this.state.activeOperationID}
                                onSetActiveOperationID={this.onSetActiveOperationID}
                                activeVersionID={this.state.activeVersionID}
                                onSetActiveVersionID={this.onSetActiveVersionID}
                                myself={myself}
                                collaborators={collaborators}
                                collaboratorsInFavor={this.collaboratorsInFavor(versionID)}
                                settings={settings}
                                onVote={this.onVote}
                                allowedToVote={allowedToVote}/>)}
                </div>
            </div>
        );
    }
}