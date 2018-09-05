import React from 'react';
import SpinButton from './SpinButton';
import {shallow} from 'enzyme';
import {SpinButton as FabricSpinButton} from 'office-ui-fabric-react/lib/SpinButton';

describe('SpinButton', () => {
    const spinButton = ({min, max, onChange} = {}) => shallow(<SpinButton
        value={10}
        onChange={onChange}
        suffix=" px" min={min} max={max}/>);

    it('sets a number', () => {
        const onChange = jest.fn();
        spinButton({onChange}).find(FabricSpinButton).simulate('validate', '42 px');
        expect(onChange).toBeCalledWith(42);
    });

    it('increments a number', () => {
        const onChange = jest.fn();
        spinButton({onChange}).find(FabricSpinButton).simulate('increment', '42 px');
        expect(onChange).toBeCalledWith(43);
    });

    it('decrements a number', () => {
        const onChange = jest.fn();
        spinButton({onChange}).find(FabricSpinButton).simulate('decrement', '42 px');
        expect(onChange).toBeCalledWith(41);
    });

    it('clamps numbers', () => {
        const onChange = jest.fn();
        spinButton({min: 10, onChange}).find(FabricSpinButton).simulate('validate', '5 px');
        expect(onChange).toBeCalledWith(10);
        spinButton({max: 20, onChange}).find(FabricSpinButton).simulate('validate', '25 px');
        expect(onChange).toBeCalledWith(20);
    });

    it('does nothing if the input is not a number', () => {
        const onChange = jest.fn();
        spinButton({onChange}).find(FabricSpinButton).simulate('validate', '<invalid input>');
        expect(onChange).not.toBeCalled();
    });
});