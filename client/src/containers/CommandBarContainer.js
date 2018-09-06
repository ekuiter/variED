import commands, {makeDivider} from '../components/commands';
import UserFacepile from '../components/UserFacepile';
import {CommandBar} from '../../node_modules/office-ui-fabric-react/lib/CommandBar';
import React from 'react';
import connect from 'react-redux/es/connect/connect';
import {getFeatureModel} from '../store/selectors';
import actions from '../store/actions';
import withKeys from '../helpers/withKeys';
import {ContextualMenuItemType} from '../../node_modules/office-ui-fabric-react/lib/ContextualMenu';
import i18n from '../i18n';
import {overlayTypes} from '../types';
import {getShortcutKeyBinding} from '../shortcuts';

/* eslint-disable react/prop-types */
const CommandBarContainer = props => (
    <CommandBar
        // Clicking on submenu items throws
        // "Warning: Can't call setState (or forceUpdate) on an unmounted component".
        // This is a known issue in Office UI Fabric:
        // https://github.com/OfficeDev/office-ui-fabric-react/issues/5433
        // TODO: wait for fix ...
        items={[{
            key: 'file',
            text: i18n.t('commands.file'),
            subMenuProps: {
                items: [
                    commands.featureDiagram.export(props.featureDiagramLayout, props.onShowOverlay)
                ]
            }
        }, {
            key: 'edit',
            text: i18n.t('commands.edit'),
            subMenuProps: {
                items: [
                    commands.featureDiagram.undo(),
                    commands.featureDiagram.redo(),
                    makeDivider(),
                    commands.featureDiagram.feature.selectAll(props.onSelectAllFeatures),
                    commands.featureDiagram.feature.deselectAll(props.onDeselectAllFeatures),
                    commands.featureDiagram.feature.selection(
                        props.isSelectMultipleFeatures,
                        props.onSetSelectMultipleFeatures,
                        props.selectedFeatureNames,
                        props.onDeselectAllFeatures,
                        props.featureModel)
                ]
            }
        }, {
            key: 'view',
            text: i18n.t('commands.view'),
            subMenuProps: {
                items: [
                    commands.featureDiagram.setLayout(
                        props.featureDiagramLayout,
                        props.onSetFeatureDiagramLayout),
                    makeDivider(),
                    commands.featureDiagram.feature.collapseAll(props.onCollapseAllFeatures),
                    commands.featureDiagram.feature.expandAll(props.onExpandAllFeatures),
                    commands.featureDiagram.fitToScreen(props.onFitToScreen),
                    makeDivider(),
                    commands.settings(props.onShowOverlay)
                ]
            }
        }, {
            key: 'help',
            text: i18n.t('commands.help'),
            subMenuProps: {
                items: [
                    commands.about(props.onShowOverlay)
                ]
            }
        }]}
        farItems={[
            {
                key: 'userFacepile',
                onRender: () =>
                    <UserFacepile
                        users={props.users}
                        settings={props.settings}/>
            }
        ]}/>
);

export default connect(
    state => ({
        featureDiagramLayout: state.ui.featureDiagram.layout,
        isSelectMultipleFeatures: state.ui.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.selectedFeatureNames,
        users: state.server.users,
        settings: state.settings,
        featureModel: getFeatureModel(state),
        isKeyBindingActive: !state.ui.overlay
    }),
    dispatch => ({
        onSetFeatureDiagramLayout: layout => dispatch(actions.ui.featureDiagram.setLayout(layout)),
        onSetSelectMultipleFeatures: isSelectMultipleFeatures => dispatch(actions.ui.featureDiagram.feature.setSelectMultiple(isSelectMultipleFeatures)),
        onSelectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.selectAll()),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onCollapseAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.collapseAll()),
        onExpandAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.expandAll()),
        onShowOverlay: (...args) => dispatch(actions.ui.overlay.show(...args)),
        onFitToScreen: () => dispatch(actions.ui.featureDiagram.fitToScreen())
    })
)(withKeys(
    getShortcutKeyBinding('undo', actions.server.undo),
    getShortcutKeyBinding('redo', actions.server.redo),
    getShortcutKeyBinding('settings', ({props}) => props.onShowOverlay(overlayTypes.settingsPanel)),
    getShortcutKeyBinding('featureDiagram.feature.selectAll', ({props}) => props.onSelectAllFeatures()),
    getShortcutKeyBinding('featureDiagram.feature.deselectAll', ({props}) => props.onDeselectAllFeatures()),
    getShortcutKeyBinding('featureDiagram.feature.collapse', ({props}) => props.onCollapseAllFeatures()),
    getShortcutKeyBinding('featureDiagram.feature.expand', ({props}) => props.onExpandAllFeatures()),
)(CommandBarContainer));
