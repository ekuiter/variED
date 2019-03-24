import {ArtifactPath, isArtifactPathEqual} from './types';
import {createBrowserHistory} from 'history';
import {CollaborativeSession} from './store/types';

export const history = createBrowserHistory();

export function getArtifactPathFromPath(): ArtifactPath | undefined {
    let path = history.location.pathname.substr(1);
    if (!path)
        return;
    if (path.split('/').length !== 2)
        return;
    const [project, artifact] = path.split('/');
    return {project, artifact};
}

export function getCurrentArtifactPath(collaborativeSessions: CollaborativeSession[]): ArtifactPath | undefined {
    const artifactPath = getArtifactPathFromPath();
    return collaborativeSessions.find(collaborativeSession =>
        isArtifactPathEqual(collaborativeSession.artifactPath, artifactPath))
        ? artifactPath
        : undefined;
}

function getPathFromArtifactPath(artifactPath?: ArtifactPath) {
    if (!artifactPath)
        return '/';
    return `/${artifactPath.project}/${artifactPath.artifact}`;
}

export function getShareableURL(artifactPath: ArtifactPath) {
    return `${window.location.protocol}//${window.location.host}${getPathFromArtifactPath(artifactPath)}`;
}

export function redirectToArtifactPath(artifactPath?: ArtifactPath) {
    history.push(getPathFromArtifactPath(artifactPath));
}