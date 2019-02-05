import FeatureModel from '../modeling/FeatureModel';
import {defaultSettings, Settings} from './settings';
import {Message, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath} from '../types';
import {Feature, SerializedFeatureModel} from '../modeling/types';

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
    selectedfeatureIDs: string[],
    collapsedfeatureIDs: string[]
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
        selectedfeatureIDs: [],
        collapsedfeatureIDs: []
    });

export type OnSelectFeatureFunction = (payload: {featureID: string}) => void;
export type OnDeselectFeatureFunction = (payload: {featureID: string}) => void;
export type OnSelectAllFeaturesFunction = () => void;
export type OnDeselectAllFeaturesFunction = () => void;
export type OnCollapseAllFeaturesFunction = () => void;
export type OnExpandAllFeaturesFunction = () => void;
export type OnSetFeatureDiagramLayoutFunction = (payload: {layout: FeatureDiagramLayoutType}) => void;
export type OnSetSelectMultipleFeaturesFunction = (payload: {isSelectMultipleFeatures: boolean}) => void;
export type OnCollapseFeaturesFunction = (payload: {featureIDs: string[]}) => void;
export type OnExpandFeaturesFunction = (payload: {featureIDs: string[]}) => void;
export type OnCollapseFeaturesBelowFunction = (payload: {featureIDs: string[]}) => void;
export type OnExpandFeaturesBelowFunction = (payload: {featureIDs: string[]}) => void;
export type OnShowOverlayFunction = (payload: {overlay: OverlayType, overlayProps: OverlayProps, selectOnefeatureID?: string}) => void;
export type OnHideOverlayFunction = (payload: {overlay: OverlayType}) => void;
export type OnFitToScreenFunction = () => void;
export type OnSetSettingFunction = (payload: {path: string, value: any}) => void;
export type OnResetSettingsFunction = () => void;
export type OnSetCurrentArtifactPathFunction = (payload: {artifactPath?: ArtifactPath}) => void;

export type OnJoinFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnLeaveFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnUndoFunction = () => Promise<void>;
export type OnRedoFunction = () => Promise<void>;
export type OnAddFeatureBelowFunction = (payload: {belowfeatureID: string}) => Promise<void>;
export type OnAddFeatureAboveFunction = (payload: {abovefeatureIDs: string[]}) => Promise<void>;
export type OnRemoveFeaturesFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnRemoveFeaturesBelowFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnRenameFeatureFunction = (payload: {featureID: string, name: string}) => Promise<void>;
export type OnSetFeatureDescriptionFunction = (payload: {featureID: string, description: string}) => Promise<void>;
export type OnSetFeatureAbstractFunction = (payload: {featureIDs: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureHiddenFunction = (payload: {featureIDs: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureMandatoryFunction = (payload: {featureIDs: string[], value: boolean}) => Promise<void>;
export type OnToggleFeatureMandatoryFunction = (payload: {feature: Feature}) => Promise<void>;
export type OnSetFeatureAndFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnSetFeatureOrFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnSetFeatureAlternativeFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnToggleFeatureGroupFunction = (payload: {feature: Feature}) => Promise<void>;

// Props that may derived from the state to use in React components.
// This enforces the convention that a prop called 'on...' has the same type in all components.
export type StateDerivedProps = Partial<{
    handleMessage: (message: Message) => void,
    currentArtifactPath: ArtifactPath,
    artifactPaths: ArtifactPath[],
    collaborativeSessions: CollaborativeSession[],
    user: User,
    users: User[],
    settings: Settings,
    featureDiagramLayout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedfeatureIDs: string[],
    featureModel: FeatureModel,
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