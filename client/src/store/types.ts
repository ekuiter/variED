import FeatureModel from '../server/FeatureModel';
import {defaultSettings} from './settings';
import {layoutTypes, Message} from '../types';

export interface State {
    server: {
        users: string[],
        featureModel?: FeatureModel
    },
    settings: object,
    ui: {
        featureDiagram: {
            layout: string,
            isSelectMultipleFeatures: boolean,
            selectedFeatureNames: string[],
            collapsedFeatureNames: string[]
        },
        overlay?: string, // TODO
        overlayProps?: object // TODO
    }
};

// Props that may derived from the state to use in React components.
// This enforces the convention that a prop called 'on...' has the same type in all components.
export type StateDerivedProps = Partial<{
    handleMessage: (message: Message) => void,
    users: string[],
    settings: object,
    featureDiagramLayout: string,
    isSelectMultipleFeatures: boolean,
    selectedFeatureNames: string[],
    featureModel?: FeatureModel,
    overlay?: string,
    overlayProps?: object
    onSelectFeature: (payload: {featureName: string}) => void,
    onDeselectFeature: (payload: {featureName: string}) => void,
    onSelectAllFeatures: () => void,
    onDeselectAllFeatures: () => void,
    onCollapseAllFeatures: () => void,
    onExpandAllFeatures: () => void,
    onSetFeatureDiagramLayout: (payload: {layout: string}) => void,
    onSetSelectMultipleFeatures: (payload: {isSelectMultipleFeatures: boolean}) => void,
    onCollapseFeatures: (payload: {featureNames: string[]}) => void,
    onExpandFeatures: (payload: {featureNames: string[]}) => void,
    onCollapseFeaturesBelow: (payload: {featureNames: string[]}) => void,
    onExpandFeaturesBelow: (payload: {featureNames: string[]}) => void,
    onShowOverlay: (payload: {overlay: string, overlayProps?: object, selectOneFeature?: string}) => void,
    onHideOverlay: (payload: {overlay: string}) => void,
    onHideOverlayFn: (payload: {overlay: string}) => () => void,
    onFitToScreen: () => void
}>;

export const initialState: State = {
    server: {
        users: [],
        featureModel: undefined
    },
    settings: defaultSettings,
    ui: {
        featureDiagram: {
            layout: layoutTypes.verticalTree,
            isSelectMultipleFeatures: false,
            selectedFeatureNames: [],
            collapsedFeatureNames: []
        },
        overlay: undefined,
        overlayProps: undefined
    }
};