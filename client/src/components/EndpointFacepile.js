import * as React from 'react';
import {Facepile, OverflowButtonType} from 'office-ui-fabric-react/lib/Facepile';
import {PersonaSize} from 'office-ui-fabric-react/lib/Persona';
import {Tooltip} from 'office-ui-fabric-react/lib/Tooltip';
import {getSetting} from '../store/settings';
import withDimensions from '../helpers/withDimensions';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {SettingsType} from '../types';

class EndpointFacepile extends React.Component {
    state = {tooltipTarget: null, persona: null};

    componentDidUpdate(prevProps) {
        if (prevProps.endpoints !== this.props.endpoints)
            this.setState({tooltipTarget: null, persona: null});
    }

    render() {
        const personas = this.props.endpoints.map(endpoint => ({
                personaName: endpoint,
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
            {maxDisplayableEndpoints, overflowBreakpoint, gapSpace} = getSetting(this.props.settings, 'endpointFacepile'),
            maxDisplayablePersonas = this.props.width < overflowBreakpoint ? 1 : maxDisplayableEndpoints;

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
                    getPersonaProps={persona => ({hidePersonaDetails: true})}
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

EndpointFacepile.propTypes = exact({
    endpoints: PropTypes.arrayOf(PropTypes.string).isRequired,
    settings: SettingsType.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired
});

export default withDimensions(EndpointFacepile);