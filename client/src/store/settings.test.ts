import {defaultSettings, getNewSettings, traverseSettings, cloneSettings} from './settings';

describe('settings', () => {    
    describe('getNewSettings', () => {
        it('sets new settings', () => {
            const defaultSettingsClone = cloneSettings(defaultSettings);
            expect(getNewSettings(defaultSettings, 'featureDiagram.font.size', 42)).not.toEqual(defaultSettingsClone);
        
            (defaultSettingsClone as any).featureDiagram.font.size = 42;
            expect(getNewSettings(defaultSettings, 'featureDiagram.font.size', 42)).toEqual(defaultSettingsClone);
        });

        it('calculates new settings from a the old value', () => {
            const newSettings = getNewSettings(defaultSettings, 'featureDiagram.font.size', (size: number) => size + 42);
            expect(newSettings.featureDiagram.font.size).toEqual(defaultSettings.featureDiagram.font.size + 42);
        });
        
        it('does not mutate the settings object', () => {
            const defaultSettingsClone = cloneSettings(defaultSettings),
                newSettings = getNewSettings(defaultSettings, 'featureDiagram.font.size', 42);
            expect(newSettings).not.toBe(defaultSettings);
            expect(defaultSettings).toEqual(defaultSettingsClone);
        });

        it('errors on invalid settings', () => {
            expect(() => getNewSettings(defaultSettings, 'an.invalid.setting.path', 42)).toThrow('does not exist');
        });
    });

    describe('cloneSettings', () => {
        it('clones a settings object', () => {
            const defaultSettingsClone = cloneSettings(defaultSettings);
            expect(defaultSettingsClone).not.toBe(defaultSettings);
            expect(defaultSettingsClone).toEqual(defaultSettings);
        });
    });

    describe('traverseSettings', () => {
        it('traverses a settings object recursively', () => {
            const mock = jest.fn();
            traverseSettings(defaultSettings, mock);
            expect(mock).toBeCalledWith('featureDiagram.font.size', 'size',
                defaultSettings.featureDiagram.font.size);
            expect(mock).toBeCalledWith('featureDiagram.treeLayout.node.size', 'size',
                defaultSettings.featureDiagram.treeLayout.node.size);
            expect(mock).not.toBeCalledWith('featureDiagram');
            expect(mock).toBeCalledWith('userFacepile.maxDisplayableUsers', 'maxDisplayableUsers',
                defaultSettings.userFacepile.maxDisplayableUsers);
        });
    });
});