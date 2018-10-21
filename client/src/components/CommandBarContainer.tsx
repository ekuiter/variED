/**
 * Manages the application's global command bar.
 */

import commands, {makeDivider} from './commands';
import UserFacepile from './UserFacepile';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import React from 'react';
import {connect} from 'react-redux';
import {getFeatureModel} from '../store/selectors';
import actions from '../store/actions';
import i18n from '../i18n';
import {State, StateDerivedProps} from '../store/types';
import logger from '../helpers/logger';

const CommandBarContainer = (props: StateDerivedProps) => (
    <CommandBar
        items={[{
            key: 'file',
            text: i18n.t('commands.file'),
            subMenuProps: {
                items: [
                    commands.featureDiagram.export(props.featureDiagramLayout!, props.onShowOverlay!)
                ]
            }
        }, {
            key: 'edit',
            text: i18n.t('commands.edit'),
            subMenuProps: {
                items: [
                    commands.undo(props.onUndo!),
                    commands.redo(props.onRedo!),
                    makeDivider(),
                    commands.featureDiagram.feature.selectAll(props.onSelectAllFeatures!),
                    commands.featureDiagram.feature.deselectAll(props.onDeselectAllFeatures!),
                    commands.featureDiagram.feature.selection(
                        props.isSelectMultipleFeatures!, props.onSetSelectMultipleFeatures!, props.selectedFeatureNames!,
                        props.onDeselectAllFeatures!, props.onCollapseFeatures!, props.onExpandFeatures!,
                        props.onCollapseFeaturesBelow!, props.onExpandFeaturesBelow!, props.onAddFeatureAbove!,
                        props.onRemoveFeatures!, props.onRemoveFeaturesBelow!, props.onSetFeatureAbstract!,
                        props.onSetFeatureHidden!, props.onSetFeatureMandatory!, props.onSetFeatureAnd!,
                        props.onSetFeatureOr!, props.onSetFeatureAlternative!, props.featureModel!)
                ]
            }
        }, {
            key: 'view',
            text: i18n.t('commands.view'),
            subMenuProps: {
                items: [
                    commands.featureDiagram.setLayout(
                        props.featureDiagramLayout!,
                        props.onSetFeatureDiagramLayout!),
                    makeDivider(),
                    commands.featureDiagram.feature.collapseAll(props.onCollapseAllFeatures!),
                    commands.featureDiagram.feature.expandAll(props.onExpandAllFeatures!),
                    commands.featureDiagram.fitToScreen(props.onFitToScreen!)
                ]
            }
        }, {
            key: 'more',
            text: i18n.t('commands.more'),
            subMenuProps: {
                items: [
                    commands.commandPalette(props.onShowOverlay!),
                    commands.settings(props.onShowOverlay!),
                    commands.about(props.onShowOverlay!)
                ]
            }
        }]}
        farItems={[
            {
                key: 'userFacepile',
                onRender: () =>
                    <UserFacepile
                        users={props.users!}
                        settings={props.settings!}/>
            }
        ]}/>
);

export default connect(
    logger.mapStateToProps('CommandBarContainer', (state: State): StateDerivedProps => ({
        featureDiagramLayout: state.ui.featureDiagram.layout,
        isSelectMultipleFeatures: state.ui.featureDiagram.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.featureDiagram.selectedFeatureNames,
        users: state.server.users,
        settings: state.settings,
        featureModel: getFeatureModel(state)
    })),
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
        onAddFeatureAbove: payload => dispatch<any>(actions.server.featureDiagram.feature.addAbove(payload)),
        onRemoveFeatures: payload => dispatch<any>(actions.server.featureDiagram.feature.remove(payload)),
        onRemoveFeaturesBelow: payload => dispatch<any>(actions.server.featureDiagram.feature.removeBelow(payload)),
        onSetFeatureAbstract: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAbstract(payload)),
        onSetFeatureHidden: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setHidden(payload)),
        onSetFeatureMandatory: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setMandatory(payload)),
        onSetFeatureAnd: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAnd(payload)),
        onSetFeatureOr: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setOr(payload)),
        onSetFeatureAlternative: payload => dispatch<any>(actions.server.featureDiagram.feature.properties.setAlternative(payload))
    })
)(CommandBarContainer);
