import {defaultSettings, getSetting, getNewSettings, traverseSettings, cloneSettings} from './settings';

describe('settings', () => {
    describe('getSetting', () => {
        it('retrieves a setting from the default settings', () => {
            expect(getSetting(defaultSettings, 'featureDiagram.font.size')).toBe(defaultSettings.featureDiagram.font.size);
        });
        
        it('retrieves a whole settings tree from the default settings', () => {
            expect(getSetting(defaultSettings, 'featureDiagram')).toEqual(defaultSettings.featureDiagram);
        });

        it('retrieves the whole settings tree if no path is supplied', () => {
            expect(getSetting(defaultSettings)).toBe(defaultSettings);
        });
        
        it('errors on invalid settings', () => {
            expect(() => getSetting(defaultSettings, 'an.invalid.setting.path')).toThrow('does not exist');
        });
    });
    
    describe('getNewSettings', () => {
        it('sets new settings', () => {
            const defaultSettingsClone = cloneSettings(defaultSettings);
            expect(getNewSettings(defaultSettings, 'featureDiagram.font.size', 42)).not.toEqual(defaultSettingsClone);
        
            (defaultSettingsClone as any).featureDiagram.font.size = 42;
            expect(getNewSettings(defaultSettings, 'featureDiagram.font.size', 42)).toEqual(defaultSettingsClone);
        });

        it('calculates new settings from a the old value', () => {
            const newSettings = getNewSettings(defaultSettings, 'featureDiagram.font.size', (size: number) => size + 42);
            expect(getSetting(newSettings, 'featureDiagram.font.size'))
                .toEqual(getSetting(defaultSettings, 'featureDiagram.font.size') + 42);
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
        const testWithPath = (mock: jest.Mock, path?: string) => {
            traverseSettings(defaultSettings, path, mock);
            expect(mock).toBeCalledWith('featureDiagram.font.size', 'size',
                getSetting(defaultSettings, 'featureDiagram.font.size'));
            expect(mock).toBeCalledWith('featureDiagram.treeLayout.node.size', 'size',
                getSetting(defaultSettings, 'featureDiagram.treeLayout.node.size'));
            expect(mock).not.toBeCalledWith('featureDiagram');
        };

        it('traverses a settings object recursively', () => {
            const mock = jest.fn();
            testWithPath(mock, undefined);
            expect(mock).toBeCalledWith('userFacepile.maxDisplayableUsers', 'maxDisplayableUsers',
                getSetting(defaultSettings, 'userFacepile.maxDisplayableUsers'));
        });

        it('traverses a settings object recursively for a given path', () => {
            const mock = jest.fn();
            testWithPath(mock, 'featureDiagram');
            expect(mock).not.toBeCalledWith('userFacepile.maxDisplayableUsers', 'maxDisplayableUsers',
                getSetting(defaultSettings, 'userFacepile.maxDisplayableUsers'));
        });
    });
});