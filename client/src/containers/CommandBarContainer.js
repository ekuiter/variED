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

/* eslint-disable react/prop-types */
const CommandBarContainer = props => (
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
        featureModel: getFeatureModel(state)
    }),
    dispatch => ({
        onSetFeatureDiagramLayout: layout => dispatch(actions.ui.featureDiagram.setLayout(layout)),
        onSetSelectMultipleFeatures: isSelectMultipleFeatures => dispatch(actions.ui.featureDiagram.feature.setSelectMultiple(isSelectMultipleFeatures)),
        onSelectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.selectAll()),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onCollapseAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.collapseAll()),
        onExpandAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.expandAll()),
        onCollapseFeatures: featureNames => dispatch(actions.ui.featureDiagram.feature.collapse(featureNames)),
        onExpandFeatures: featureNames => dispatch(actions.ui.featureDiagram.feature.expand(featureNames)),
        onCollapseFeaturesBelow: featureNames => dispatch(actions.ui.featureDiagram.feature.collapseBelow(featureNames)),
        onExpandFeaturesBelow: featureNames => dispatch(actions.ui.featureDiagram.feature.expandBelow(featureNames)),
        onShowOverlay: (...args) => dispatch(actions.ui.overlay.show(...args)),
        onFitToScreen: () => dispatch(actions.ui.featureDiagram.fitToScreen())
    })
)(CommandBarContainer);
