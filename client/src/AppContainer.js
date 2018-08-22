import React from 'react';
import {openWebSocket} from './server/webSocket';
import FeatureDiagramContainer from './featureDiagram/FeatureDiagramContainer';
import {connect} from 'react-redux';
import withKeys from './helpers/withKeys';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import Actions from './Actions';
import SettingsPanel from './SettingsPanel';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import i18n from './i18n';
import AboutPanel from './AboutPanel';

class AppContainer extends React.Component {
    state = {
        isPanelOpen: null
    };

    onPanelOpen = panel => () => this.setState({isPanelOpen: panel});
    onPanelDismiss = () => this.setState({isPanelOpen: null});

    componentDidMount() {
        openWebSocket(this.props.dispatch);
    }

    render() {
        return (
            <Fabric className="fabricRoot">
                <div className="header">
                    <CommandBar
                        items={[]}
                        farItems={[{
                            key: 'settings',
                            text: i18n.t('settingsPanel.title'),
                            iconOnly: true,
                            iconProps: {iconName: 'Settings'},
                            onClick: this.onPanelOpen('settings')
                        }, {
                            key: 'about',
                            text: i18n.t('aboutPanel.title'),
                            iconOnly: true,
                            iconProps: {iconName: 'Info'},
                            onClick: this.onPanelOpen('about')
                        }]}/>
                </div>
                <FeatureDiagramContainer className="content"/>
                <SettingsPanel
                    settings={this.props.settings}
                    dispatch={this.props.dispatch}
                    isOpen={this.state.isPanelOpen === 'settings'}
                    featureDiagramLayout={this.props.featureDiagramLayout}
                    onDismiss={this.onPanelDismiss}/>
                <AboutPanel
                    isOpen={this.state.isPanelOpen === 'about'}
                    onDismiss={this.onPanelDismiss}/>
            </Fabric>
        );
    }
}

export default connect(
    state => ({settings: state.settings, featureDiagramLayout: state.ui.featureDiagramLayout}),
    dispatch => ({dispatch})
)(withKeys({
    key: e => e.isCommand('z'),
    action: Actions.server.undo
}, {
    key: e => e.isCommand('y'),
    action: Actions.server.redo
}, {
    key: e => e.isCommand('a'),
    action: () => Actions.server.featureAdd(prompt('belowFeature'))
}, {
    key: e => e.isCommand('s'),
    action: () => Actions.server.featureDelete(prompt('feature'))
}, {
    key: e => e.isCommand('d'),
    action: () => Actions.server.featureNameChanged(prompt('oldFeature'), prompt('newFeature'))
}, {
    key: e => e.isCommand('f'),
    action: (e, refs, {dispatch, featureDiagramLayout}) => dispatch(Actions.ui.setFeatureDiagramLayout(featureDiagramLayout === 'verticalTree' ? 'horizontalTree' : 'verticalTree'))
})(AppContainer));
