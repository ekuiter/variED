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
import {overlayTypes} from '../../types';

const OverlayContainer = props => (
    <React.Fragment>
        <SettingsPanel
            isOpen={props.overlay === overlayTypes.settingsPanel}
            onDismissed={props.onHideOverlayFn(overlayTypes.settingsPanel)}
            settings={props.settings}
            onSetSetting={props.onSetSetting}
            onResetSettings={props.onResetSettings}
            featureDiagramLayout={props.featureDiagramLayout}
            {...props.overlayProps}/>
        <AboutPanel
            isOpen={props.overlay === overlayTypes.aboutPanel}
            onDismissed={props.onHideOverlayFn(overlayTypes.aboutPanel)}
            {...props.overlayProps}/>
        {props.overlay === overlayTypes.featurePanel &&
        <FeaturePanel
            isOpen={true}
            onDismissed={props.onHideOverlayFn(overlayTypes.featurePanel)}
            onShowOverlay={props.onShowOverlay}
            onCollapseFeature={props.onCollapseFeature}
            onExpandFeature={props.onExpandFeature}
            featureModel={props.featureModel}
            {...props.overlayProps}/>}

        {props.overlay === overlayTypes.featureRenameDialog &&
        <FeatureRenameDialog
            isOpen={true}
            onDismiss={props.onHideOverlayFn(overlayTypes.featureRenameDialog)}
            featureModel={props.featureModel}
            {...props.overlayProps}/>}
        {props.overlay === overlayTypes.featureSetDescriptionDialog &&
        <FeatureSetDescriptionDialog
            isOpen={true}
            onDismiss={props.onHideOverlayFn(overlayTypes.featureSetDescriptionDialog)}
            featureModel={props.featureModel}
            {...props.overlayProps}/>}

        {props.overlay === overlayTypes.featureCallout &&
        <FeatureCallout
            isOpen={true}
            onDismiss={props.onHideOverlayFn(overlayTypes.featureCallout)}
            featureDiagramLayout={props.featureDiagramLayout}
            settings={props.settings}
            onShowOverlay={props.onShowOverlay}
            onCollapseFeature={props.onCollapseFeature}
            onExpandFeature={props.onExpandFeature}
            featureModel={props.featureModel}
            {...props.overlayProps}/>}

        {props.overlay === overlayTypes.featureContextualMenu &&
        <FeatureContextualMenu
            isOpen={true}
            onDismiss={props.onHideOverlayFn(overlayTypes.featureContextualMenu)}
            featureDiagramLayout={props.featureDiagramLayout}
            settings={props.settings}
            onShowOverlay={props.onShowOverlay}
            onDeselectAllFeatures={props.onDeselectAllFeatures}
            onCollapseFeature={props.onCollapseFeature}
            onExpandFeature={props.onExpandFeature}
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
        onHideOverlayFn: overlay => () => dispatch(actions.ui.overlay.hide(overlay)),
        onShowOverlay: (...args) => dispatch(actions.ui.overlay.show(...args)),
        onSelectAllFeatures: () => dispatch(actions.ui.features.selectAll()),
        onDeselectAllFeatures: () => dispatch(actions.ui.features.deselectAll()),
        onSetSetting: (path, value) => dispatch(actions.settings.set(path, value)),
        onResetSettings: () => dispatch(actions.settings.reset()),
        onCollapseFeature: featureName => dispatch(actions.ui.feature.collapse(featureName)),
        onExpandFeature: featureName => dispatch(actions.ui.feature.expand(featureName))
    })
)(OverlayContainer);