import contextualMenuItems from '../components/contextualMenuItems';
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
                    contextualMenuItems.featureDiagram.export(props.featureDiagramLayout, props.onShowOverlay)
                ]
            }
        }, {
            key: 'edit',
            text: i18n.t('commands.edit'),
            subMenuProps: {
                items: [
                    contextualMenuItems.featureDiagram.undo(),
                    contextualMenuItems.featureDiagram.redo(),
                    {key: 'divider', itemType: ContextualMenuItemType.Divider},
                    contextualMenuItems.featureDiagram.features.selectAll(props.onSelectAllFeatures),
                    contextualMenuItems.featureDiagram.features.deselectAll(props.onDeselectAllFeatures),
                    contextualMenuItems.featureDiagram.selection(
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
                    contextualMenuItems.featureDiagram.setLayout(
                        props.featureDiagramLayout,
                        props.onSetFeatureDiagramLayout),
                    {key: 'divider1', itemType: ContextualMenuItemType.Divider},
                    contextualMenuItems.featureDiagram.features.collapseAll(props.onCollapseAllFeatures),
                    contextualMenuItems.featureDiagram.features.expandAll(props.onExpandAllFeatures),
                    {key: 'divider2', itemType: ContextualMenuItemType.Divider},
                    contextualMenuItems.settings(props.onShowOverlay)
                ]
            }
        }, {
            key: 'help',
            text: i18n.t('commands.help'),
            subMenuProps: {
                items: [
                    contextualMenuItems.about(props.onShowOverlay)
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
        featureDiagramLayout: state.ui.featureDiagramLayout,
        isSelectMultipleFeatures: state.ui.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.selectedFeatureNames,
        users: state.server.users,
        settings: state.settings,
        featureModel: getFeatureModel(state),
        isKeyBindingActive: !state.ui.overlay
    }),
    dispatch => ({
        onSetFeatureDiagramLayout: layout => dispatch(actions.ui.setFeatureDiagramLayout(layout)),
        onSetSelectMultipleFeatures: isSelectMultipleFeatures => dispatch(actions.ui.features.setSelectMultiple(isSelectMultipleFeatures)),
        onSelectAllFeatures: () => dispatch(actions.ui.features.selectAll()),
        onDeselectAllFeatures: () => dispatch(actions.ui.features.deselectAll()),
        onCollapseAllFeatures: () => dispatch(actions.ui.features.collapseAll()),
        onExpandAllFeatures: () => dispatch(actions.ui.features.expandAll()),
        onShowOverlay: (...args) => dispatch(actions.ui.overlay.show(...args))
    })
)(withKeys(
    getShortcutKeyBinding('undo', actions.server.undo),
    getShortcutKeyBinding('redo', actions.server.redo),
    getShortcutKeyBinding('settings', ({props}) => props.onShowOverlay(overlayTypes.settingsPanel)),
    getShortcutKeyBinding('featureDiagram.features.selectAll', ({props}) => props.onSelectAllFeatures()),
    getShortcutKeyBinding('featureDiagram.features.deselectAll', ({props}) => props.onDeselectAllFeatures()),
    getShortcutKeyBinding('featureDiagram.features.collapseAll', ({props}) => props.onCollapseAllFeatures()),
    getShortcutKeyBinding('featureDiagram.features.expandAll', ({props}) => props.onExpandAllFeatures()),
)(CommandBarContainer));