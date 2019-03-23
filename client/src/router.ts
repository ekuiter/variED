import {ArtifactPath, isArtifactPathEqual, artifactPathToString} from './types';
import {CollaborativeSession, OnSetCurrentArtifactPathFunction, OnJoinRequestFunction} from './store/types';
import logger from './helpers/logger';

const tag = 'router';

export function getArtifactPathFromHash(): ArtifactPath | undefined {
    if (!window.location.hash)
        return;

    let hash = window.location.hash.substr(1);
    if (hash.startsWith('/'))
        hash = hash.substr(1);
    if (hash.split('/').length !== 2)
        return;
    const [project, artifact] = hash.split('/');
    return {project, artifact};
}

function getHashFromArtifactPath(artifactPath?: ArtifactPath) {
    if (!artifactPath)
        return '#';
    return `#/${artifactPath.project}/${artifactPath.artifact}`;
}

export function getShareableURL(artifactPath: ArtifactPath) {
    return `${window.location.protocol}//${window.location.host}/${getHashFromArtifactPath(artifactPath)}`;
}

export function routeTo(artifactPath?: ArtifactPath) {
    location.hash = getHashFromArtifactPath(artifactPath);
}

export function routeToWithoutHashChange(artifactPath?: ArtifactPath) {
    history.pushState(null, null!, getHashFromArtifactPath(artifactPath));
}

export function router(collaborativeSessions: CollaborativeSession[],
    onSetCurrentArtifactPath: OnSetCurrentArtifactPathFunction,
    onJoinRequest: OnJoinRequestFunction) {
    const artifactPath = getArtifactPathFromHash();
    if (artifactPath) {
        logger.infoTagged({tag}, () => `routing artifact path ${artifactPathToString(artifactPath)}`);
        if (collaborativeSessions.find(collaborativeSession =>
            isArtifactPathEqual(collaborativeSession.artifactPath, artifactPath)))
                onSetCurrentArtifactPath({artifactPath});
            else
                onJoinRequest({artifactPath}); // TODO: error handling
    } else {
        logger.infoTagged({tag}, () => `routing to start page`);
        onSetCurrentArtifactPath({artifactPath: undefined});
    }
};