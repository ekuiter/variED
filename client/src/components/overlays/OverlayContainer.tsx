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
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentFeatureModel} from '../../store/selectors';
import FeatureRenameDialog from './FeatureRenameDialog';
import FeatureSetDescriptionDialog from './FeatureSetDescriptionDialog';
import FeatureCallout from './FeatureCallout';
import FeatureContextualMenu from './FeatureContextualMenu';
import ExportDialog from './ExportDialog';
import {OverlayType, RouteProps} from '../../types';
import {State, StateDerivedProps} from '../../store/types';
import logger from '../../helpers/logger';
import CommandPalette from './CommandPalette';
import AddArtifactPanel from './AddArtifactPanel';
import ShareDialog from './ShareDialog';
import {getCurrentArtifactPath} from '../../router';
import {withRouter} from 'react-router';
import UserProfilePanel from './UserProfilePanel';

const OverlayContainer = (props: StateDerivedProps & RouteProps) => (
    <React.Fragment>
        <CommandPalette
            artifactPaths={props.artifactPaths!}
            collaborativeSessions={props.collaborativeSessions!}
            isOpen={props.overlay === OverlayType.commandPalette}
            featureDiagramLayout={props.featureDiagramLayout}
            featureModel={props.featureModel}
            settings={props.settings!}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.commandPalette})}
            onShowOverlay={props.onShowOverlay!}
            onRemoveArtifact={props.onRemoveArtifact!}
            onLeaveRequest={props.onLeaveRequest!}
            onUndo={props.onUndo!}
            onRedo={props.onRedo!}
            onFitToScreen={props.onFitToScreen!}
            onCollapseFeatures={props.onCollapseFeatures!}
            onExpandFeatures={props.onExpandFeatures!}
            onCollapseAllFeatures={props.onCollapseAllFeatures!}
            onExpandAllFeatures={props.onExpandAllFeatures!}
            onCollapseFeaturesBelow={props.onCollapseFeaturesBelow!}
            onExpandFeaturesBelow={props.onExpandFeaturesBelow!}
            onCreateFeatureAbove={props.onCreateFeatureAbove!}
            onCreateFeatureBelow={props.onCreateFeatureBelow!}
            onSetFeatureDiagramLayout={props.onSetFeatureDiagramLayout!}
            onRemoveFeature={props.onRemoveFeature!}
            onRemoveFeatureSubtree={props.onRemoveFeatureSubtree!}
            onMoveFeatureSubtree={props.onMoveFeatureSubtree!}
            onSetFeatureAbstract={props.onSetFeatureAbstract!}
            onSetFeatureHidden={props.onSetFeatureHidden!}
            onSetFeatureOptional={props.onSetFeatureOptional!}
            onSetFeatureAnd={props.onSetFeatureAnd!}
            onSetFeatureOr={props.onSetFeatureOr!}
            onSetFeatureAlternative={props.onSetFeatureAlternative!}
            onCreateConstraint={props.onCreateConstraint!}
            onSetConstraint={props.onSetConstraint!}
            onRemoveConstraint={props.onRemoveConstraint!}
            onSetSetting={props.onSetSetting!}/>

        <SettingsPanel
            isOpen={props.overlay === OverlayType.settingsPanel}
            onDismissed={() => props.onHideOverlay!({overlay: OverlayType.settingsPanel})}
            settings={props.settings!}
            onSetSetting={props.onSetSetting!}
            onResetSettings={props.onResetSettings!}
            featureDiagramLayout={props.featureDiagramLayout}
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
            featureModel={props.featureModel!}
            settings={props.settings!}
            onCreateFeatureAbove={props.onCreateFeatureAbove!}
            onCreateFeatureBelow={props.onCreateFeatureBelow!}
            onRemoveFeature={props.onRemoveFeature!}
            onRemoveFeatureSubtree={props.onRemoveFeatureSubtree!}
            onSetFeatureAbstract={props.onSetFeatureAbstract!}
            onSetFeatureHidden={props.onSetFeatureHidden!}
            onSetFeatureOptional={props.onSetFeatureOptional!}
            onSetFeatureAnd={props.onSetFeatureAnd!}
            onSetFeatureOr={props.onSetFeatureOr!}
            onSetFeatureAlternative={props.onSetFeatureAlternative!}
            {...props.overlayProps}/>}

        {props.overlay === OverlayType.featureRenameDialog &&
        <FeatureRenameDialog
            isOpen={true}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.featureRenameDialog})}
            featureModel={props.featureModel!}
            settings={props.settings!}
            onSetFeatureName={props.onSetFeatureName!}
            {...props.overlayProps}/>}

        {props.overlay === OverlayType.featureSetDescriptionDialog &&
        <FeatureSetDescriptionDialog
            isOpen={true}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.featureSetDescriptionDialog})}
            featureModel={props.featureModel!}
            settings={props.settings!}
            onSetFeatureDescription={props.onSetFeatureDescription!}
            {...props.overlayProps}/>}

        {props.overlay === OverlayType.addArtifactPanel &&
        <AddArtifactPanel
            isOpen={true}
            onDismissed={() => props.onHideOverlay!({overlay: OverlayType.addArtifactPanel})}
            onAddArtifact={props.onAddArtifact!}
            artifactPaths={props.artifactPaths!}
            {...props.overlayProps}/>}

        {props.overlay === OverlayType.userProfilePanel &&
        <UserProfilePanel
            isOpen={true}
            onDismissed={() => props.onHideOverlay!({overlay: OverlayType.userProfilePanel})}
            onSetUserProfile={props.onSetUserProfile!}
            myself={props.myself!}
            {...props.overlayProps}/>}

        {props.overlay === OverlayType.shareDialog &&
        <ShareDialog
            isOpen={true}
            onDismiss={() => props.onHideOverlay!({overlay: OverlayType.shareDialog})}
            currentArtifactPath={props.currentArtifactPath}
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
            featureModel={props.featureModel!}
            onCreateFeatureAbove={props.onCreateFeatureAbove!}
            onCreateFeatureBelow={props.onCreateFeatureBelow!}
            onRemoveFeature={props.onRemoveFeature!}
            onRemoveFeatureSubtree={props.onRemoveFeatureSubtree!}
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
            featureModel={props.featureModel!}
            isSelectMultipleFeatures={props.isSelectMultipleFeatures!}
            selectedFeatureIDs={props.selectedFeatureIDs!}
            onCreateFeatureAbove={props.onCreateFeatureAbove!}
            onCreateFeatureBelow={props.onCreateFeatureBelow!}
            onRemoveFeature={props.onRemoveFeature!}
            onRemoveFeatureSubtree={props.onRemoveFeatureSubtree!}
            onSetFeatureAbstract={props.onSetFeatureAbstract!}
            onSetFeatureHidden={props.onSetFeatureHidden!}
            onSetFeatureOptional={props.onSetFeatureOptional!}
            onSetFeatureAnd={props.onSetFeatureAnd!}
            onSetFeatureOr={props.onSetFeatureOr!}
            onSetFeatureAlternative={props.onSetFeatureAlternative!}
            {...props.overlayProps}/>}
    </React.Fragment>
);

export default withRouter(connect(
    logger.mapStateToProps('OverlayContainer', (state: State): StateDerivedProps => {
        const collaborativeSession = getCurrentCollaborativeSession(state),
            props: StateDerivedProps = {
                settings: state.settings,
                overlay: state.overlay,
                overlayProps: state.overlayProps,
                artifactPaths: state.artifactPaths,
                currentArtifactPath: getCurrentArtifactPath(state.collaborativeSessions),
                collaborativeSessions: state.collaborativeSessions,
                myself: state.myself
            };
        if (!collaborativeSession || !isFeatureDiagramCollaborativeSession(collaborativeSession))
            return props;
        return {
            ...props,
            featureDiagramLayout: collaborativeSession.layout,
            isSelectMultipleFeatures: collaborativeSession.isSelectMultipleFeatures,
            selectedFeatureIDs: collaborativeSession.selectedFeatureIDs,
            featureModel: getCurrentFeatureModel(state)
        };
    }),
    (dispatch): StateDerivedProps => ({
        onFitToScreen: () => dispatch(actions.ui.featureDiagram.fitToScreen()),
        onSetFeatureDiagramLayout: payload => dispatch(actions.ui.featureDiagram.setLayout(payload)),
        onAddArtifact: payload => dispatch<any>(actions.server.addArtifact(payload)),
        onRemoveArtifact: payload => dispatch<any>(actions.server.removeArtifact(payload)),
        onLeaveRequest: payload => dispatch<any>(actions.server.leaveRequest(payload)),
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
        onCreateFeatureAbove: payload => dispatch<any>(actions.server.featureDiagram.feature.createAbove(payload)),
        onCreateFeatureBelow: payload => dispatch<any>(actions.server.featureDiagram.feature.createBelow(payload)),
        onRemoveFeature: payload => dispatch<any>(actions.server.featureDiagram.feature.remove(payload)),
        onRemoveFeatureSubtree: payload => dispatch<any>(actions.server.featureDiagram.feature.removeSubtree(payload)),
        onMoveFeatureSubtree: payload => dispatch<any>(actions.server.featureDiagram.feature.moveSubtree(payload)),
        onSetFeatureAbstract: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAbstract(payload)),
        onSetFeatureHidden: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setHidden(payload)),
        onSetFeatureOptional: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setOptional(payload)),
        onSetFeatureAnd: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAnd(payload)),
        onSetFeatureOr: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setOr(payload)),
        onSetFeatureAlternative: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAlternative(payload)),
        onCreateConstraint: payload => dispatch<any>(actions.server.featureDiagram.constraint.create(payload)),
        onSetConstraint: payload => dispatch<any>(actions.server.featureDiagram.constraint.set(payload)),
        onRemoveConstraint: payload => dispatch<any>(actions.server.featureDiagram.constraint.remove(payload)),
        onSetFeatureName: payload => dispatch<any>(actions.server.featureDiagram.feature.setName(payload)),
        onSetFeatureDescription: payload => dispatch<any>(actions.server.featureDiagram.feature.setDescription(payload)),
        onSetUserProfile: payload => dispatch<any>(actions.server.setUserProfile(payload))
    })
)(OverlayContainer));