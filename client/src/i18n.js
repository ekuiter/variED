import objectPath from 'object-path';
import React from 'react';
import constants from './constants';
import {Link} from 'office-ui-fabric-react/lib/Link';

export const strings = {
    panels: {
        aboutPanel: {
            title: 'About',
            content: (
                <div>
                    <h3>variED: The variability editor</h3>
                    <p>View, edit and analyze feature models in the browser - with support for real-time collaboration.</p>
                    <p>This project is released under the <Link href={constants.panels.aboutPanel.licenseUri} target="_blank">LGPL v3 license</Link>.</p>
                    <p><Link href={constants.panels.aboutPanel.githubUri} target="_blank">View source code on GitHub</Link></p>
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
                        debug: 'Show developer information',
                        useTransitions: 'Animate feature model changes',
                        node: {
                            paddingX: 'Horizontal padding',
                            paddingY: 'Vertical padding',
                            strokeWidth: 'Border thickness',
                            abstractFill: 'Abstract feature (fill)',
                            abstractStroke: 'Abstract feature (border)',
                            concreteFill: 'Concrete feature (fill)',
                            concreteStroke: 'Concrete feature (border)',
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
        }
    },
    dialogs: {
        featureRenameDialog: {
            title: 'Rename feature',
            rename: 'Rename'
        }
    },
    featureDiagram: {
        commands: {
            undo: 'Undo',
            redo: 'Redo',
            setLayout: 'Layout',
            selection: isSelectMultiple =>
                isSelectMultiple ? 'Selection' : 'Select multiple',
            verticalTree: 'Vertical tree',
            horizontalTree: 'Horizontal tree',
            feature: {
                new: 'New',
                newFeatureBelow: 'New feature below',
                newFeatureAbove: 'New feature above',
                remove: 'Remove',
                details: 'Details',
                rename: 'Rename'
            },
            features: {
                deselectAll: 'Deselect all'
            }
        }
    }
};

export default {
    t(...paths) {
        const path = paths.join('.');
        if (!objectPath.has(strings, path))
            throw new Error(`string ${path} does not exist`);
        return objectPath.get(strings, path);
    }
};