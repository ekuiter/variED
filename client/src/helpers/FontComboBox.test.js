import React from 'react';
import FontComboBox from './FontComboBox';
import {shallow} from 'enzyme';
import {ComboBox} from 'office-ui-fabric-react/lib/ComboBox';
import isFontInstalled from './isFontInstalled';

jest.mock('./isFontInstalled');

describe('FontComboBox', () => {
    const fontComboBox = (onChange = jest.fn()) => shallow(
        <FontComboBox
            selectedFont="Arial"
            onChange={onChange}/>
    );

    it('renders correctly', () => {
        isFontInstalled.mockReturnValue(true);
        const wrapper = fontComboBox();
        expect(wrapper.find(ComboBox).prop('text')).toBe('Arial');
        expect(wrapper.find(ComboBox).prop('options'))
            .toContainEqual({key: 'Arial', text: 'Arial', fontFamily: '\'Arial\''});
        expect(wrapper).toMatchSnapshot();
    });

    it('renders font options', () => {
        isFontInstalled.mockReturnValue(true);
        const wrapper = fontComboBox();
        expect(wrapper.find(ComboBox).prop('onRenderOption')(
            {key: 'Arial', text: 'Arial', fontFamily: '\'Arial\''})).toMatchSnapshot();
    });

    it('changes a font if it is installed', () => {
        isFontInstalled.mockReturnValue(true);
        const onChange = jest.fn(),
            wrapper = fontComboBox(onChange);
        wrapper.find(ComboBox).simulate('change', {key: 'Verdana'});
        expect(onChange).toBeCalledWith('Verdana');
    });

    it('displays an error if a font is not installed', () => {
        isFontInstalled.mockReturnValue(false);
        const onChange = jest.fn(),
            wrapper = fontComboBox(onChange);
        expect(wrapper.find(ComboBox).prop('errorMessage')).toBeFalsy();
        wrapper.find(ComboBox).simulate('change', {key: 'Verdana'});
        expect(onChange).not.toBeCalledWith('Verdana');
        expect(wrapper.find(ComboBox).prop('errorMessage')).toBeTruthy();
    });

    it('does nothing if no font is provided', () => {
        isFontInstalled.mockReturnValue(true);
        const onChange = jest.fn(),
            wrapper = fontComboBox(onChange);
        wrapper.find(ComboBox).simulate('change');
        expect(onChange).not.toBeCalled();
    });
});