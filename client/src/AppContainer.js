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

class AppContainer extends React.Component {
    state = {
        isSettingsPanelOpen: false
    };

    onSettingsPanelOpen = () => this.setState({isSettingsPanelOpen: true});
    onSettingsPanelDismiss = () => this.setState({isSettingsPanelOpen: false});

    componentDidMount() {
        openWebSocket(this.props.dispatch);
    }

    render() {
        return (
            <Fabric className="fabricRoot">
                <div className="header">
                    <CommandBar
                        items={[]}
                        farItems={[
                            {
                                key: 'settings',
                                text: i18n.t('settingsPanel.title'),
                                iconOnly: true,
                                iconProps: {iconName: 'Settings'},
                                onClick: this.onSettingsPanelOpen
                            }
                        ]}/>
                </div>
                <FeatureDiagramContainer className="content"/>
                <SettingsPanel
                    settings={this.props.settings}
                    dispatch={this.props.dispatch}
                    isOpen={this.state.isSettingsPanelOpen}
                    onDismiss={this.onSettingsPanelDismiss}/>
            </Fabric>
        );
    }
}

export default connect(
    state => ({settings: state.settings}),
    dispatch => ({dispatch})
)(withKeys({
    key: e => e.isCommand('z'),
    action: Actions.server.undo
}, {
    key: e => e.isCommand('y'),
    action: Actions.server.redo
}, {
    key: e => e.key === 'x',
    action: () => Actions.server.featureAdd(prompt('belowFeature'))
}, {
    key: e => e.key === 'y',
    action: () => Actions.server.featureDelete(prompt('feature'))
}, {
    key: e => e.key === 'n',
    action: () => Actions.server.featureNameChanged(prompt('oldFeature'), prompt('newFeature'))
}, {
    key: e => e.key === 'c',
    action: (e, refs, {dispatch}) => dispatch(Actions.setSetting('featureDiagram.treeLayout.useTransitions', bool => !bool))
}, {
    key: e => e.key === 'v',
    action: (e, refs, {dispatch}) => dispatch(Actions.setSetting('featureDiagram.treeLayout.debug', bool => !bool))
}, {
    key: e => e.key === 'b',
    action: (e, refs, {dispatch}) => dispatch(Actions.setSetting('featureDiagram.layout', layout => layout === 'verticalTree' ? 'horizontalTree' : 'verticalTree'))
})(AppContainer));
