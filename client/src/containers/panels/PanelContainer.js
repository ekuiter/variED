import React from 'react';
import {connect} from 'react-redux';
import SettingsPanel from '../../components/panels/SettingsPanel';
import AboutPanel from '../../components/panels/AboutPanel';
import FeaturePanel from '../../components/panels/FeaturePanel';
import actions from '../../store/actions';
import {getFeatureModel} from '../../store/selectors';

const PanelContainer = props => (
    <React.Fragment>
        <SettingsPanel
            isOpen={props.panel === 'settings'}
            onDismiss={props.onHidePanel}
            settings={props.settings}
            onSetSetting={props.onSetSetting}
            onResetSettings={props.onResetSettings}
            featureDiagramLayout={props.featureDiagramLayout}
            {...props.panelProps}/>
        <AboutPanel
            isOpen={props.panel === 'about'}
            onDismiss={props.onHidePanel}
            {...props.panelProps}/>
        <FeaturePanel
            isOpen={props.panel === 'feature'}
            onDismiss={props.onHidePanel}
            featureModel={props.featureModel}
            {...props.panelProps}/>
    </React.Fragment>
);

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