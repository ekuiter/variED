/**
 * Manages the application's global shortcuts.
 */

import withKeys from '../helpers/withKeys';
import {OverlayType, isFloatingFeatureOverlay} from '../types';
import {getShortcutKeyBinding} from '../shortcuts';
import {collapseCommand} from './commands';
import {connect} from 'react-redux';
import {getCurrentCollaborativeSession, isFeatureDiagramCollaborativeSession, getCurrentFeatureModel} from '../store/selectors';
import actions from '../store/actions';
import {State, StateDerivedProps} from '../store/types';
import logger from '../helpers/logger';
import {preconditions} from '../modeling/preconditions';

const ifFeatureModel = (props: StateDerivedProps) => !!props.featureModel,
    ifGlobal = (props: StateDerivedProps) => props.overlay === OverlayType.none,
    ifFloatingFeature = (props: StateDerivedProps) => isFloatingFeatureOverlay(props.overlay!),
    ifSingleFloatingFeature = (props: StateDerivedProps) => ifFloatingFeature(props) && !props.isSelectMultipleFeatures;

export default connect(
    logger.mapStateToProps('ShortcutContainer', (state: State): StateDerivedProps => {
        const collaborativeSession = getCurrentCollaborativeSession(state),
            props: StateDerivedProps = {
                overlay: state.overlay,
                overlayProps: state.overlayProps
            };
        if (!collaborativeSession || !isFeatureDiagramCollaborativeSession(collaborativeSession))
            return props;
        return {
            ...props,
            isSelectMultipleFeatures: collaborativeSession.isSelectMultipleFeatures,
            selectedFeatureIDs: collaborativeSession.selectedFeatureIDs,
            featureModel: getCurrentFeatureModel(state)
        };
    }),
    (dispatch): StateDerivedProps => ({
        onSelectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.selectAll()),
        onDeselectAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.deselectAll()),
        onCollapseAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.collapseAll()),
        onExpandAllFeatures: () => dispatch(actions.ui.featureDiagram.feature.expandAll()),
        onCollapseFeatures: payload => dispatch(actions.ui.featureDiagram.feature.collapse(payload)),
        onExpandFeatures: payload => dispatch(actions.ui.featureDiagram.feature.expand(payload)),
        onCreateFeatureBelow: payload => dispatch<any>(actions.server.featureDiagram.feature.createBelow(payload)),
        onRemoveFeature: payload => dispatch<any>(actions.server.featureDiagram.feature.remove(payload)),
        onShowOverlay: payload => dispatch(actions.ui.overlay.show(payload)),
        onHideOverlay: payload => dispatch(actions.ui.overlay.hide(payload)),
        onUndo: () => dispatch<any>(actions.server.undo({})),
        onRedo: () => dispatch<any>(actions.server.redo({}))
    })
)(withKeys(
    getShortcutKeyBinding('commandPalette', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onShowOverlay!({overlay: OverlayType.commandPalette, overlayProps: {}})),
    //getShortcutKeyBinding('undo', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onUndo!()), // TODO: until we have proper undo/redo support
    //getShortcutKeyBinding('redo', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onRedo!()),
    getShortcutKeyBinding('settings', ifGlobal, ({props}: {props: StateDerivedProps}) => props.onShowOverlay!({overlay: OverlayType.settingsPanel, overlayProps: {}})),
    
    getShortcutKeyBinding(
        'featureDiagram.feature.selectAll',
        (props: StateDerivedProps) => ifFeatureModel(props) && ifGlobal(props),
        ({props}: {props: StateDerivedProps}) => props.onSelectAllFeatures!()),
    
    getShortcutKeyBinding(
        'featureDiagram.feature.deselectAll',
        (props: StateDerivedProps) => ifFeatureModel(props) && ifGlobal(props),
        ({props}: {props: StateDerivedProps}) => props.onDeselectAllFeatures!()),

    getShortcutKeyBinding(
        'featureDiagram.feature.new',
        (props: StateDerivedProps) => ifFeatureModel(props) && ifSingleFloatingFeature(props),
        async ({props}: {props: StateDerivedProps}) => {
            if (props.overlayProps!.featureID && preconditions.featureDiagram.feature.createBelow(props.overlayProps!.featureID!, props.featureModel!)) {
                await props.onCreateFeatureBelow!({featureParentID: props.overlayProps!.featureID!});
                props.onHideOverlay!({overlay: props.overlay!});
            }
        }),

        
    getShortcutKeyBinding(
        'featureDiagram.feature.remove',
        (props: StateDerivedProps) => ifFeatureModel(props) && (props.isSelectMultipleFeatures || ifFloatingFeature(props)),
        async ({props}: {props: StateDerivedProps}) => {
            const featureIDs = props.isSelectMultipleFeatures
                ? props.selectedFeatureIDs!
                : [props.overlayProps!.featureID!];
                
            if (featureIDs.length > 0 && preconditions.featureDiagram.feature.remove(featureIDs, props.featureModel!)) {
                await props.onRemoveFeature!({featureIDs});
                props.onHideOverlay!({overlay: props.overlay!});
            }
        }),

    getShortcutKeyBinding(
        'featureDiagram.feature.rename',
        (props: StateDerivedProps) => ifFeatureModel(props) && ifSingleFloatingFeature(props),
        ({props}: {props: StateDerivedProps}) => props.onShowOverlay!({overlay: OverlayType.featureRenameDialog, overlayProps: {featureID: props.overlayProps!.featureID}})),

    getShortcutKeyBinding(
        'featureDiagram.feature.details',
        (props: StateDerivedProps) => ifFeatureModel(props) && ifSingleFloatingFeature(props),
        ({props}: {props: StateDerivedProps}) => props.onShowOverlay!({overlay: OverlayType.featurePanel, overlayProps: {featureID: props.overlayProps!.featureID}})),

    getShortcutKeyBinding(
        'featureDiagram.feature.collapse',
        (props: StateDerivedProps) => ifFeatureModel(props) && (ifGlobal(props) || ifFloatingFeature(props)),
        ({props}: {props: StateDerivedProps}) => {
            if (ifGlobal(props) && !props.isSelectMultipleFeatures) {
                props.onCollapseAllFeatures!();
                return;
            }
            const {disabled, action} = collapseCommand(
                props.featureModel!.getFeatures(props.selectedFeatureIDs!),
                props.onCollapseFeatures!, props.onExpandFeatures!,
                !ifGlobal(props) ? (() => props.onHideOverlay!({overlay: props.overlay!})) : undefined);
            if (!disabled)
                action(props.onCollapseFeatures);
        }),

    getShortcutKeyBinding(
        'featureDiagram.feature.expand',
        (props: StateDerivedProps) => ifFeatureModel(props) && (ifGlobal(props) || ifFloatingFeature(props)),
        ({props}: {props: StateDerivedProps}) => {
            if (ifGlobal(props) && !props.isSelectMultipleFeatures) {
                props.onExpandAllFeatures!();
                return;
            }
            const {disabled, action} = collapseCommand(
                props.featureModel!.getFeatures(props.selectedFeatureIDs!),
                props.onCollapseFeatures!, props.onExpandFeatures!,
                !ifGlobal(props) ? (() => props.onHideOverlay!({overlay: props.overlay!})) : undefined);
            if (!disabled)
                action(props.onExpandFeatures);
        })
)(<any>(() => null)));