import React from 'react';
import i18n from '../../i18n';
import {KernelConflictDescriptor} from '../../modeling/types';
import {Collaborator} from '../../store/types';
import {PrimaryButton, DefaultButton} from 'office-ui-fabric-react/lib/Button';
import CollaboratorFacepile from '../CollaboratorFacepile';
import {PersonaSize} from 'office-ui-fabric-react/lib/Persona';
import {Settings} from '../../store/settings';
import Operation from './Operation';

interface Props {
    conflictDescriptor: KernelConflictDescriptor,
    ownVotedVersionID?: string,
    versionID: string,
    versionIndex: number,
    activeOperationID?: string,
    onSetActiveOperationID: (activeOperationID?: string) => void,
    activeVersionID?: string,
    onSetActiveVersionID: (activeVersionID?: string) => () => void,
    myself?: Collaborator,
    collaborators: Collaborator[],
    collaboratorsInFavor: Collaborator[],
    settings: Settings,
    onVote: (versionID: string) => () => void,
    allowedToVote: boolean
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
        const {ownVotedVersionID, conflictDescriptor, versionID, versionIndex, activeOperationID,
            onSetActiveOperationID, activeVersionID, onSetActiveVersionID, myself, collaborators,
            collaboratorsInFavor, settings, onVote, allowedToVote} = this.props,
            operationIDs = conflictDescriptor.versions[versionID],
            ButtonComponent = ownVotedVersionID === versionID ? PrimaryButton : DefaultButton;

        return versionID !== 'neutral' &&
            <div className="version">
                <div>
                    <div className="header">
                        <div className="heading">
                            {i18n.t('conflictResolution.version')} {String.fromCharCode(65 + versionIndex)}
                        </div>
                        <CollaboratorFacepile
                            users={collaboratorsInFavor}
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
                            activeOperationID={activeOperationID}
                            onSetActiveOperationID={onSetActiveOperationID}
                            activeVersionID={activeVersionID}
                            myself={myself}
                            collaborators={collaborators}/>)}
                    <div className="footer">
                        <ButtonComponent
                            onClick={onVote(versionID)}
                            onMouseOver={onSetActiveVersionID(versionID)}
                            onMouseOut={onSetActiveVersionID(undefined)}
                            iconProps={{iconName: 'Commitments'}}
                            {...allowedToVote ? {} : {disabled: true}}>
                            {i18n.t('conflictResolution.vote')}
                        </ButtonComponent>
                    </div>
                </div>
            </div>;
    }
};