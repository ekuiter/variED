/**
 * Definition of common types and enumerations.
 */

import {Selection} from 'd3-selection';

export enum MessageType {
    ERROR = 'ERROR',
    COLLABORATOR_INFO = 'COLLABORATOR_INFO',
    ADD_ARTIFACT = 'ADD_ARTIFACT',
    REMOVE_ARTIFACT = 'REMOVE_ARTIFACT',
    JOIN_REQUEST = 'JOIN_REQUEST',
    LEAVE_REQUEST = 'LEAVE_REQUEST',
    INITIALIZE = 'INITIALIZE',
    KERNEL = 'KERNEL'
};

export enum FeatureDiagramLayoutType {
    verticalTree = 'verticalTree',
    horizontalTree = 'horizontalTree'
};

export enum OverlayType {
    none = 'none',
    commandPalette = 'commandPalette',
    settingsPanel = 'settingsPanel',
    aboutPanel = 'aboutPanel',
    featurePanel = 'featurePanel',
    featureRenameDialog = 'featureRenameDialog',
    featureSetDescriptionDialog = 'featureSetDescriptionDialog',
    addArtifactPanel = 'addArtifact',
    shareDialog = 'share',
    exportDialog = 'export',
    featureCallout = 'featureCallout',
    featureContextualMenu = 'featureContextualMenu'
};

export interface OverlayProps {
    featureID?: string,
    format?: FormatType
};

export function isFloatingFeatureOverlay(type: OverlayType): boolean {
    return type === OverlayType.featureCallout || type === OverlayType.featureContextualMenu;
}

export enum FormatType {
    svg = 'svg',
    png = 'png',
    jpg = 'jpg',
    pdf = 'pdf'
};

export interface FormatOptions {
    scale?: number,
    quality?: number
};

export interface ArtifactPath {
    project: string,
    artifact: string
};

export function artifactPathToString(artifactPath: ArtifactPath): string {
    return artifactPath ? `${artifactPath.project}/${artifactPath.artifact}` : `(unknown artifact)`;
}

export function isArtifactPathEqual(a?: ArtifactPath, b?: ArtifactPath): boolean {
    return typeof a !== 'undefined' && typeof b !== 'undefined' &&
        a.project === b.project && a.artifact === b.artifact;
}

export interface Message {
    type: MessageType,
    artifactPath?: ArtifactPath,
    [x: string]: any
};

export function isMessageType(type: string) {
    return Object.values(MessageType).includes(type);
};

export type Point = {x: number, y: number};
// essentially the same as a DOMRect/ClientRect
export type Rect = Point & {width: number, height: number};
// upper left and lower right point, can be transformed to rect (but the tuple form is also useful)
export type Bbox = [[number, number], [number, number]];
// Represents any selection. We ignore the generic parameters here for simplicity.
// (IMO adding them would improve type safety, but decrease overall readability.)
export type D3Selection = Selection<any, any, any, any>;
// matches any function - this should be used sparely
export type Func = (...args: any[]) => any;
// omits a property from a type
export type Omit<T, K> = Pick<T, Exclude<keyof T, K>>;