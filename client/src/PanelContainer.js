import React from 'react';
import {connect} from 'react-redux';
import SettingsPanel from './SettingsPanel';
import AboutPanel from './AboutPanel';
import FeaturePanel from './featureDiagram/FeaturePanel';
import Actions from './Actions';
import {getFeatureModel} from './selectors';

class PanelContainer extends React.Component {
    render() {
        return (
            <React.Fragment>
                <SettingsPanel
                    isOpen={this.props.panel === 'settings'}
                    onDismiss={this.props.onHidePanel}
                    settings={this.props.settings}
                    onSetSetting={this.props.onSetSetting}
                    onResetSettings={this.props.onResetSettings}
                    featureDiagramLayout={this.props.featureDiagramLayout}
                    {...this.props.panelProps}/>
                <AboutPanel
                    isOpen={this.props.panel === 'about'}
                    onDismiss={this.props.onHidePanel}
                    {...this.props.panelProps}/>
                <FeaturePanel
                    isOpen={this.props.panel === 'feature'}
                    onDismiss={this.props.onHidePanel}
                    featureModel={this.props.featureModel}
                    {...this.props.panelProps}/>
            </React.Fragment>
        );
    }
}

export default connect(
    state => ({
        panel: state.ui.panel,
        panelProps: state.ui.panelProps,
        settings: state.settings,
        featureModel: getFeatureModel(state)
    }),
    dispatch => ({
        onHidePanel: () => dispatch(Actions.ui.hidePanel()),
        onSetSetting: (path, value) => dispatch(Actions.settings.set(path, value)),
        onResetSettings: () => dispatch(Actions.settings.reset())
    })
)(PanelContainer);