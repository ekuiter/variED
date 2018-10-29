/**
 * Shows a Fabric facepile of users editing the current feature model.
 */

import * as React from 'react';
import {Facepile, OverflowButtonType, IFacepilePersona} from 'office-ui-fabric-react/lib/Facepile';
import {PersonaSize} from 'office-ui-fabric-react/lib/Persona';
import {Tooltip} from 'office-ui-fabric-react/lib/Tooltip';
import {Settings} from '../store/settings';
import withDimensions from '../helpers/withDimensions';
import {User} from 'src/store/types';

interface Props {
    users: User[],
    settings: Settings,
    width: number,
    height: number
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
        const personas = this.props.users.map(user => ({
                personaName: user.name,
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
                }
            })),
            {maxDisplayableUsers, overflowBreakpoint, gapSpace} = this.props.settings.userFacepile,
            maxDisplayablePersonas = this.props.width < overflowBreakpoint ? 1 : maxDisplayableUsers;

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
                    personaSize={PersonaSize.size28}
                    getPersonaProps={_persona => ({hidePersonaDetails: true})}
                    styles={{root: {margin: '6px 12px'}}}/>
                {this.state.tooltipTarget && this.state.persona &&
                <Tooltip
                    targetElement={this.state.tooltipTarget}
                    content={this.state.persona.personaName}
                    calloutProps={{gapSpace}}/>}
            </React.Fragment>
        );
    }
}

export default withDimensions<Props>(UserFacepile);