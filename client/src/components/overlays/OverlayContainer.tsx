/**
 * Manages all overlays of the application.
 * An overlay is a modal component that requires the user's attention (e.g., a dialog, panel or
 * contextual menu), but that is temporary in nature (i.e., it is opened, inspected/acted upon
 * and finally closed). Only one overlay is allowed to be open at the same time, this is mandated
 * by the Redux store (an existing overlay is closed when another is opened).
 */

import React from 'react';
import {connect} from 'react-redux';
import SettingsPanel from './SettingsPanel';
import AboutPanel from './AboutPanel';
import FeaturePanel from './FeaturePanel';
import actions from '../../store/actions';
import {getFeatureModel} from '../../store/selectors';
import FeatureRenameDialog from './FeatureRenameDialog';
import FeatureSetDescriptionDialog from './FeatureSetDescriptionDialog';
import FeatureCallout from './FeatureCallout';
import FeatureContextualMenu from './FeatureContextualMenu';
import ExportDialog from './ExportDialog';
import {OverlayType} from '../../types';
import {State, StateDerivedProps} from '../../store/types';
import logger from '../../helpers/logger';
import CommandPalette from './CommandPalette';

const OverlayContainer = (props: StateDerivedProps) => (
    <React.Fragment>
        <CommandPalette
            isOpen={props.overlay === OverlayType.commandPalette}
            featureDiagramLayout={props.featureDiagramLayout!}
            featureModel={props.featureModel}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.commandPalette})}
            onShowOverlay={props.onShowOverlay!}
            onUndo={props.onUndo!}
            onRedo={props.onRedo!}
            onFitToScreen={props.onFitToScreen!}
            onCollapseFeatures={props.onCollapseFeatures!}
            onExpandFeatures={props.onExpandFeatures!}
            onCollapseAllFeatures={props.onCollapseAllFeatures!}
            onExpandAllFeatures={props.onExpandAllFeatures!}
            onCollapseFeaturesBelow={props.onCollapseFeaturesBelow!}
            onExpandFeaturesBelow={props.onExpandFeaturesBelow!}
            onAddFeatureAbove={props.onAddFeatureAbove!}
            onAddFeatureBelow={props.onAddFeatureBelow!}
            onSetFeatureDiagramLayout={props.onSetFeatureDiagramLayout!}
            onRemoveFeatures={props.onRemoveFeatures!}
            onRemoveFeaturesBelow={props.onRemoveFeaturesBelow!}
            onSetFeatureAbstract={props.onSetFeatureAbstract!}
            onSetFeatureHidden={props.onSetFeatureHidden!}
            onSetFeatureMandatory={props.onSetFeatureMandatory!}
            onSetFeatureAnd={props.onSetFeatureAnd!}
            onSetFeatureOr={props.onSetFeatureOr!}
            onSetFeatureAlternative={props.onSetFeatureAlternative!}/>

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
            onAddFeatureAbove={props.onAddFeatureAbove!}
            onAddFeatureBelow={props.onAddFeatureBelow!}
            onRemoveFeatures={props.onRemoveFeatures!}
            onRemoveFeaturesBelow={props.onRemoveFeaturesBelow!}
            onSetFeatureAbstract={props.onSetFeatureAbstract!}
            onSetFeatureHidden={props.onSetFeatureHidden!}
            onSetFeatureMandatory={props.onSetFeatureMandatory!}
            onSetFeatureAnd={props.onSetFeatureAnd!}
            onSetFeatureOr={props.onSetFeatureOr!}
            onSetFeatureAlternative={props.onSetFeatureAlternative!}
            {...props.overlayProps}/>}

        {props.overlay === OverlayType.featureRenameDialog &&
        <FeatureRenameDialog
            isOpen={true}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.featureRenameDialog})}
            featureModel={props.featureModel}
            settings={props.settings!}
            onRenameFeature={props.onRenameFeature!}
            {...props.overlayProps}/>}
        {props.overlay === OverlayType.featureSetDescriptionDialog &&
        <FeatureSetDescriptionDialog
            isOpen={true}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.featureSetDescriptionDialog})}
            featureModel={props.featureModel}
            settings={props.settings!}
            onSetFeatureDescription={props.onSetFeatureDescription!}
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
            onAddFeatureAbove={props.onAddFeatureAbove!}
            onAddFeatureBelow={props.onAddFeatureBelow!}
            onRemoveFeatures={props.onRemoveFeatures!}
            onRemoveFeaturesBelow={props.onRemoveFeaturesBelow!}
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
            onAddFeatureAbove={props.onAddFeatureAbove!}
            onAddFeatureBelow={props.onAddFeatureBelow!}
            onRemoveFeatures={props.onRemoveFeatures!}
            onRemoveFeaturesBelow={props.onRemoveFeaturesBelow!}
            onSetFeatureAbstract={props.onSetFeatureAbstract!}
            onSetFeatureHidden={props.onSetFeatureHidden!}
            onSetFeatureMandatory={props.onSetFeatureMandatory!}
            onSetFeatureAnd={props.onSetFeatureAnd!}
            onSetFeatureOr={props.onSetFeatureOr!}
            onSetFeatureAlternative={props.onSetFeatureAlternative!}
            {...props.overlayProps}/>}
    </React.Fragment>
);

export default connect(
    logger.mapStateToProps('OverlayContainer', (state: State): StateDerivedProps => ({
    overlay: state.ui.overlay,
        overlayProps: state.ui.overlayProps,
        featureDiagramLayout: state.ui.featureDiagram.layout,
        isSelectMultipleFeatures: state.ui.featureDiagram.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.featureDiagram.selectedFeatureNames,
        settings: state.settings,
        featureModel: getFeatureModel(state)
    })),
    (dispatch): StateDerivedProps => ({
        onFitToScreen: () => dispatch(actions.ui.featureDiagram.fitToScreen()),
        onSetFeatureDiagramLayout: payload => dispatch(actions.ui.featureDiagram.setLayout(payload)),
        onUndo: () => dispatch<any>(actions.server.undo({})),
        onRedo: () => dispatch<any>(actions.server.redo({})),
        onHideOverlay: payload => dispatch(actions.ui.overlay.hide(payload)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload)),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onSetSetting: payload => dispatch(actions.settings.set(payload)),
        onResetSettings: () => dispatch(actions.settings.reset()),
        onCollapseAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.collapseAll()),
        onExpandAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.expandAll()),
        onCollapseFeatures: payload => dispatch(actions.ui.featureDiagram.feature.collapse(payload)),
        onExpandFeatures: payload => dispatch(actions.ui.featureDiagram.feature.expand(payload)),
        onCollapseFeaturesBelow: payload => dispatch(actions.ui.featureDiagram.feature.collapseBelow(payload)),
        onExpandFeaturesBelow: payload => dispatch(actions.ui.featureDiagram.feature.expandBelow(payload)),
        onAddFeatureAbove: payload => dispatch<any>(actions.server.featureDiagram.feature.addAbove(payload)),
        onAddFeatureBelow: payload => dispatch<any>(actions.server.featureDiagram.feature.addBelow(payload)),
        onRemoveFeatures: payload => dispatch<any>(actions.server.featureDiagram.feature.remove(payload)),
        onRemoveFeaturesBelow: payload => dispatch<any>(actions.server.featureDiagram.feature.removeBelow(payload)),
        onSetFeatureAbstract: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAbstract(payload)),
        onSetFeatureHidden: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setHidden(payload)),
        onSetFeatureMandatory: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setMandatory(payload)),
        onSetFeatureAnd: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAnd(payload)),
        onSetFeatureOr: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setOr(payload)),
        onSetFeatureAlternative: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAlternative(payload)),
        onRenameFeature: payload => dispatch<any>(actions.server.featureDiagram.feature.rename(payload)),
        onSetFeatureDescription: payload => dispatch<any>(actions.server.featureDiagram.feature.setDescription(payload))
    })
)(OverlayContainer);