import FeatureModel from '../modeling/FeatureModel';
import {defaultSettings, Settings} from './settings';
import {Message, FeatureDiagramLayoutType, OverlayType, OverlayProps, ArtifactPath} from '../types';
import {Feature, KernelConstraintFormula, KernelCombinedEffect, KernelConflictDescriptor} from '../modeling/types';

export interface Collaborator {
    siteID: string,
    name: string
};

export interface CollaborativeSession {
    artifactPath: ArtifactPath,
    collaborators: Collaborator[]
};

export type KernelContext = object;
export type KernelData = any;

export interface Votes {
    [siteID: string]: string
};

export interface FeatureDiagramCollaborativeSession extends CollaborativeSession {
    kernelContext: KernelContext,
    kernelCombinedEffect: KernelCombinedEffect,
    layout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedFeatureIDs: string[],
    collapsedFeatureIDs: string[],
    voterSiteIDs?: string[],
    votes: Votes,
    transitionResolutionOutcome?: string,
    transitionConflictDescriptor?: KernelConflictDescriptor
};

export interface State {
    settings: Settings,
    overlay: OverlayType,
    overlayProps: OverlayProps
    myself?: Collaborator,
    collaborativeSessions: CollaborativeSession[],
    artifactPaths: ArtifactPath[]
};

export const initialState: State = {
    settings: defaultSettings,
    overlay: OverlayType.none,
    overlayProps: {},
    myself: undefined,
    collaborativeSessions: [],
    artifactPaths: []
};

export const initialFeatureDiagramCollaborativeSessionState =
    (artifactPath: ArtifactPath, kernelContext: KernelContext, kernelCombinedEffect: KernelCombinedEffect):
    FeatureDiagramCollaborativeSession => ({
        artifactPath,
        collaborators: [],
        kernelContext,
        kernelCombinedEffect,
        layout: FeatureDiagramLayoutType.verticalTree,
        isSelectMultipleFeatures: false,
        selectedFeatureIDs: [],
        collapsedFeatureIDs: [],
        voterSiteIDs: undefined,
        votes: {}
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
export type OnShowOverlayFunction = (payload: {overlay: OverlayType, overlayProps: OverlayProps, selectOneFeatureID?: string}) => void;
export type OnHideOverlayFunction = (payload: {overlay: OverlayType}) => void;
export type OnFitToScreenFunction = () => void;
export type OnSetSettingFunction = (payload: {path: string, value: any}) => void;
export type OnResetSettingsFunction = () => void;
export type OnEndConflictViewTransitionFunction = () => void;

export type OnAddArtifactFunction = (payload: {artifactPath: ArtifactPath, source?: string}) => Promise<void>;
export type OnRemoveArtifactFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnJoinRequestFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnLeaveRequestFunction = (payload: {artifactPath: ArtifactPath}) => Promise<void>;
export type OnUndoFunction = () => Promise<void>;
export type OnRedoFunction = () => Promise<void>;
export type OnCreateFeatureBelowFunction = (payload: {featureParentID: string}) => Promise<void>;
export type OnCreateFeatureAboveFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnRemoveFeatureFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnRemoveFeatureSubtreeFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnMoveFeatureSubtreeFunction = (payload: {featureID: string, featureParentID: string}) => Promise<void>;
export type OnSetFeatureNameFunction = (payload: {featureID: string, name: string}) => Promise<void>;
export type OnSetFeatureDescriptionFunction = (payload: {featureID: string, description: string}) => Promise<void>;
export type OnSetFeatureAbstractFunction = (payload: {featureIDs: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureHiddenFunction = (payload: {featureIDs: string[], value: boolean}) => Promise<void>;
export type OnSetFeatureOptionalFunction = (payload: {featureIDs: string[], value: boolean}) => Promise<void>;
export type OnToggleFeatureOptionalFunction = (payload: {feature: Feature}) => Promise<void>;
export type OnSetFeatureAndFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnSetFeatureOrFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnSetFeatureAlternativeFunction = (payload: {featureIDs: string[]}) => Promise<void>;
export type OnCreateConstraintFunction = (payload: {formula: KernelConstraintFormula}) => Promise<void>;
export type OnSetConstraintFunction = (payload: {constraintID: string, formula: KernelConstraintFormula}) => Promise<void>;
export type OnRemoveConstraintFunction = (payload: {constraintID: string}) => Promise<void>;
export type OnToggleFeatureGroupTypeFunction = (payload: {feature: Feature}) => Promise<void>;
export type OnSetUserProfileFunction = (payload: {name: string}) => Promise<void>;
export type OnResetFunction = () => Promise<void>;
export type OnVoteFunction = (payload: {versionID?: string}) => Promise<void>;
export type OnSetVotingStrategyFunction = (payload: {votingStrategy: string, onlyInvolved: boolean}) => Promise<void>;

// Props that may derived from the state to use in React components.
// This enforces the convention that a prop called 'on...' has the same type in all components.
export type StateDerivedProps = Partial<{
    handleMessage: (message: Message) => void,
    currentArtifactPath: ArtifactPath,
    artifactPaths: ArtifactPath[],
    collaborativeSessions: CollaborativeSession[],
    myself: Collaborator,
    collaborators: Collaborator[],
    settings: Settings,
    featureDiagramLayout: FeatureDiagramLayoutType,
    isSelectMultipleFeatures: boolean,
    selectedFeatureIDs: string[],
    featureModel: FeatureModel,
    conflictDescriptor: KernelConflictDescriptor,
    transitionResolutionOutcome: string,
    transitionConflictDescriptor: KernelConflictDescriptor,
    overlay: OverlayType,
    overlayProps: OverlayProps,
    voterSiteIDs: string[],
    votes: Votes,

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
    onEndConflictTransition: OnEndConflictViewTransitionFunction,

    onAddArtifact: OnAddArtifactFunction,
    onRemoveArtifact: OnRemoveArtifactFunction,
    onJoinRequest: OnJoinRequestFunction,
    onLeaveRequest: OnLeaveRequestFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction,
    onCreateFeatureBelow: OnCreateFeatureBelowFunction,
    onCreateFeatureAbove: OnCreateFeatureAboveFunction,
    onRemoveFeature: OnRemoveFeatureFunction,
    onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction,
    onMoveFeatureSubtree: OnMoveFeatureSubtreeFunction,
    onSetFeatureName: OnSetFeatureNameFunction,
    onSetFeatureDescription: OnSetFeatureDescriptionFunction,
    onSetFeatureAbstract: OnSetFeatureAbstractFunction,
    onSetFeatureHidden: OnSetFeatureHiddenFunction,
    onSetFeatureOptional: OnSetFeatureOptionalFunction,
    onToggleFeatureOptional: OnToggleFeatureOptionalFunction,
    onSetFeatureAnd: OnSetFeatureAndFunction,
    onSetFeatureOr: OnSetFeatureOrFunction,
    onSetFeatureAlternative: OnSetFeatureAlternativeFunction,
    onCreateConstraint: OnCreateConstraintFunction,
    onSetConstraint: OnSetConstraintFunction,
    onRemoveConstraint: OnRemoveConstraintFunction,
    onToggleFeatureGroupType: OnToggleFeatureGroupTypeFunction,
    onSetUserProfile: OnSetUserProfileFunction,
    onReset: OnResetFunction,
    onVote: OnVoteFunction,
    onSetVotingStrategy: OnSetVotingStrategyFunction
}>;