/**
 * Selectors are used to cache objects that result from the Redux state.
 * For example, a feature model should not be recomputed every time any part of the Redux
 * store changes, but only when parts related to the feature model change.
 */

import {createSelector} from 'reselect';
import createCachedSelector from 're-reselect';
import FeatureModel from '../modeling/FeatureModel';
import {State, CollaborativeSession, FeatureDiagramCollaborativeSession} from './types';
import logger from '../helpers/logger';
import {ArtifactPath, isArtifactPathEqual, artifactPathToString} from '../types';
import {SerializedFeatureModel} from '../modeling/types';

export function isFeatureDiagramCollaborativeSession(collaborativeSession?: CollaborativeSession): collaborativeSession is FeatureDiagramCollaborativeSession {
    return typeof collaborativeSession !== 'undefined' &&
        (<FeatureDiagramCollaborativeSession>collaborativeSession).serializedFeatureModel !== undefined;
}

export function isEditingFeatureModel(state: State): boolean {
    if (!state.currentArtifactPath)
        return false;
    const collaborativeSession = lookupCollaborativeSession(state.collaborativeSessions, state.currentArtifactPath);
    return isFeatureDiagramCollaborativeSession(collaborativeSession);
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
        (_state: State, artifactPath: ArtifactPath) => artifactPathToString(artifactPath));

export const getCurrentCollaborativeSession = createSelector(
    (state: State) => state.collaborativeSessions,
    (state: State) => state.currentArtifactPath,
    (collaborativeSessions: CollaborativeSession[], currentArtifactPath: ArtifactPath): CollaborativeSession | undefined =>
        currentArtifactPath ? lookupCollaborativeSession(collaborativeSessions, currentArtifactPath) : undefined);

const featureModelCollaborativeSessionKeySelector = <T>(key: string) => (state: State, artifactPath: ArtifactPath): T | undefined => {
    const collaborativeSession = getCollaborativeSession(state, artifactPath);
    if (collaborativeSession && isFeatureDiagramCollaborativeSession(collaborativeSession))
        return collaborativeSession[key];
    return undefined;
};

const currentFeatureModelCollaborativeSessionKeySelector = <T>(key: string) => (state: State): T | undefined => {
    const collaborativeSession = getCurrentCollaborativeSession(state);
    if (collaborativeSession && isFeatureDiagramCollaborativeSession(collaborativeSession))
        return collaborativeSession[key];
    return undefined;
};

export const getFeatureModel = createCachedSelector(
    featureModelCollaborativeSessionKeySelector('serializedFeatureModel'),
    featureModelCollaborativeSessionKeySelector('collapsedFeatureUUIDs'),
    (serializedFeatureModel?: SerializedFeatureModel, collapsedFeatureUUIDs?: string[]): FeatureModel | undefined => {
        logger.infoTagged({tag: 'redux'}, () => 'updating feature model selector');
        if (!serializedFeatureModel || !collapsedFeatureUUIDs)
            return undefined;
        return FeatureModel.fromJSON(serializedFeatureModel).collapse(collapsedFeatureUUIDs);
    }
)((_state: State, artifactPath: ArtifactPath) => artifactPathToString(artifactPath));

export const getCurrentFeatureModel = createSelector(
    currentFeatureModelCollaborativeSessionKeySelector('serializedFeatureModel'),
    currentFeatureModelCollaborativeSessionKeySelector('collapsedFeatureUUIDs'),
    (serializedFeatureModel?: SerializedFeatureModel, collapsedFeatureUUIDs?: string[]): FeatureModel | undefined => {
        logger.infoTagged({tag: 'redux'}, () => 'updating feature model selector');
        if (!serializedFeatureModel || !collapsedFeatureUUIDs)
            return undefined;
        return FeatureModel.fromJSON(serializedFeatureModel).collapse(collapsedFeatureUUIDs);
    }
);