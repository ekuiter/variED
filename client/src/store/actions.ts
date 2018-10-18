/**
 * Actions define an interface to update the Redux store.
 * They are plain objects describing a state change.
 */

import messageActions from '../server/messageActions';
import {createStandardAction, ActionType} from 'typesafe-actions';

const actions = {
    settings: {
        set: createStandardAction('settings/set')<{path: string, value: any}>(),
        reset: createStandardAction('settings/reset')<void>()
    },
    ui: {
        featureDiagram: {
            setLayout: createStandardAction('ui/featureDiagram/setLayout')<{layout: string}>(), // TODO
            fitToScreen: createStandardAction('ui/featureDiagram/fitToScreen')<void>(),
            feature: {
                setSelectMultiple: createStandardAction('ui/featureDiagram/feature/setSelectMultiple')<{isSelectMultipleFeatures: boolean}>(),
                select: createStandardAction('ui/featureDiagram/feature/select')<{featureName: string}>(),
                deselect: createStandardAction('ui/featureDiagram/feature/deselect')<{featureName: string}>(),
                selectAll: createStandardAction('ui/featureDiagram/feature/selectAll')<void>(),
                deselectAll: createStandardAction('ui/featureDiagram/feature/deselectAll')<void>(),
                collapse: createStandardAction('ui/featureDiagram/feature/collapse')<{featureNames: string[]}>(),
                expand: createStandardAction('ui/featureDiagram/feature/expand')<{featureNames: string[]}>(),
                collapseAll: createStandardAction('ui/featureDiagram/feature/collapseAll')<void>(),
                expandAll: createStandardAction('ui/featureDiagram/feature/expandAll')<void>(),
                collapseBelow: createStandardAction('ui/featureDiagram/feature/collapseBelow')<{featureNames: string[]}>(),
                expandBelow: createStandardAction('ui/featureDiagram/feature/expandBelow')<{featureNames: string[]}>()
            }
        },
        overlay: {
            // TODO: more accurate types
            show: createStandardAction('ui/overlay/show')<{overlay: string, overlayProps?: object, selectOneFeature?: string}>(),
            hide: createStandardAction('ui/overlay/hide')<{overlay: string}>()
        }
    },
    server: messageActions
};

export default actions;
export type Action = ActionType<typeof actions>;