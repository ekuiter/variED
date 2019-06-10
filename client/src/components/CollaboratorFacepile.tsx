/**
 * Shows a Fabric facepile of users editing the current feature model.
 */

import * as React from 'react';
import {Facepile, OverflowButtonType, IFacepilePersona} from 'office-ui-fabric-react/lib/Facepile';
import {PersonaSize, PersonaInitialsColor} from 'office-ui-fabric-react/lib/Persona';
import {Tooltip} from 'office-ui-fabric-react/lib/Tooltip';
import {Settings} from '../store/settings';
import withDimensions from '../helpers/withDimensions';
import {Collaborator, OnShowOverlayFunction} from '../store/types';
import {OverlayType} from '../types';

interface Props {
    user?: Collaborator,
    users: Collaborator[],
    settings: Settings,
    width: number,
    height: number,
    onShowOverlay?: OnShowOverlayFunction,
    personaSize?: PersonaSize
};

interface State {
    tooltipTarget?: HTMLElement,
    persona?: IFacepilePersona
}

class UserFacepile extends React.Component<Props, State> {
    state: State = {};

    componentDidUpdate(prevProps: Props) {
        if (prevProps.users !== this.props.users)
            this.setState({tooltipTarget: undefined, persona: undefined});
    }

    render() {
        const toPersona = (collaborator: Collaborator, args = {}) => ({
            personaName: collaborator.name,
            onMouseMove: (e?: React.MouseEvent, persona?: IFacepilePersona) => {
                if (typeof e === 'undefined')
                    return;
                const tooltipTarget = e.target && (e.target as HTMLElement).closest('.ms-Facepile-member') as HTMLElement;
                if (tooltipTarget && this.state.tooltipTarget !== tooltipTarget)
                    this.setState({tooltipTarget, persona});
            },
            onMouseOut: (e?: React.MouseEvent) => {
                if (typeof e === 'undefined')
                    return;
                if (e.relatedTarget && !(e.relatedTarget as HTMLElement).closest('.ms-Facepile-member'))
                    this.setState({tooltipTarget: undefined, persona: undefined});
            },
            ...args
        }),
            personas = this.props.users.map(toPersona),
            {maxDisplayableCollaborators, overflowBreakpoint, gapSpace} = this.props.settings.collaboratorFacepile,
            maxDisplayablePersonas = this.props.width < overflowBreakpoint ? 1 : maxDisplayableCollaborators;

        return (
            <React.Fragment>
                <Facepile
                    personas={personas}
                    maxDisplayablePersonas={maxDisplayablePersonas}
                    overflowButtonType={OverflowButtonType.descriptive}
                    overflowButtonProps={{
                        menuProps: {
                            items: personas.slice(maxDisplayablePersonas).map(({personaName}) => ({
                                key: personaName,
                                text: personaName,
                                style: {cursor: 'inherit'}
                            })),
                            isBeakVisible: true,
                            gapSpace
                        },
                        onRenderMenuIcon: () => null
                    }}
                    personaSize={this.props.personaSize || PersonaSize.size28}
                    getPersonaProps={_persona => ({hidePersonaDetails: true})}
                    styles={{
                        root: {
                            padding: '0 10px',
                            margin: '6px 10px',
                            borderRight: this.props.user ? '1px solid #ddd' : undefined
                        }
                    }}/>
                {this.state.tooltipTarget && this.state.persona &&
                <Tooltip
                    targetElement={this.state.tooltipTarget}
                    content={this.state.persona.personaName}
                    calloutProps={{gapSpace}}/>}
                {this.props.user &&
                <Facepile
                    personas={[toPersona(this.props.user, {
                        onClick: () => this.props.onShowOverlay!({overlay: OverlayType.userProfilePanel, overlayProps: {}})
                    })]}
                    personaSize={PersonaSize.size28}
                    getPersonaProps={_persona => ({
                        hidePersonaDetails: true,
                        text: undefined,
                        initialsColor: PersonaInitialsColor.darkBlue
                    })}
                    styles={{root: {margin: '6px 0'}}}/>}
            </React.Fragment>
        );
    }
}

export default withDimensions<Props>(UserFacepile);