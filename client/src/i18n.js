import objectPath from 'object-path';

export const strings = {
    settingsPanel: {
        title: 'Settings',
        toggleOn: 'On',
        toggleOff: 'Off',
        headings: {
            featureDiagram: 'Feature diagram',
            treeLayout: 'Tree layout'
        },
        labels: {
            featureDiagram: {
                font: {
                    family: 'Font family',
                    size: 'Font size'
                },
                treeLayout: {
                    debug: 'Show developer information',
                    useTransitions: 'Animate feature model changes'
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