import React from 'react';
import {connect} from 'react-redux';
import SettingsPanel from '../../components/overlays/SettingsPanel';
import AboutPanel from '../../components/overlays/AboutPanel';
import FeaturePanel from '../../components/overlays/FeaturePanel';
import actions from '../../store/actions';
import {getFeatureModel} from '../../store/selectors';
import FeatureRenameDialog from '../../components/overlays/FeatureRenameDialog';
import FeatureSetDescriptionDialog from '../../components/overlays/FeatureSetDescriptionDialog';
import FeatureCallout from '../../components/overlays/FeatureCallout';
import FeatureContextualMenu from '../../components/overlays/FeatureContextualMenu';

export const overlayTypes = {
    settingsPanel: 'settingsPanel',
    aboutPanel: 'aboutPanel',
    featurePanel: 'featurePanel',
    featureRenameDialog: 'featureRenameDialog',
    featureSetDescriptionDialog: 'featureSetDescriptionDialog',
    featureCallout: 'featureCallout',
    featureContextualMenu: 'featureContextualMenu',
    isShownAtSelectedFeature: type => type === 'featureCallout' || type === 'featureContextualMenu'
};

const OverlayContainer = props => (
    <React.Fragment>
        {props.overlay === overlayTypes.settingsPanel &&
        <SettingsPanel
            isOpen={true}
            onDismissed={props.onHideOverlay}
            settings={props.settings}
            onSetSetting={props.onSetSetting}
            onResetSettings={props.onResetSettings}
            featureDiagramLayout={props.featureDiagramLayout}
            {...props.overlayProps}/>}
        {props.overlay === overlayTypes.aboutPanel &&
        <AboutPanel
            isOpen={true}
            onDismissed={props.onHideOverlay}
            {...props.overlayProps}/>}
        {props.overlay === overlayTypes.featurePanel &&
        <FeaturePanel
            isOpen={true}
            onDismissed={props.onHideOverlay}
            onShowOverlay={props.onShowOverlay}
            featureModel={props.featureModel}
            {...props.overlayProps}/>}

        {props.overlay === overlayTypes.featureRenameDialog &&
        <FeatureRenameDialog
            isOpen={true}
            onDismiss={props.onHideOverlay}
            featureModel={props.featureModel}
            {...props.overlayProps}/>}
        {props.overlay === overlayTypes.featureSetDescriptionDialog &&
        <FeatureSetDescriptionDialog
            isOpen={true}
            onDismiss={props.onHideOverlay}
            featureModel={props.featureModel}
            {...props.overlayProps}/>}

        {props.overlay === overlayTypes.featureCallout &&
        <FeatureCallout
            isOpen={true}
            onDismiss={props.onHideOverlay}
            featureDiagramLayout={props.featureDiagramLayout}
            settings={props.settings}
            onShowOverlay={props.onShowOverlay}
            featureModel={props.featureModel}
            {...props.overlayProps}/>}

        {props.overlay === overlayTypes.featureContextualMenu &&
        <FeatureContextualMenu
            isOpen={true}
            onDismiss={props.onHideOverlay}
            featureDiagramLayout={props.featureDiagramLayout}
            settings={props.settings}
            onShowOverlay={props.onShowOverlay}
            onSelectAllFeatures={props.onSelectAllFeatures}
            onDeselectAllFeatures={props.onDeselectAllFeatures}
            featureModel={props.featureModel}
            isSelectMultipleFeatures={props.isSelectMultipleFeatures}
            selectedFeatureNames={props.selectedFeatureNames}
            {...props.overlayProps}/>}
    </React.Fragment>
);

export default connect(
    state => ({
        overlay: state.ui.overlay,
        overlayProps: state.ui.overlayProps,
        featureDiagramLayout: state.ui.featureDiagramLayout,
        isSelectMultipleFeatures: state.ui.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.selectedFeatureNames,
        settings: state.settings,
        featureModel: getFeatureModel(state)
    }),
    dispatch => ({
        onHideOverlay: () => dispatch(actions.ui.hideOverlay()),
        onShowOverlay: (...args) => dispatch(actions.ui.showOverlay(...args)),
        onSelectAllFeatures: () => dispatch(actions.ui.selectAllFeatures()),
        onDeselectAllFeatures: () => dispatch(actions.ui.deselectAllFeatures()),
        onSetSetting: (path, value) => dispatch(actions.settings.set(path, value)),
        onResetSettings: () => dispatch(actions.settings.reset())
    })
)(OverlayContainer);