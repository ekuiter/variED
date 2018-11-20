import GraphicalFeatureModel from '../modeling/GraphicalFeatureModel';
import {defaultSettings, Settings} from './settings';
import {Message, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath} from '../types';
import {GraphicalFeature, SerializedFeatureModel} from '../modeling/types';

export interface User {
    name: string
};

export interface CollaborativeSession {
    artifactPath: ArtifactPath,
    users: User[]
};

export interface FeatureDiagramCollaborativeSession extends CollaborativeSession {
    serializedFeatureModel: SerializedFeatureModel,
    layout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedFeatureUUIDs: string[],
    collapsedFeatureUUIDs: string[]
};

export interface State {
    settings: Settings,
    overlay: OverlayType,
    overlayProps: OverlayProps
    user?: User,
    collaborativeSessions: CollaborativeSession[],
    artifactPaths: ArtifactPath[],
    currentArtifactPath?: ArtifactPath
};

export const initialState: State = {
    settings: defaultSettings,
    overlay: OverlayType.none,
    overlayProps: {},
    user: undefined,
    collaborativeSessions: [],
    artifactPaths: [],
    currentArtifactPath: undefined
};

export const initialFeatureDiagramCollaborativeSessionState =
    (artifactPath: ArtifactPath, serializedFeatureModel: SerializedFeatureModel): FeatureDiagramCollaborativeSession => ({
        artifactPath,
        users: [],
        serializedFeatureModel,
        layout: FeatureDiagramLayoutType.verticalTree,
        isSelectMultipleFeatures: false,
        selectedFeatureUUIDs: [],
        collapsedFeatureUUIDs: []
    });

export type OnSelectFeatureFunction = (payload: {featureUUID: string}) => void;
export type OnDeselectFeatureFunction = (payload: {featureUUID: string}) => void;
export type OnSelectAllFeaturesFunction = () => void;
export type OnDeselectAllFeaturesFunction = () => void;
export type OnCollapseAllFeaturesFunction = () => void;
export type OnExpandAllFeaturesFunction = () => void;
export type OnSetFeatureDiagramLayoutFunction = (payload: {layout: FeatureDiagramLayoutType}) => void;
export type OnSetSelectMultipleFeaturesFunction = (payload: {isSelectMultipleFeatures: boolean}) => void;
export type OnCollapseFeaturesFunction = (payload: {featureUUIDs: string[]}) => void;
export type OnExpandFeaturesFunction = (payload: {featureUUIDs: string[]}) => void;
export type OnCollapseFeaturesBelowFunction = (payload: {featureUUIDs: string[]}) => void;
export type OnExpandFeaturesBelowFunction = (payload: {featureUUIDs: string[]}) => void;
export type OnShowOverlayFunction = (payload: {overlay: OverlayType, overlayProps: OverlayProps, selectOneFeatureUUID?: string}) => void;
export type OnHideOverlayFunction = (payload: {overlay: OverlayType}) => void;
export type OnFitToScreenFunction = () => void;
export type OnSetSettingFunction = (payload: {path: string, value: any}) => void;
export type OnResetSettingsFunction = () => void;
export type OnSetCurrentArtifactPathFunction = (payload: {artifactPath?: ArtifactPath}) => void;

export type OnJoinFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnLeaveFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnUndoFunction = () => Promise<void>;
export type OnRedoFunction = () => Promise<void>;
export type OnAddFeatureBelowFunction = (payload: {belowFeatureUUID: string}) => Promise<void>;
export type OnAddFeatureAboveFunction = (payload: {aboveFeatureUUIDs: string[]}) => Promise<void>;
export type OnRemoveFeaturesFunction = (payload: {featureUUIDs: string[]}) => Promise<void>;
export type OnRemoveFeaturesBelowFunction = (payload: {featureUUIDs: string[]}) => Promise<void>;
export type OnRenameFeatureFunction = (payload: {featureUUID: string, name: string}) => Promise<void>;
export type OnSetFeatureDescriptionFunction = (payload: {featureUUID: string, description: string}) => Promise<void>;
export type OnSetFeatureAbstractFunction = (payload: {featureUUIDs: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureHiddenFunction = (payload: {featureUUIDs: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureMandatoryFunction = (payload: {featureUUIDs: string[], value: boolean}) => Promise<void>;
export type OnToggleFeatureMandatoryFunction = (payload: {feature: GraphicalFeature}) => Promise<void>;
export type OnSetFeatureAndFunction = (payload: {featureUUIDs: string[]}) => Promise<void>;
export type OnSetFeatureOrFunction = (payload: {featureUUIDs: string[]}) => Promise<void>;
export type OnSetFeatureAlternativeFunction = (payload: {featureUUIDs: string[]}) => Promise<void>;
export type OnToggleFeatureGroupFunction = (payload: {feature: GraphicalFeature}) => Promise<void>;

// Props that may derived from the state to use in React components.
// This enforces the convention that a prop called 'on...' has the same type in all components.
export type StateDerivedProps = Partial<{
    handleMessage: (message: Message) => void,
    artifactPaths: ArtifactPath[],
    collaborativeSessions: CollaborativeSession[],
    user: User,
    users: User[],
    settings: Settings,
    featureDiagramLayout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedFeatureUUIDs: string[],
    graphicalFeatureModel: GraphicalFeatureModel,
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
    onSetCurrentArtifactPath: OnSetCurrentArtifactPathFunction,

    onJoin: OnJoinFunction,
    onLeave: OnLeaveFunction,
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