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
            onDismissed={props.onHidePanel}
            settings={props.settings}
            onSetSetting={props.onSetSetting}
            onResetSettings={props.onResetSettings}
            featureDiagramLayout={props.featureDiagramLayout}
            {...props.panelProps}/>
        <AboutPanel
            isOpen={props.panel === 'about'}
            onDismissed={props.onHidePanel}
            {...props.panelProps}/>
        <FeaturePanel
            isOpen={props.panel === 'feature'}
            onDismissed={props.onHidePanel}
            onShowDialog={props.onShowDialog}
            featureModel={props.featureModel}
            {...props.panelProps}/>
    </React.Fragment>
);

export default connect(
    state => ({
        panel: state.ui.panel,
        panelProps: state.ui.panelProps,
        dialog: state.ui.dialog, // needed to reopen a parent panel after a dialog is closed,
        settings: state.settings,
        featureModel: getFeatureModel(state)
    }),
    dispatch => ({
        onHidePanel: () => dispatch(actions.ui.hidePanel()),
        onShowDialog: (dialog, dialogProps) => {
            dispatch(actions.ui.hidePanel());
            dispatch(actions.ui.showDialog(dialog, dialogProps));
        },
        onSetSetting: (path, value) => dispatch(actions.settings.set(path, value)),
        onResetSettings: () => dispatch(actions.settings.reset())
    })
)(PanelContainer);