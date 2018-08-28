import * as React from 'react';
import {Facepile, OverflowButtonType} from 'office-ui-fabric-react/lib/Facepile';
import {PersonaSize} from 'office-ui-fabric-react/lib/Persona';
import {Tooltip} from 'office-ui-fabric-react/lib/Tooltip';
import {getSetting} from '../store/settings';
import withDimensions from '../helpers/withDimensions';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {SettingsType} from '../types';

class UserFacepile extends React.Component {
    propTypes = exact({
        users: PropTypes.arrayOf(PropTypes.string).isRequired,
        settings: SettingsType.isRequired,
        width: PropTypes.number.isRequired,
        height: PropTypes.number.isRequired
    });
    
    state = {tooltipTarget: null, persona: null};

    componentDidUpdate(prevProps) {
        if (prevProps.users !== this.props.users)
            this.setState({tooltipTarget: null, persona: null});
    }

    render() {
        const personas = this.props.users.map(user => ({
                personaName: user,
                onMouseMove: (e, persona) => {
                    const tooltipTarget = e.target && e.target.closest('.ms-Facepile-member');
                    if (tooltipTarget && this.state.tooltipTarget !== tooltipTarget)
                        this.setState({tooltipTarget, persona});
                },
                onMouseOut: e => {
                    if (e.relatedTarget && !e.relatedTarget.closest('.ms-Facepile-member'))
                        this.setState({tooltipTarget: null, persona: null});
                }
            })),
            {maxDisplayableUsers, overflowBreakpoint, gapSpace} = getSetting(this.props.settings, 'userFacepile'),
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
                {this.state.tooltipTarget &&
                <Tooltip
                    targetElement={this.state.tooltipTarget}
                    content={this.state.persona.personaName}
                    calloutProps={{gapSpace}}/>}
            </React.Fragment>
        );
    }
}

export default withDimensions(UserFacepile);