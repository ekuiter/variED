/**
 * Manages all overlays of the application.
 * An overlay is a modal component that requires the user's attention (e.g., a dialog, panel or
 * contextual menu), but that is temporary in nature (i.e., it is opened, inspected/acted upon
 * and finally closed). Only one overlay is allowed to be open at the same time, this is mandated
 * by the Redux store (an existing overlay is closed when another is opened).
 */

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
import ExportDialog from '../../components/overlays/ExportDialog';
import {OverlayType} from '../../types';
import {State, StateDerivedProps} from '../../store/types';

const OverlayContainer = (props: StateDerivedProps) => (
    <React.Fragment>
        <SettingsPanel
            isOpen={props.overlay === OverlayType.settingsPanel}
            onDismissed={() => props.onHideOverlay!({overlay: OverlayType.settingsPanel})}
            settings={props.settings!}
            onSetSetting={props.onSetSetting!}
            onResetSettings={props.onResetSettings!}
            featureDiagramLayout={props.featureDiagramLayout!}
            {...props.overlayProps}/>
        <AboutPanel
            isOpen={props.overlay === OverlayType.aboutPanel}
            onDismissed={() => props.onHideOverlay!({overlay: OverlayType.aboutPanel})}
            {...props.overlayProps}/>
        {props.overlay === OverlayType.featurePanel &&
        <FeaturePanel
            isOpen={true}
            onDismissed={() => props.onHideOverlay!({overlay: OverlayType.featurePanel})}
            onShowOverlay={props.onShowOverlay!}
            onCollapseFeatures={props.onCollapseFeatures!}
            onExpandFeatures={props.onExpandFeatures!}
            onCollapseFeaturesBelow={props.onCollapseFeaturesBelow!}
            onExpandFeaturesBelow={props.onExpandFeaturesBelow!}
            featureModel={props.featureModel}
            settings={props.settings!}
            {...props.overlayProps}/>}

        {props.overlay === OverlayType.featureRenameDialog &&
        <FeatureRenameDialog
            isOpen={true}
            featureModel={props.featureModel}
            settings={props.settings!}
            {...props.overlayProps}/>}
        {props.overlay === OverlayType.featureSetDescriptionDialog &&
        <FeatureSetDescriptionDialog
            isOpen={true}
            featureModel={props.featureModel}
            settings={props.settings!}
            {...props.overlayProps}/>}
        {props.overlay === OverlayType.exportDialog &&
        <ExportDialog
            isOpen={true}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.exportDialog})}
            settings={props.settings!}
            onSetSetting={props.onSetSetting!}
            featureDiagramLayout={props.featureDiagramLayout!}
            {...props.overlayProps}/>}

        {props.overlay === OverlayType.featureCallout &&
        <FeatureCallout
            isOpen={true}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.featureCallout})}
            featureDiagramLayout={props.featureDiagramLayout!}
            settings={props.settings!}
            onShowOverlay={props.onShowOverlay!}
            onCollapseFeatures={props.onCollapseFeatures!}
            onExpandFeatures={props.onExpandFeatures!}
            onCollapseFeaturesBelow={props.onCollapseFeaturesBelow!}
            onExpandFeaturesBelow={props.onExpandFeaturesBelow!}
            featureModel={props.featureModel}
            {...props.overlayProps}/>}

        {props.overlay === OverlayType.featureContextualMenu &&
        <FeatureContextualMenu
            isOpen={true}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.featureContextualMenu})}
            featureDiagramLayout={props.featureDiagramLayout!}
            settings={props.settings!}
            onShowOverlay={props.onShowOverlay!}
            onDeselectAllFeatures={props.onDeselectAllFeatures!}
            onCollapseFeatures={props.onCollapseFeatures!}
            onExpandFeatures={props.onExpandFeatures!}
            onCollapseFeaturesBelow={props.onCollapseFeaturesBelow!}
            onExpandFeaturesBelow={props.onExpandFeaturesBelow!}
            featureModel={props.featureModel}
            isSelectMultipleFeatures={props.isSelectMultipleFeatures!}
            selectedFeatureNames={props.selectedFeatureNames!}
            {...props.overlayProps}/>}
    </React.Fragment>
);

export default connect(
    (state: State): StateDerivedProps => ({
    overlay: state.ui.overlay,
        overlayProps: state.ui.overlayProps,
        featureDiagramLayout: state.ui.featureDiagram.layout,
        isSelectMultipleFeatures: state.ui.featureDiagram.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.featureDiagram.selectedFeatureNames,
        settings: state.settings,
        featureModel: getFeatureModel(state)
    }),
    (dispatch): StateDerivedProps => ({
        onHideOverlay: payload => () => dispatch(actions.ui.overlay.hide(payload)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload)),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onSetSetting: payload => dispatch(actions.settings.set(payload)),
        onResetSettings: () => dispatch(actions.settings.reset()),
        onCollapseFeatures: payload => dispatch(actions.ui.featureDiagram.feature.collapse(payload)),
        onExpandFeatures: payload => dispatch(actions.ui.featureDiagram.feature.expand(payload)),
        onCollapseFeaturesBelow: payload => dispatch(actions.ui.featureDiagram.feature.collapseBelow(payload)),
        onExpandFeaturesBelow: payload => dispatch(actions.ui.featureDiagram.feature.expandBelow(payload))
    })
)(OverlayContainer);