import React from 'react';
import {shallow} from 'enzyme';
import SettingsPanel, {Setting} from './SettingsPanel';
import {defaultSettings, getNewSettings, getSetting} from '../../store/settings';
import {layoutTypes} from '../../types';
import {Panel} from 'office-ui-fabric-react/lib/Panel';
import {DefaultButton} from 'office-ui-fabric-react/lib/Button';
import {SpinButton} from 'office-ui-fabric-react/lib/SpinButton';
import {ColorPicker} from 'office-ui-fabric-react/lib/ColorPicker';
import i18n from '../../i18n';

describe('Setting', () => {
    // can not use toHaveReturnedWith() until Jest 23
    // TODO: wait for create-react-app update
    let newSetting;
    const onSetSetting = jest.fn((path, value) => newSetting = getSetting(getNewSettings(defaultSettings, path, value), path));

    describe('Toggle', () => {
        it('toggles a setting', () => {
            const wrapper = shallow(<Setting.Toggle
                    settings={defaultSettings}
                    onSetSetting={onSetSetting}
                    path="featureDiagram.treeLayout.debug"
                />),
                oldValue = wrapper.prop('checked');
            newSetting = null;
            wrapper.simulate('click');
            expect(newSetting).toBe(!oldValue);
        });
    });

    describe('FontComboBox', () => {
        it('sets a font', () => {
            const wrapper = shallow(<Setting.FontComboBox
                settings={defaultSettings}
                onSetSetting={onSetSetting}
                path="featureDiagram.font.family"
            />);
            newSetting = null;
            wrapper.simulate('change', 'Times New Roman');
            expect(newSetting).toBe('Times New Roman');
        });
    });

    describe('SpinButton', () => {
        const wrapper = () => shallow(<Setting.SpinButton
            settings={defaultSettings}
            onSetSetting={onSetSetting}
            path="featureDiagram.font.size"
            suffix=" px"
        />);

        it('sets a number', () => {
            newSetting = null;
            wrapper().find(SpinButton).simulate('validate', '42 px');
            expect(newSetting).toBe(42);
        });

        it('increments a number', () => {
            newSetting = null;
            wrapper().find(SpinButton).simulate('increment', '42 px');
            expect(newSetting).toBe(43);
        });

        it('decrements a number', () => {
            newSetting = null;
            wrapper().find(SpinButton).simulate('decrement', '42 px');
            expect(newSetting).toBe(41);
        });
    });

    describe('ColorPickerContextualMenu', () => {
        it('sets a color', () => {
            const wrapper = shallow(<Setting.ColorPickerContextualMenu
                settings={defaultSettings}
                onSetSetting={onSetSetting}
                paths={['featureDiagram.treeLayout.node.visibleFill']}
            />);
            newSetting = null;
            wrapper.find(ColorPicker).simulate('colorChanged', '#c0ffee');
            wrapper.simulate('apply', {key: 'featureDiagram.treeLayout.node.visibleFill'});
            expect(newSetting).toBe('#c0ffee');
        });
    });
});

describe('SettingsPanel', () => {
    const mock = jest.fn(),
        settingsPanel = featureDiagramLayout => shallow(
            <SettingsPanel
                isOpen={true}
                onDismissed={mock}
                settings={defaultSettings}
                onSetSetting={mock}
                onResetSettings={mock}
                featureDiagramLayout={featureDiagramLayout}/>
        );

    it('displays different settings depending on the layout', () => {
        expect(settingsPanel(layoutTypes.verticalTree).find(Panel)
            .contains(i18n.t('panels.settingsPanel.headings.verticalTree'))).toBe(true);
        expect(settingsPanel(layoutTypes.horizontalTree).find(Panel)
            .contains(i18n.t('panels.settingsPanel.headings.horizontalTree'))).toBe(true);
    });

    it('resets settings', () => {
        const wrapper = settingsPanel(layoutTypes.verticalTree),
            resetButton = wrapper => wrapper.find(DefaultButton).first();
        expect(resetButton(wrapper).prop('disabled')).toBe(true);
        
        wrapper.find(Panel).find(Setting.SpinButton).first()
            .simulate('setSetting', 'featureDiagram.font.size', 'Arial');
        expect(resetButton(wrapper).prop('disabled')).toBe(false);

        resetButton(wrapper).simulate('click');
        expect(resetButton(wrapper).prop('disabled')).toBe(true);
    });
});