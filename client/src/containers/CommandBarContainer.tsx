/**
 * Manages the application's global command bar.
 */

import commands, {makeDivider} from '../components/commands';
import UserFacepile from '../components/UserFacepile';
import {CommandBar} from 'office-ui-fabric-react/lib/CommandBar';
import React from 'react';
import {connect} from 'react-redux';
import {getFeatureModel} from '../store/selectors';
import actions from '../store/actions';
import i18n from '../i18n';
import {State, StateDerivedProps} from '../store/types';

const CommandBarContainer = (props: StateDerivedProps) => (
    <CommandBar
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
                    commands.undo(),
                    commands.redo(),
                    makeDivider(),
                    commands.featureDiagram.feature.selectAll(props.onSelectAllFeatures),
                    commands.featureDiagram.feature.deselectAll(props.onDeselectAllFeatures),
                    commands.featureDiagram.feature.selection(
                        props.isSelectMultipleFeatures,
                        props.onSetSelectMultipleFeatures,
                        props.selectedFeatureNames,
                        props.onDeselectAllFeatures,
                        props.onCollapseFeatures,
                        props.onExpandFeatures,
                        props.onCollapseFeaturesBelow,
                        props.onExpandFeaturesBelow,
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
                        users={props.users!}
                        settings={props.settings!}/>
            }
        ]}/>
);

export default connect(
    (state: State): StateDerivedProps => ({
        featureDiagramLayout: state.ui.featureDiagram.layout,
        isSelectMultipleFeatures: state.ui.featureDiagram.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.featureDiagram.selectedFeatureNames,
        users: state.server.users,
        settings: state.settings,
        featureModel: getFeatureModel(state)
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
        onFitToScreen: () => dispatch(actions.ui.featureDiagram.fitToScreen())
    })
)(CommandBarContainer);
