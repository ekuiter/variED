import FeatureModel from '../server/FeatureModel';
import {defaultSettings, Settings} from './settings';
import {Message, FeatureDiagramLayoutType, OverlayType, OverlayProps, Feature} from '../types';

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
export type OnUndoFunction = () => Promise<void>;
export type OnRedoFunction = () => Promise<void>;
export type OnAddFeatureBelowFunction = (payload: {belowFeatureName: string}) => Promise<void>;
export type OnAddFeatureAboveFunction = (payload: {aboveFeaturesNames: string[]}) => Promise<void>;
export type OnRemoveFeaturesFunction = (payload: {featureNames: string[]}) => Promise<void>;
export type OnRemoveFeaturesBelowFunction = (payload: {featureNames: string[]}) => Promise<void>;
export type OnRenameFeatureFunction = (payload: {oldFeatureName: string, newFeatureName: string}) => Promise<void>;
export type OnSetFeatureDescriptionFunction = (payload: {featureName: string, description: string}) => Promise<void>;
export type OnSetFeatureAbstractFunction = (payload: {featureNames: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureHiddenFunction = (payload: {featureNames: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureMandatoryFunction = (payload: {featureNames: string[], value: boolean}) => Promise<void>;
export type OnToggleFeatureMandatoryFunction = (payload: {feature: Feature}) => Promise<void>;
export type OnSetFeatureAndFunction = (payload: {featureNames: string[]}) => Promise<void>;
export type OnSetFeatureOrFunction = (payload: {featureNames: string[]}) => Promise<void>;
export type OnSetFeatureAlternativeFunction = (payload: {featureNames: string[]}) => Promise<void>;
export type OnToggleFeatureGroupFunction = (payload: {feature: Feature}) => Promise<void>;

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
    onResetSettings: OnResetSettingsFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction,
    onAddFeatureBelow: OnAddFeatureBelowFunction,
    onAddFeatureAbove: OnAddFeatureAboveFunction,
    onRemoveFeatures: OnRemoveFeaturesFunction,
    onRemoveFeaturesBelow: OnRemoveFeaturesBelowFunction,
    onRenameFeature: OnRenameFeatureFunction,
    onSetFeatureDescription: OnSetFeatureDescriptionFunction,
    onSetFeatureAbstract: OnSetFeatureAbstractFunction,
    onSetFeatureHidden: OnSetFeatureHiddenFunction,
    onSetFeatureMandatory: OnSetFeatureMandatoryFunction,
    onToggleFeatureMandatory: OnToggleFeatureMandatoryFunction,
    onSetFeatureAnd: OnSetFeatureAndFunction,
    onSetFeatureOr: OnSetFeatureOrFunction,
    onSetFeatureAlternative: OnSetFeatureAlternativeFunction,
    onToggleFeatureGroup: OnToggleFeatureGroupFunction
}>;