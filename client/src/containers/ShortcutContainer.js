/**
 * Manages the application's global shortcuts.
 */

import withKeys from '../helpers/withKeys';
import {overlayTypes} from '../types';
import {getShortcutKeyBinding} from '../shortcuts';
import {removeCommand, collapseCommand} from '../components/commands';
import {connect} from 'react-redux';
import {getFeatureModel} from '../store/selectors';
import actions from '../store/actions';

const ifGlobal = props => !props.overlay,
    ifFloatingFeature = props => overlayTypes.isFloatingFeature(props.overlay),
    ifSingleFloatingFeature = props => ifFloatingFeature(props) && !props.isSelectMultipleFeatures;

export default connect(
    state => ({
        isSelectMultipleFeatures: state.ui.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.selectedFeatureNames,
        featureModel: getFeatureModel(state),
        overlay: state.ui.overlay,
        overlayProps: state.ui.overlayProps
    }),
    dispatch => ({
        onSelectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.selectAll()),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onCollapseAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.collapseAll()),
        onExpandAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.expandAll()),
        onCollapseFeatures: featureNames => dispatch(actions.ui.featureDiagram.feature.collapse(featureNames)),
        onExpandFeatures: featureNames => dispatch(actions.ui.featureDiagram.feature.expand(featureNames)),
        onShowOverlay: (...args) => dispatch(actions.ui.overlay.show(...args)),
        onHideOverlayFn: overlay => () => dispatch(actions.ui.overlay.hide(overlay))
    })
)(withKeys(
    getShortcutKeyBinding('undo', ifGlobal, actions.server.undo),
    getShortcutKeyBinding('redo', ifGlobal, actions.server.redo),
    getShortcutKeyBinding('settings', ifGlobal, ({props}) => props.onShowOverlay(overlayTypes.settingsPanel)),
    getShortcutKeyBinding('featureDiagram.feature.selectAll', ifGlobal, ({props}) => props.onSelectAllFeatures()),
    getShortcutKeyBinding('featureDiagram.feature.deselectAll', ifGlobal, ({props}) => props.onDeselectAllFeatures()),

    getShortcutKeyBinding(
        'featureDiagram.feature.new',
        ifSingleFloatingFeature,
        ({props}) =>
            actions.server.featureDiagram.feature.addBelow(props.overlayProps.featureName)
                .then(props.onHideOverlayFn(props.overlay))),

    getShortcutKeyBinding(
        'featureDiagram.feature.remove',
        props => props.isSelectMultipleFeatures || ifFloatingFeature(props),
        ({props}) => {
            const {disabled, action} = removeCommand(props.featureModel.getFeatures(props.selectedFeatureNames));
            if (!disabled)
                action().then(props.onHideOverlayFn(props.overlay));
        }),

    getShortcutKeyBinding(
        'featureDiagram.feature.rename',
        ifSingleFloatingFeature,
        ({props}) => props.onShowOverlay(overlayTypes.featureRenameDialog, {featureName: props.overlayProps.featureName})),

    getShortcutKeyBinding(
        'featureDiagram.feature.details',
        ifSingleFloatingFeature,
        ({props}) => props.onShowOverlay(overlayTypes.featurePanel, {featureName: props.overlayProps.featureName})),

    getShortcutKeyBinding(
        'featureDiagram.feature.collapse',
        props => ifGlobal(props) || ifFloatingFeature(props),
        ({props}) => {
            if (ifGlobal(props) && !props.isSelectMultipleFeatures) {
                props.onCollapseAllFeatures();
                return;
            }
            const {disabled, action} = collapseCommand(
                props.featureModel.getFeatures(props.selectedFeatureNames),
                props.onCollapseFeatures, props.onExpandFeatures,
                !ifGlobal(props) && props.onHideOverlayFn(props.overlay));
            if (!disabled)
                action(props.onCollapseFeatures);
        }),

    getShortcutKeyBinding(
        'featureDiagram.feature.expand',
        props => ifGlobal(props) || ifFloatingFeature(props),
        ({props}) => {
            if (ifGlobal(props) && !props.isSelectMultipleFeatures) {
                props.onExpandAllFeatures();
                return;
            }
            const {disabled, action} = collapseCommand(
                props.featureModel.getFeatures(props.selectedFeatureNames),
                props.onCollapseFeatures, props.onExpandFeatures,
                !ifGlobal(props) && props.onHideOverlayFn(props.overlay));
            if (!disabled)
                action(props.onExpandFeatures);
        })
)(() => null));