import objectPath from 'object-path';
import React from 'react';
import constants from './constants';
import {Link} from 'office-ui-fabric-react/lib/Link';

export const strings = {
    commands: {
        file: 'File',
        edit: 'Edit',
        view: 'View',
        help: 'Help',
        settings: 'Settings…',
        about: 'About…'
    },
    panels: {
        aboutPanel: {
            title: 'About',
            content: (
                <div>
                    <h3>variED: The variability editor</h3>
                    <p>View, edit and analyze feature models in the browser - with support for real-time
                        collaboration.</p>
                    <p>This project is released under the <Link href={constants.panels.aboutPanel.licenseUri}
                        target="_blank">LGPL v3 license</Link>.</p>
                    <p><Link href={constants.panels.aboutPanel.githubUri} target="_blank">View source code on
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
                        debug: 'Show developer information',
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
        }
    },
    dialogs: {
        featureRenameDialog: {
            title: 'Rename feature',
            rename: 'Rename'
        },
        featureSetDescriptionDialog: {
            title: 'Set feature description',
            rename: 'Save'
        },
        exportDialog: {
            export: 'Export',
            zoom: 'Zoom',
            svg: {
                title: 'Export as SVG',
                content: (
                    <p>
                Note that the font will <strong>not</strong> be embedded into the SVG file.
                Please make sure to choose a font that is commonly available.
                    </p>
                )
            },
            png: {
                title: 'Export as PNG'
            },
            jpg: {
                title: 'Export as JPEG',
                quality: 'Quality'
            }
        }
    },
    featureDiagram: {
        commands: {
            export: 'Export as',
            svg: 'SVG…',
            png: 'PNG…',
            jpg: 'JPEG…',
            undo: 'Undo',
            redo: 'Redo',
            setLayout: 'Layout',
            selection: (isSelectMultipleFeatures, selectedFeatureNames) =>
                isSelectMultipleFeatures
                    ? `Feature selection (${selectedFeatureNames.length})`
                    : 'Begin feature selection',
            verticalTree: 'Vertical tree',
            horizontalTree: 'Horizontal tree',
            feature: {
                new: 'New',
                newFeatureBelow: 'New feature below',
                remove: 'Remove',
                details: 'Details',
                rename: 'Rename…',
                setDescription: 'Set description…',
                collapseExpand: isCollapsed => isCollapsed ? 'Expand' : 'Collapse',
                properties: 'Properties',
                abstract: 'Abstract',
                concrete: 'Concrete',
                hidden: 'Hidden',
                mandatory: 'Mandatory',
                optional: 'Optional',
                and: 'And',
                or: 'Or',
                alternative: 'Alternative'
            },
            features: {
                selectAll: 'Select all features',
                deselectAll: 'Deselect all features',
                newFeatureAbove: 'New feature above',
                collapseAll: 'Collapse all features',
                expandAll: 'Expand all features'
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