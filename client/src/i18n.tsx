/**
 * Internationalization utilities.
 * This includes a string table to be able to translate the application to other languages.
 */

import objectPath from 'object-path';
import {Link} from 'office-ui-fabric-react/lib/Link';
import React from 'react';
import constants from './constants';
import {getShortcutText} from './shortcuts';
import {OverlayType} from './types';
import {OnShowOverlayFunction} from './store/types';

type TranslationFunction = (...args: any[]) => any;
type Translation = string | JSX.Element | TranslationFunction;
    
function isString(translation: Translation): translation is string {
    return typeof translation === 'string';
}

function isElement(translation: Translation): translation is JSX.Element {
    return React.isValidElement(translation);
}

function isTranslationFunction(translation: Translation): translation is TranslationFunction {
    return typeof translation === 'function';
}

const translationMap = {
    noCollaborativeSessions: (onShowOverlay: OnShowOverlayFunction) => (
        <div className="standout">
            <div>
                <p>You are not currently participating in any collaborative session.</p>
                <p>To join one, open the <Link
                    onClick={() => onShowOverlay({overlay: OverlayType.commandPalette, overlayProps: {}})}><strong>command palette</strong></Link> <strong>(
                {getShortcutText('commandPalette')})</strong> or create a <Link
                    onClick={() => onShowOverlay({overlay: OverlayType.addArtifactPanel, overlayProps: {}})}><strong>new feature model</strong></Link>.</p>
            </div>
        </div>
    ),
    alreadyActive: () => (
        <div className="message">
            <div>
                <p>
                    <strong>variED is already active in another tab.</strong>
                </p>
                <p>
                    To use variED in this tab, close all other variED tabs and&nbsp;
                    <a href="#" onClick={() => window.location.reload()}>reload the page</a>.
                </p>
            </div>
        </div>
    ),
    hasUnflushedMessages: (numberofUnflushedMessages: number) =>
        `${numberofUnflushedMessages} messages have not yet been synchronized.\nIf you proceed, these messages will be lost.`,
    commands: {
        file: 'File',
        edit: 'Edit',
        view: 'View',
        tools: 'Tools',
        commandPalette: 'Command Palette…',
        settings: 'Settings…',
        about: 'About…',
        undo: 'Undo',
        redo: 'Redo',
        addArtifact: 'New…',
        share: 'Share…',
        featureDiagram: {
            export: 'Export as',
            svg: 'SVG…',
            png: 'PNG…',
            jpg: 'JPEG…',
            pdf: 'PDF…',
            setLayout: 'Feature model layout',
            verticalTree: 'Vertical tree',
            horizontalTree: 'Horizontal tree',
            fitToScreen: 'Fit feature model to screen',
            showConstraintView: 'Show constraint view',
            splitConstraintViewHorizontally: 'Constraint view sidebar',
            feature: {
                newMenu: {
                    title: 'New',
                    newBelow: 'New feature below',
                    newAbove: 'New feature above'
                },
                removeMenu: {
                    title: 'Remove',
                    remove: (features: any[]) => features.length === 1 ? 'Remove feature' : 'Remove features',
                    removeBelow: 'Remove features below'
                },
                details: 'Details…',
                rename: 'Rename…',
                setDescription: 'Set description…',
                propertiesMenu: {
                    title: 'Properties',
                    abstract: 'Abstract',
                    concrete: 'Concrete',
                    hidden: 'Hidden',
                    mandatory: 'Mandatory',
                    optional: 'Optional',
                    and: 'And',
                    or: 'Or',
                    alternative: 'Alternative'
                },
                selection: (isSelectMultipleFeatures: boolean, selectedFeatureIDs: string[]) =>
                    isSelectMultipleFeatures
                        ? `Feature selection (${selectedFeatureIDs.length})`
                        : 'Begin feature selection',
                selectAll: 'Select all features',
                deselectAll: 'Deselect all features',
                collapseMenu: {
                    title: (isCollapsed: boolean) => isCollapsed ? 'Expand' : 'Collapse',
                    collapse: (isCollapsed: boolean) => isCollapsed ? 'Expand feature' : 'Collapse feature',
                    collapseBelow: 'Collapse features below',
                    expandBelow: 'Expand features below',
                    collapseMultiple: 'Collapse features',
                    expandMultiple: 'Expand features'
                },
                collapseAll: 'Collapse all features',
                expandAll: 'Expand all features'
            }
        }
    },
    commandPalette: {
        project: 'Project',
        artifact: 'Artifact',
        feature: 'Feature',
        constraint: 'Constraint',
        oldConstraint: 'Old constraint',
        newConstraint: 'New constraint',
        format: 'Format',
        layout: 'Layout',
        delay: 'Delay',
        switch: 'Switch to collaborative session',
        joinRequest: 'Join collaborative session',
        leaveRequest: 'Leave collaborative session',
        userProfile: 'User profile',
        settings: 'Settings',
        about: 'About',
        addArtifact: 'New feature model',
        removeArtifact: 'Remove feature model',
        share: 'Share feature model',
        featureDiagram: {
            export: 'Export feature model',
            svg: 'SVG',
            png: 'PNG',
            jpg: 'JPEG',
            pdf: 'PDF',
            toggleConstraintView: 'Toggle constraint view',
            toggleConstraintViewSplitDirection: 'Toggle constraint view sidebar',
            feature: {
                details: 'Feature details',
                rename: 'Rename feature',
                move: 'Move feature',
                moveSource: 'Move source',
                moveTarget: 'Move target',
                setDescription: 'Set feature description',
                propertiesMenu: {
                    abstract: 'Set feature to abstract',
                    concrete: 'Set feature to concrete',
                    hidden: 'Toggle feature visibility',
                    mandatory: 'Set feature to mandatory',
                    optional: 'Set feature to optional',
                    and: 'Change feature group to and',
                    or: 'Change feature group to or',
                    alternative: 'Change feature group to alternative'
                }
            },
            constraint: {
                new: 'New constraint',
                set: 'Set constraint',
                remove: 'Remove constraint',
                invalid: 'Invalid constraint.'
            }
        },
        developer: {
            debug: 'Developer: Toggle debug mode',
            simulateDelay: 'Developer: Simulate message delay',
            simulateOffline: 'Developer: Simulate offline',
            clearLocalStorage: 'Developer: Clear local storage'
        }
    },
    overlays: {
        palette: {
            notFound: 'Nothing found.',
            truncatedItems: (truncatedItems: number) => `(and ${truncatedItems} more)`
        },
        aboutPanel: {
            title: 'About',
            content: (
                <div>
                    <h3>variED: The variability editor</h3>
                    <p>View, edit and analyze feature models in the browser - with support for real-time
                        collaboration.</p>
                    <p>This project is a research effort of
                        the <Link href={constants.overlays.aboutPanel.researchGroupUri} target="_blank">DBSE working group</Link> and
                        has been released under the <Link href={constants.overlays.aboutPanel.licenseUri}
                        target="_blank">LGPL v3 license</Link>.</p>
                    <p>If you would like to leave any feedback, use our <Link
                        href={constants.overlays.aboutPanel.feedbackUri} target="_blank">online form</Link> or <Link href={constants.overlays.aboutPanel.mailto}>mail me</Link>.</p>
                    <p><Link href={constants.overlays.aboutPanel.githubUri} target="_blank">View source code on
                        GitHub</Link></p>
                </div>
            )
        },
        settingsPanel: {
            title: 'Settings',
            toggleOn: 'On',
            toggleOff: 'Off',
            apply: 'Apply',
            customizeColors: 'Customize colors',
            resetToDefaults: 'Reset to defaults',
            headings: {
                featureDiagram: 'Feature diagram',
                features: 'Features',
                edges: 'Edges',
                verticalTree: 'Vertical tree',
                horizontalTree: 'Horizontal tree'
            },
            labels: {
                featureDiagram: {
                    font: {
                        family: 'Font family',
                        size: 'Font size'
                    },
                    treeLayout: {
                        useTransitions: 'Animate feature model changes',
                        transitionDuration: 'Animation duration in ms',
                        node: {
                            paddingX: 'Horizontal padding',
                            paddingY: 'Vertical padding',
                            strokeWidth: 'Border thickness',
                            abstractFill: 'Abstract feature (fill)',
                            abstractStroke: 'Abstract feature (border)',
                            concreteFill: 'Concrete feature (fill)',
                            concreteStroke: 'Concrete feature (border)',
                            visibleFill: 'Visible feature (text)',
                            hiddenFill: 'Hidden feature (text)'
                        },
                        link: {
                            circleRadius: 'Circle radius',
                            stroke: 'Edge',
                            strokeWidth: 'Thickness'
                        },
                        vertical: {
                            marginX: 'Horizontal gap',
                            layerHeight: 'Vertical gap',
                            groupRadius: 'Group radius'
                        },
                        horizontal: {
                            marginY: 'Vertical gap',
                            layerMargin: 'Horizontal gap'
                        },
                    }
                }
            },
            errors: {
                fontNotInstalled: 'This font is not installed on your system.'
            }
        },
        featurePanel: {
            title: 'Feature',
            edit: 'Edit',
            noDescriptionSet: 'No description set.'
        },
        featureRenameDialog: {
            title: 'Rename feature',
            rename: 'Rename'
        },
        featureSetDescriptionDialog: {
            title: 'Set feature description',
            save: 'Save'
        },
        addArtifactPanel: {
            title: 'New feature model',
            create: 'Create',
            encoding: 'File encoding',
            formatNotice: (
                <p>
                    You can import any feature model that is compatible with <Link
                        href="https://featureide.github.io/" target="_blank">FeatureIDE</Link>.
                    Leave this blank to create an empty feature model.
                </p>
            ),
        },
        userProfilePanel: {
            title: 'User profile',
            save: 'Save',
            name: 'Name (publicly visible)'
        },
        shareDialog: {
            title: 'Share feature model',
            copy: 'Copy'
        },
        exportDialog: {
            export: 'Export',
            zoom: 'Zoom',
            fontNotice: (
                <p>
                    Note that the font will <strong>not</strong> be embedded.
                    Please make sure to choose a font that is commonly available.
                </p>
            ),
            svg: {
                title: 'Export as SVG'
            },
            png: {
                title: 'Export as PNG'
            },
            jpg: {
                title: 'Export as JPEG',
                quality: 'Quality'
            },
            pdf: {
                title: 'Export as PDF'
            }
        }
    },
    conflictResolution: {
        version: 'Version',
        neutralVersion: 'Neutral Version',
        conflict: (numberOfConflicts: number) => numberOfConflicts > 1 ? `${numberOfConflicts} conflicts`: 'Conflict'
    }
};

function getTranslation(...paths: string[]): {path: string, translation: Translation} {
    const path = paths.join('.');
    if (!objectPath.has(translationMap, path))
        throw new Error(`translation ${path} does not exist`);
    return {path, translation: objectPath.get(translationMap, path)};
}

export default {
    t(...paths: string[]): string {
        const {path, translation} = getTranslation(...paths);
        if (isString(translation))
            return translation;
        throw new Error(`translation ${path} is not a string`);
    },

    getElement(...paths: string[]): JSX.Element {
        const {path, translation} = getTranslation(...paths);
        if (isElement(translation))
            return translation;
        throw new Error(`translation ${path} is not an element`);
    },

    getFunction(...paths: string[]): TranslationFunction {
        const {path, translation} = getTranslation(...paths);
        if (isTranslationFunction(translation))
            return translation;
        throw new Error(`translation ${path} is not a function`);
    }
};