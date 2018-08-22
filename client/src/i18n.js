import objectPath from 'object-path';

export const strings = {
    settingsPanel: {
        title: 'Settings',
        toggleOn: 'On',
        toggleOff: 'Off',
        apply: 'Apply',
        customizeColors: 'Customize colors',
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