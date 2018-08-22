import React from 'react';
import {connect} from 'react-redux';
import SettingsPanel from '../../components/panels/SettingsPanel';
import AboutPanel from '../../components/panels/AboutPanel';
import FeaturePanel from '../../components/panels/FeaturePanel';
import actions from '../../store/actions';
import {getFeatureModel} from '../../store/selectors';

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
        onHidePanel: () => dispatch(actions.ui.hidePanel()),
        onSetSetting: (path, value) => dispatch(actions.settings.set(path, value)),
        onResetSettings: () => dispatch(actions.settings.reset())
    })
)(PanelContainer);