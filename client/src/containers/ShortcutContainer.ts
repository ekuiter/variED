/**
 * Manages the application's global shortcuts.
 */

import withKeys from '../helpers/withKeys';
import {OverlayType, isFloatingFeatureOverlay} from '../types';
import {getShortcutKeyBinding} from '../shortcuts';
import {removeCommand, collapseCommand} from '../components/commands';
import {connect} from 'react-redux';
import {getFeatureModel} from '../store/selectors';
import actions from '../store/actions';
import {State, StateDerivedProps} from '../store/types';

const ifGlobal = (props: StateDerivedProps) => !props.overlay,
    ifFloatingFeature = (props: StateDerivedProps) => isFloatingFeatureOverlay(props.overlay!),
    ifSingleFloatingFeature = (props: StateDerivedProps) => ifFloatingFeature(props) && !props.isSelectMultipleFeatures;

export default connect(
    (state: State): StateDerivedProps => ({
        isSelectMultipleFeatures: state.ui.featureDiagram.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.featureDiagram.selectedFeatureNames,
        featureModel: getFeatureModel(state),
        overlay: state.ui.overlay,
        overlayProps: state.ui.overlayProps
    }),
    (dispatch): StateDerivedProps => ({
        onSelectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.selectAll()),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onCollapseAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.collapseAll()),
        onExpandAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.expandAll()),
        onCollapseFeatures: payload => dispatch(actions.ui.featureDiagram.feature.collapse(payload)),
        onExpandFeatures: payload => dispatch(actions.ui.featureDiagram.feature.expand(payload)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload)),
        onHideOverlay: payload => dispatch(actions.ui.overlay.hide(payload))
    })
)(withKeys(
    getShortcutKeyBinding('undo', ifGlobal, actions.server.undo),
    getShortcutKeyBinding('redo', ifGlobal, actions.server.redo),
    getShortcutKeyBinding('settings', ifGlobal, ({props}: {props: any}) => props.onShowOverlay({overlay: OverlayType.settingsPanel})),
    getShortcutKeyBinding('featureDiagram.feature.selectAll', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onSelectAllFeatures!()),
    getShortcutKeyBinding('featureDiagram.feature.deselectAll', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onDeselectAllFeatures!()),

    getShortcutKeyBinding(
        'featureDiagram.feature.new',
        ifSingleFloatingFeature,
        ({props}: {props: StateDerivedProps}) =>
            actions.server.featureDiagram.feature.addBelow({belowFeatureName: props.overlayProps!.featureName!})
                .then(() => props.onHideOverlay!({overlay: props.overlay!}))),

    getShortcutKeyBinding(
        'featureDiagram.feature.remove',
        (props: StateDerivedProps) => props.isSelectMultipleFeatures || ifFloatingFeature(props),
        ({props}: {props: StateDerivedProps}) => {
            const {disabled, action} = removeCommand(props.featureModel!.getFeatures(props.selectedFeatureNames!));
            if (!disabled)
                action().then(() => props.onHideOverlay!({overlay: props.overlay!}));
        }),

    getShortcutKeyBinding(
        'featureDiagram.feature.rename',
        ifSingleFloatingFeature,
        ({props}: {props: StateDerivedProps}) => props.onShowOverlay!({overlay: OverlayType.featureRenameDialog, overlayProps: {featureName: props.overlayProps!.featureName}})),

    getShortcutKeyBinding(
        'featureDiagram.feature.details',
        ifSingleFloatingFeature,
        ({props}: {props: StateDerivedProps}) => props.onShowOverlay!({overlay: OverlayType.featurePanel, overlayProps: {featureName: props.overlayProps!.featureName}})),

    getShortcutKeyBinding(
        'featureDiagram.feature.collapse',
        (props: StateDerivedProps) => ifGlobal(props) || ifFloatingFeature(props),
        ({props}: {props: StateDerivedProps}) => {
            if (ifGlobal(props) && !props.isSelectMultipleFeatures) {
                props.onCollapseAllFeatures!();
                return;
            }
            const {disabled, action} = collapseCommand(
                props.featureModel!.getFeatures(props.selectedFeatureNames!),
                props.onCollapseFeatures!, props.onExpandFeatures!,
                !ifGlobal(props) ? (() => props.onHideOverlay!({overlay: props.overlay!})) : undefined);
            if (!disabled)
                action(props.onCollapseFeatures);
        }),

    getShortcutKeyBinding(
        'featureDiagram.feature.expand',
        (props: StateDerivedProps) => ifGlobal(props) || ifFloatingFeature(props),
        ({props}: {props: StateDerivedProps}) => {
            if (ifGlobal(props) && !props.isSelectMultipleFeatures) {
                props.onExpandAllFeatures!();
                return;
            }
            const {disabled, action} = collapseCommand(
                props.featureModel!.getFeatures(props.selectedFeatureNames!),
                props.onCollapseFeatures!, props.onExpandFeatures!,
                !ifGlobal(props) ? (() => props.onHideOverlay!({overlay: props.overlay!})) : undefined);
            if (!disabled)
                action(props.onExpandFeatures);
        })
)(<any>(() => null)));