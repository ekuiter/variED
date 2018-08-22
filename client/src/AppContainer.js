import React from 'react';
import {openWebSocket} from './server/webSocket';
import FeatureDiagramContainer from './featureDiagram/FeatureDiagramContainer';
import {connect} from 'react-redux';
import {Fabric} from 'office-ui-fabric-react/lib/Fabric';
import SettingsPanel from './SettingsPanel';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import AboutPanel from './AboutPanel';
import CommandBarItems from './CommandBarItems';

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
                        items={[
                            CommandBarItems.featureDiagram.undo(),
                            CommandBarItems.featureDiagram.redo(),
                            CommandBarItems.featureDiagram.setLayout(
                                this.props.featureDiagramLayout, this.props.dispatch),
                        ]}
                        farItems={[
                            CommandBarItems.settings(this.onPanelOpen('settings')),
                            CommandBarItems.about(this.onPanelOpen('about'))
                        ]}/>
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
)(AppContainer);
