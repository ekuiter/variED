/**
 * Selectors are used to cache objects that result from the Redux state.
 * For example, a feature model should not be recomputed every time any part of the Redux
 * store changes, but only when parts related to the feature model change.
 */

import createCachedSelector from 're-reselect';
import FeatureModel from '../modeling/FeatureModel';
import {State, CollaborativeSession, FeatureDiagramCollaborativeSession} from './types';
import logger from '../helpers/logger';
import {ArtifactPath, isArtifactPathEqual, artifactPathToString, artifactPathCacheKey} from '../types';
import {isKernelConflictDescriptor, KernelCombinedEffect, KernelConflictDescriptor} from '../modeling/types';
import {getCurrentArtifactPath} from '../router';

export function isFeatureDiagramCollaborativeSession(collaborativeSession?: CollaborativeSession): collaborativeSession is FeatureDiagramCollaborativeSession {
    return typeof collaborativeSession !== 'undefined' &&
        (<FeatureDiagramCollaborativeSession>collaborativeSession).kernelContext !== undefined;
}

export function isEditingFeatureModel(state: State): boolean {
    const currentArtifactPath = getCurrentArtifactPath(state.collaborativeSessions);
    if (!currentArtifactPath)
        return false;
    const collaborativeSession = lookupCollaborativeSession(state.collaborativeSessions, currentArtifactPath);
    return isFeatureDiagramCollaborativeSession(collaborativeSession) && !isKernelConflictDescriptor(collaborativeSession.kernelCombinedEffect);
}

export function isResolvingConflict(state: State): boolean {
    const currentArtifactPath = getCurrentArtifactPath(state.collaborativeSessions);
    if (!currentArtifactPath)
        return false;
    const collaborativeSession = lookupCollaborativeSession(state.collaborativeSessions, currentArtifactPath);
    return isFeatureDiagramCollaborativeSession(collaborativeSession) && isKernelConflictDescriptor(collaborativeSession.kernelCombinedEffect);
}

const lookupCollaborativeSession = (collaborativeSessions: CollaborativeSession[], artifactPath: ArtifactPath): CollaborativeSession => {
    const collaborativeSession = collaborativeSessions
            .find(collaborativeSession => isArtifactPathEqual(collaborativeSession.artifactPath, artifactPath));
        if (!collaborativeSession)
            throw new Error(`did not join collaborative session for artifact ${artifactPathToString(artifactPath)}`);
        return collaborativeSession;
};

export const getCollaborativeSession = createCachedSelector(
    (state: State, artifactPath: ArtifactPath) => lookupCollaborativeSession(state.collaborativeSessions, artifactPath),
    collaborativeSession => collaborativeSession)(
        (_state: State, artifactPath: ArtifactPath) => artifactPathCacheKey(artifactPath));

export function getCurrentCollaborativeSession(state: State): CollaborativeSession | undefined {
    const currentArtifactPath = getCurrentArtifactPath(state.collaborativeSessions);
    return currentArtifactPath ? getCollaborativeSession(state, currentArtifactPath) : undefined;
}

const featureModelCollaborativeSessionKeySelector = <T>(key: string) => (state: State, artifactPath: ArtifactPath): T | undefined => {
    const collaborativeSession = getCollaborativeSession(state, artifactPath);
    if (collaborativeSession && isFeatureDiagramCollaborativeSession(collaborativeSession))
        return collaborativeSession[key];
    return undefined;
};

export const getFeatureModel = createCachedSelector(
    featureModelCollaborativeSessionKeySelector('kernelCombinedEffect'),
    featureModelCollaborativeSessionKeySelector('collapsedFeatureIDs'),
    (kernelCombinedEffect?: KernelCombinedEffect, collapsedFeatureIDs?: string[]): FeatureModel | undefined => {
        logger.infoTagged({tag: 'redux'}, () => 'updating feature model selector');
        if (!kernelCombinedEffect || !collapsedFeatureIDs || isKernelConflictDescriptor(kernelCombinedEffect))
            return undefined;
        return FeatureModel.fromKernel(kernelCombinedEffect).collapse(collapsedFeatureIDs);
    }
)((_state: State, artifactPath: ArtifactPath) => artifactPathCacheKey(artifactPath));

export function getCurrentFeatureModel(state: State): FeatureModel | undefined {
    const currentArtifactPath = getCurrentArtifactPath(state.collaborativeSessions);
    return currentArtifactPath ? getFeatureModel(state, currentArtifactPath) : undefined;
}

export const getConflictDescriptor = createCachedSelector(
    featureModelCollaborativeSessionKeySelector('kernelCombinedEffect'),
    (kernelCombinedEffect?: KernelCombinedEffect): KernelConflictDescriptor | undefined => {
        logger.infoTagged({tag: 'redux'}, () => 'updating conflict descriptor selector');
        if (!kernelCombinedEffect || !isKernelConflictDescriptor(kernelCombinedEffect))
            return undefined;
        return kernelCombinedEffect;
    }
)((_state: State, artifactPath: ArtifactPath) => artifactPathCacheKey(artifactPath));

export function getCurrentConflictDescriptor(state: State): KernelConflictDescriptor | undefined {
    const currentArtifactPath = getCurrentArtifactPath(state.collaborativeSessions);
    return currentArtifactPath ? getConflictDescriptor(state, currentArtifactPath) : undefined;
}