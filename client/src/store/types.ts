import FeatureModel from '../server/FeatureModel';
import {defaultSettings, Settings} from './settings';
import {Message, FeatureDiagramLayoutType, OverlayType, OverlayProps} from '../types';

export interface State {
    server: {
        users: string[],
        featureModel?: FeatureModel
    },
    settings: Settings,
    ui: {
        featureDiagram: {
            layout: FeatureDiagramLayoutType,
            isSelectMultipleFeatures: boolean,
            selectedFeatureNames: string[],
            collapsedFeatureNames: string[]
        },
        overlay: OverlayType,
        overlayProps: OverlayProps
    }
};

export const initialState: State = {
    server: {
        users: [],
        featureModel: undefined
    },
    settings: defaultSettings,
    ui: {
        featureDiagram: {
            layout: FeatureDiagramLayoutType.verticalTree,
            isSelectMultipleFeatures: false,
            selectedFeatureNames: [],
            collapsedFeatureNames: []
        },
        overlay: OverlayType.none,
        overlayProps: {}
    }
};

export type OnSelectFeatureFunction = (payload: {featureName: string}) => void;
export type OnDeselectFeatureFunction = (payload: {featureName: string}) => void;
export type OnSelectAllFeaturesFunction = () => void;
export type OnDeselectAllFeaturesFunction = () => void;
export type OnCollapseAllFeaturesFunction = () => void;
export type OnExpandAllFeaturesFunction = () => void;
export type OnSetFeatureDiagramLayoutFunction = (payload: {layout: FeatureDiagramLayoutType}) => void;
export type OnSetSelectMultipleFeaturesFunction = (payload: {isSelectMultipleFeatures: boolean}) => void;
export type OnCollapseFeaturesFunction = (payload: {featureNames: string[]}) => void;
export type OnExpandFeaturesFunction = (payload: {featureNames: string[]}) => void;
export type OnCollapseFeaturesBelowFunction = (payload: {featureNames: string[]}) => void;
export type OnExpandFeaturesBelowFunction = (payload: {featureNames: string[]}) => void;
export type OnShowOverlayFunction = (payload: {overlay: OverlayType, overlayProps: OverlayProps, selectOneFeature?: string}) => void;
export type OnHideOverlayFunction = (payload: {overlay: OverlayType}) => void;
export type OnFitToScreenFunction = () => void;
export type OnSetSettingFunction = (payload: {path: string, value: any}) => void;
export type OnResetSettingsFunction = () => void;

// Props that may derived from the state to use in React components.
// This enforces the convention that a prop called 'on...' has the same type in all components.
export type StateDerivedProps = Partial<{
    handleMessage: (message: Message) => void,
    users: string[],
    settings: Settings,
    featureDiagramLayout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedFeatureNames: string[],
    featureModel?: FeatureModel,
    overlay: OverlayType,
    overlayProps: OverlayProps,
    onSelectFeature: OnSelectFeatureFunction,
    onDeselectFeature: OnDeselectFeatureFunction,
    onSelectAllFeatures: OnSelectAllFeaturesFunction,
    onDeselectAllFeatures: OnDeselectAllFeaturesFunction,
    onCollapseAllFeatures: OnCollapseAllFeaturesFunction,
    onExpandAllFeatures: OnExpandAllFeaturesFunction,
    onSetFeatureDiagramLayout: OnSetFeatureDiagramLayoutFunction,
    onSetSelectMultipleFeatures: OnSetSelectMultipleFeaturesFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
    onShowOverlay: OnShowOverlayFunction,
    onHideOverlay: OnHideOverlayFunction,
    onFitToScreen: OnFitToScreenFunction,
    onSetSetting: OnSetSettingFunction,
    onResetSettings: OnResetSettingsFunction
}>;