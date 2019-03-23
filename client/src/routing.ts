import {ArtifactPath} from './types';

export function getRoutedArtifactPath(): ArtifactPath | undefined {
    if (!window.location.hash)
        return;

    let hash = window.location.hash.substr(1);
    if (hash.startsWith('/'))
        hash = hash.substr(1);
    const [project, artifact] = hash.split('/');
    return {project, artifact};
}

export function getShareableURL(artifactPath: ArtifactPath) {
    return `${window.location.protocol}//${window.location.host}/#/${artifactPath.project}/${artifactPath.artifact}`;
}