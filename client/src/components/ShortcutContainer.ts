/**
 * Manages the application's global shortcuts.
 */

import withKeys from '../helpers/withKeys';
import {OverlayType, isFloatingFeatureOverlay} from '../types';
import {getShortcutKeyBinding} from '../shortcuts';
import {removeCommand, collapseCommand} from './commands';
import {connect} from 'react-redux';
import {getFeatureModel} from '../store/selectors';
import actions from '../store/actions';
import {State, StateDerivedProps} from '../store/types';
import logger from '../helpers/logger';

const ifGlobal = (props: StateDerivedProps) => props.overlay === OverlayType.none,
    ifFloatingFeature = (props: StateDerivedProps) => isFloatingFeatureOverlay(props.overlay!),
    ifSingleFloatingFeature = (props: StateDerivedProps) => ifFloatingFeature(props) && !props.isSelectMultipleFeatures;

export default connect(
    logger.mapStateToProps('ShortcutContainer', (state: State): StateDerivedProps => ({
        isSelectMultipleFeatures: state.ui.featureDiagram.isSelectMultipleFeatures,
        selectedFeatureNames: state.ui.featureDiagram.selectedFeatureNames,
        featureModel: getFeatureModel(state),
        overlay: state.ui.overlay,
        overlayProps: state.ui.overlayProps
    })),
    (dispatch): StateDerivedProps => ({
        onSelectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.selectAll()),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onCollapseAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.collapseAll()),
        onExpandAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.expandAll()),
        onCollapseFeatures: payload => dispatch(actions.ui.featureDiagram.feature.collapse(payload)),
        onExpandFeatures: payload => dispatch(actions.ui.featureDiagram.feature.expand(payload)),
        onAddFeatureBelow: payload => dispatch<any>(actions.server.featureDiagram.feature.addBelow(payload)),
        onRemoveFeatures: payload => dispatch<any>(actions.server.featureDiagram.feature.remove(payload)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload)),
        onHideOverlay: payload => dispatch(actions.ui.overlay.hide(payload)),
        onUndo: () => dispatch<any>(actions.server.undo({})),
        onRedo: () => dispatch<any>(actions.server.redo({}))
    })
)(withKeys(
    getShortcutKeyBinding('commandPalette', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onShowOverlay!({overlay: OverlayType.commandPalette, overlayProps: {}})),
    getShortcutKeyBinding('undo', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onUndo!()),
    getShortcutKeyBinding('redo', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onRedo!()),
    getShortcutKeyBinding('settings', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onShowOverlay!({overlay: OverlayType.settingsPanel, overlayProps: {}})),
    getShortcutKeyBinding('featureDiagram.feature.selectAll', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onSelectAllFeatures!()),
    getShortcutKeyBinding('featureDiagram.feature.deselectAll', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onDeselectAllFeatures!()),

    getShortcutKeyBinding(
        'featureDiagram.feature.new',
        ifSingleFloatingFeature,
        async ({props}: {props: StateDerivedProps}) => {
            await props.onAddFeatureBelow!({belowFeatureName: props.overlayProps!.featureName!});
            props.onHideOverlay!({overlay: props.overlay!});
        }),

    getShortcutKeyBinding(
        'featureDiagram.feature.remove',
        (props: StateDerivedProps) => props.isSelectMultipleFeatures || ifFloatingFeature(props),
        async ({props}: {props: StateDerivedProps}) => {
            const {disabled, action} = removeCommand(props.featureModel!.getFeatures(props.selectedFeatureNames!), props.onRemoveFeatures!);
            if (!disabled) {
                await action();
                props.onHideOverlay!({overlay: props.overlay!});
            }
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