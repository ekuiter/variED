/**
 * Manages the application's global command bar.
 */

import commands, {makeDivider} from './commands';
import CollaboratorFacepile from './CollaboratorFacepile';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import React from 'react';
import {connect} from 'react-redux';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentFeatureModel} from '../store/selectors';
import actions from '../store/actions';
import i18n from '../i18n';
import {State, StateDerivedProps} from '../store/types';
import logger from '../helpers/logger';
import {enableConstraintsView} from './constraintsView/ConstraintsView';
import {withRouter} from 'react-router';
import {RouteProps, artifactPathToString} from '../types';
import {redirectToArtifactPath} from 'src/router';

const CommandBarContainer = (props: StateDerivedProps & RouteProps) => (
    <CommandBar
        items={[{
                key: 'file',
                text: i18n.t('commands.file'),
                subMenuProps: {
                    items: [
                        ...props.collaborativeSessions!.length > 1
                            ? [{
                                key: 'collaborativeSessions',
                                text: props.currentArtifactPath
                                    ? artifactPathToString(props.currentArtifactPath!)
                                    : i18n.t('commandPalette.switch'),
                                subMenuProps: {
                                    items: props.collaborativeSessions!
                                        .map(collaborativeSession => {
                                            const artifactPathString = artifactPathToString(collaborativeSession.artifactPath);
                                            return {
                                                key: artifactPathString,
                                                text: artifactPathString,
                                                onClick: () => redirectToArtifactPath(collaborativeSession.artifactPath)
                                            };
                                        })
                                }
                            }]
                            : [],
                        commands.featureDiagram.addArtifact(props.onShowOverlay!),
                        ...props.featureModel
                            ? [commands.featureDiagram.share(props.onShowOverlay!),
                                commands.featureDiagram.export(props.featureDiagramLayout!, props.onShowOverlay!)]
                            : []
                    ]
                }
            },
            ...props.featureModel
                ? [{
                    key: 'edit',
                    text: i18n.t('commands.edit'),
                    subMenuProps: {
                        items: [
                            // TODO: until we have proper undo/redo support
                            //commands.undo(props.onUndo!),
                            //commands.redo(props.onRedo!),
                            //makeDivider(),
                            commands.featureDiagram.feature.selectAll(props.onSelectAllFeatures!),
                            commands.featureDiagram.feature.deselectAll(props.onDeselectAllFeatures!),
                            commands.featureDiagram.feature.selection(
                                props.isSelectMultipleFeatures!, props.onSetSelectMultipleFeatures!, props.selectedFeatureIDs!,
                                props.onDeselectAllFeatures!, props.onCollapseFeatures!, props.onExpandFeatures!,
                                props.onCollapseFeaturesBelow!, props.onExpandFeaturesBelow!, props.onCreateFeatureAbove!,
                                props.onRemoveFeature!, props.onRemoveFeatureSubtree!, props.onSetFeatureAbstract!,
                                props.onSetFeatureHidden!, props.onSetFeatureOptional!, props.onSetFeatureAnd!,
                                props.onSetFeatureOr!, props.onSetFeatureAlternative!, props.featureModel!)
                        ]
                    }
                }]
                : [],
            ...props.featureModel
                ? [{
                    key: 'view',
                    text: i18n.t('commands.view'),
                    subMenuProps: {
                        items: [
                            commands.featureDiagram.setLayout(
                                props.featureDiagramLayout!,
                                props.onSetFeatureDiagramLayout!),
                            ...enableConstraintsView(props.featureModel)
                                ? [makeDivider(),
                                    commands.featureDiagram.showConstraintView(
                                        props.onSetSetting!, props.settings!.views.splitAt),
                                    commands.featureDiagram.splitConstraintViewHorizontally(
                                        props.onSetSetting!, props.settings!.views.splitDirection)]
                                : [],
                            makeDivider(),
                            commands.featureDiagram.feature.collapseAll(props.onCollapseAllFeatures!),
                            commands.featureDiagram.feature.expandAll(props.onExpandAllFeatures!),
                            commands.featureDiagram.fitToScreen(props.onFitToScreen!)
                        ]
                    }
                }]
                : [],
            {
                key: 'tools',
                text: i18n.t('commands.tools'),
                subMenuProps: {
                    items: [
                        commands.commandPalette(props.onShowOverlay!),
                        commands.settings(props.onShowOverlay!),
                        commands.about(props.onShowOverlay!)
                    ]
                }
            }
        ]}
        farItems={[{
            key: 'collaboratorFacepile',
            onRender: () =>
                <CollaboratorFacepile
                    users={props.collaborators!}
                    settings={props.settings!}
                    user={props.myself}/>
        }]}/>
);

export default withRouter(connect(
    logger.mapStateToProps('CommandBarContainer', (state: State): StateDerivedProps => {
        const collaborativeSession = getCurrentCollaborativeSession(state),
            props: StateDerivedProps = {
                settings: state.settings,
                myself: state.myself,
                collaborators: [],
                collaborativeSessions: state.collaborativeSessions
            };
        if (!collaborativeSession || !isFeatureDiagramCollaborativeSession(collaborativeSession))
            return props;
        return {
            ...props,
            featureDiagramLayout: collaborativeSession.layout,
            isSelectMultipleFeatures: collaborativeSession.isSelectMultipleFeatures,
            selectedFeatureIDs: collaborativeSession.selectedFeatureIDs,
            collaborators: collaborativeSession.collaborators,
            featureModel: getCurrentFeatureModel(state),
            currentArtifactPath: collaborativeSession.artifactPath
        };
    }),
    (dispatch): StateDerivedProps => ({
        onSetFeatureDiagramLayout: payload => dispatch(actions.ui.featureDiagram.setLayout(payload)),
        onSetSelectMultipleFeatures: payload => dispatch(actions.ui.featureDiagram.feature.setSelectMultiple(payload)),
        onSelectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.selectAll()),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onCollapseAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.collapseAll()),
        onExpandAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.expandAll()),
        onCollapseFeatures: payload => dispatch(actions.ui.featureDiagram.feature.collapse(payload)),
        onExpandFeatures: payload => dispatch(actions.ui.featureDiagram.feature.expand(payload)),
        onCollapseFeaturesBelow: payload => dispatch(actions.ui.featureDiagram.feature.collapseBelow(payload)),
        onExpandFeaturesBelow: payload => dispatch(actions.ui.featureDiagram.feature.expandBelow(payload)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload)),
        onFitToScreen: () => dispatch(actions.ui.featureDiagram.fitToScreen()),
        onUndo: () => dispatch<any>(actions.server.undo({})),
        onRedo: () => dispatch<any>(actions.server.redo({})),
        onCreateFeatureAbove: payload => dispatch<any>(actions.server.featureDiagram.feature.createAbove(payload)),
        onRemoveFeature: payload => dispatch<any>(actions.server.featureDiagram.feature.remove(payload)),
        onRemoveFeatureSubtree: payload => dispatch<any>(actions.server.featureDiagram.feature.removeSubtree(payload)),
        onSetFeatureAbstract: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAbstract(payload)),
        onSetFeatureHidden: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setHidden(payload)),
        onSetFeatureOptional: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setOptional(payload)),
        onSetFeatureAnd: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAnd(payload)),
        onSetFeatureOr: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setOr(payload)),
        onSetFeatureAlternative: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAlternative(payload)),
        onSetSetting: payload => dispatch(actions.settings.set(payload))
    })
)(CommandBarContainer));
