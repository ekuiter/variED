import React from 'react';
import {KernelConflictDescriptor} from '../../modeling/types';
import '../../stylesheets/conflict.css';
import i18n from '../../i18n';
import Operation from './Operation';
import {Collaborator, OnVoteFunction, Votes} from '../../store/types';
import {Spinner, SpinnerSize} from 'office-ui-fabric-react/lib/Spinner';
import {PrimaryButton, DefaultButton} from 'office-ui-fabric-react/lib/Button';
import CollaboratorFacepile from '../CollaboratorFacepile';
import {present} from '../../helpers/present';
import {Settings} from '../../store/settings';
import {PersonaSize} from 'office-ui-fabric-react/lib/Persona';

interface Props {
    conflictDescriptor: KernelConflictDescriptor,
    myself?: Collaborator,
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
    onVote = (versionID: string) => () => this.props.onVote({versionID});

    render(): JSX.Element {
        const {conflictDescriptor, myself, collaborators, voterSiteIDs, votes, settings} = this.props,
            synchronized = conflictDescriptor.synchronized,
            pendingVotePermission = synchronized && !voterSiteIDs,
            allowedToVote = synchronized && !pendingVotePermission && voterSiteIDs!.includes(myself!.siteID),
            disallowedToVote = synchronized && !pendingVotePermission && !allowedToVote,
            ownVotedVersionID = votes[myself!.siteID],
            NeutralButtonComponent = ownVotedVersionID === 'neutral' ? PrimaryButton : DefaultButton,
            collaboratorsInFavor = (versionID: string) =>
                Object.entries(votes)
                    .filter(([_, _versionID]) => versionID === _versionID)
                    .map(([siteID, _]) => collaborators.find(collaborator => collaborator.siteID === siteID))
                    .filter(present);

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
                        <NeutralButtonComponent
                            onClick={this.onVote('neutral')}
                            onMouseOver={this.onSetActiveVersionID('neutral')}
                            onMouseOut={this.onSetActiveVersionID(undefined)}
                            iconProps={{iconName: 'Cancel'}}
                            {...allowedToVote ? {} : {disabled: true}}>
                            {i18n.t('conflictResolution.cancel')}
                        </NeutralButtonComponent>
                        <CollaboratorFacepile
                            users={collaboratorsInFavor('neutral')}
                            settings={settings}
                            personaSize={PersonaSize.size24}/>
                        <div className="clear"/>
                    </div>
                </div>
                <div className="versions">
                    {Object.entries(conflictDescriptor.versions)
                        .sort(([versionIDA, _1]: [string, string[]], [versionIDB, _2]: [string, string[]]) =>
                            versionIDA.localeCompare(versionIDB))
                        .map(([versionID, operationIDs], index) => {
                            const ButtonComponent = ownVotedVersionID === versionID ? PrimaryButton : DefaultButton;

                            return versionID !== 'neutral' &&
                                <div className="version" key={versionID}>
                                    <div>
                                        <div className="header">
                                            <div className="heading">
                                                {i18n.t('conflictResolution.version')} {String.fromCharCode(65 + index)}
                                            </div>
                                            <CollaboratorFacepile
                                                users={collaboratorsInFavor(versionID)}
                                                settings={settings}
                                                personaSize={PersonaSize.size24}/>
                                        </div>
                                        <div className="clear"/>
                                        {operationIDs.map(operationID =>
                                            <Operation
                                                key={operationID}
                                                conflictDescriptor={conflictDescriptor}
                                                versionID={versionID}
                                                operationID={operationID}
                                                activeOperationID={this.state.activeOperationID}
                                                onSetActiveOperationID={this.onSetActiveOperationID}
                                                activeVersionID={this.state.activeVersionID}
                                                myself={myself}
                                                collaborators={collaborators}/>)}
                                        <div className="footer">
                                            <ButtonComponent
                                                onClick={this.onVote(versionID)}
                                                onMouseOver={this.onSetActiveVersionID(versionID)}
                                                onMouseOut={this.onSetActiveVersionID(undefined)}
                                                iconProps={{iconName: 'Commitments'}}
                                                {...allowedToVote ? {} : {disabled: true}}>
                                                {i18n.t('conflictResolution.vote')}
                                            </ButtonComponent>
                                        </div>
                                    </div>
                                </div>;
                        })}
                </div>
            </div>
        );
    }
}