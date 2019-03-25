import {ArtifactPath, isArtifactPathEqual} from './types';
import {createHashHistory} from 'history';
import {CollaborativeSession} from './store/types';

export const history = createHashHistory();
(window as any).h = history;

export function getArtifactPathFromLocation(): ArtifactPath | undefined {
    let path = history.location.pathname.substr(1);
    if (!path)
        return;
    if (path.split('/').length !== 2)
        return;
    const [project, artifact] = path.split('/');
    return {project, artifact};
}

export function getCurrentArtifactPath(collaborativeSessions: CollaborativeSession[]): ArtifactPath | undefined {
    const artifactPath = getArtifactPathFromLocation();
    return collaborativeSessions.find(collaborativeSession =>
        isArtifactPathEqual(collaborativeSession.artifactPath, artifactPath))
        ? artifactPath
        : undefined;
}

function getLocationFromArtifactPath(artifactPath?: ArtifactPath) {
    if (!artifactPath)
        return '/';
    return `/${artifactPath.project}/${artifactPath.artifact}`;
}

export function getShareableURL(artifactPath: ArtifactPath) {
    return `${window.location.protocol}//${window.location.host}/#${getLocationFromArtifactPath(artifactPath)}`;
}

export function redirectToArtifactPath(artifactPath?: ArtifactPath) {
    history.push(getLocationFromArtifactPath(artifactPath));
}