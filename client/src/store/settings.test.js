import {defaultSettings, getSetting, getNewSettings} from './settings';

describe('settings', () => {
    describe('getSetting', () => {
        it('retrieves a setting from the default settings', () => {
            expect(getSetting(defaultSettings, 'featureDiagram.font.size')).toBe(defaultSettings.featureDiagram.font.size);
        });
        
        it('retrieves a whole settings tree from the default settings', () => {
            expect(getSetting(defaultSettings, 'featureDiagram')).toEqual(defaultSettings.featureDiagram);
        });
        
        it('errors on invalid settings', () => {
            expect(() => getSetting(defaultSettings, 'an.invalid.setting.path')).toThrow('does not exist');
        });
    });
    
    describe('getNewSettings', () => {
        it('sets new settings', () => {
            const defaultSettingsClone = JSON.parse(JSON.stringify(defaultSettings));
            expect(getNewSettings(defaultSettings, 'featureDiagram.font.size', 42)).not.toEqual(defaultSettingsClone);
        
            defaultSettingsClone.featureDiagram.font.size = 42;
            expect(getNewSettings(defaultSettings, 'featureDiagram.font.size', 42)).toEqual(defaultSettingsClone);
        });

        it('calculates new settings from a the old value', () => {
            const newSettings = getNewSettings(defaultSettings, 'featureDiagram.font.size', size => size + 42);
            expect(getSetting(newSettings, 'featureDiagram.font.size'))
                .toEqual(getSetting(defaultSettings, 'featureDiagram.font.size') + 42);
        });
        
        it('does not mutate the settings object', () => {
            const defaultSettingsClone = JSON.parse(JSON.stringify(defaultSettings)),
                newSettings = getNewSettings(defaultSettings, 'featureDiagram.font.size', 42);
            expect(newSettings).not.toBe(defaultSettings);
            expect(defaultSettings).toEqual(defaultSettingsClone);
        });

        it('errors on invalid settings', () => {
            expect(() => getNewSettings(defaultSettings, 'an.invalid.setting.path', 42)).toThrow('does not exist');
        });
    });
});