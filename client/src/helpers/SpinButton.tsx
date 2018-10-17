/**
 * A Fabric text field that allows in- and decrementing the contained number value.
 */

import React from 'react';
import {SpinButton} from 'office-ui-fabric-react/lib/SpinButton';
import {IIconProps} from 'office-ui-fabric-react/lib/Icon';

export interface SpinButtonProps {
    label?: string,
    value: number,
    onChange: (value: number) => void,
    className?: string,
    min?: number,
    max?: number,
    step?: number,
    suffix?: string,
    iconProps?: IIconProps
};

export default class extends React.Component<SpinButtonProps> {
    static defaultProps: Partial<SpinButtonProps> = {step: 1, suffix: ''};

    removeSuffix = (value: string) =>
        this.props.suffix && value.endsWith(this.props.suffix)
            ? value.substr(0, value.length - this.props.suffix.length)
            : value;

    sanitizeValue = (value: number) => {
        if (typeof this.props.min !== 'undefined' && value < this.props.min)
            value = this.props.min;
        if (typeof this.props.max !== 'undefined' && value > this.props.max)
            value = this.props.max;
        return value;
    };

    getValue = (): string => this.props.value + this.props.suffix!;
    onChange = (value: number) => this.props.onChange(value);

    onValidate = (valueString: string) => {
        valueString = this.removeSuffix(valueString);
        if (valueString.trim().length === 0 || isNaN(+valueString))
            return this.getValue();
        const value = this.sanitizeValue(+valueString);
        this.onChange(+value);
        return String(value) + this.props.suffix;
    };

    onIncrement = (valueString: string) => {
        valueString = this.removeSuffix(valueString);
        const value = this.sanitizeValue(+valueString + this.props.step!);
        this.onChange(value);
        return String(value) + this.props.suffix;
    };

    onDecrement = (valueString: string) => {
        valueString = this.removeSuffix(valueString);
        const value = this.sanitizeValue(+valueString - this.props.step!);
        this.onChange(value);
        return String(value) + this.props.suffix;
    };

    render() {
        return (
            <div className={this.props.className}>
                <SpinButton
                    label={this.props.label}
                    value={this.getValue()}
                    onValidate={this.onValidate}
                    onIncrement={this.onIncrement}
                    onDecrement={this.onDecrement}
                    iconProps={this.props.iconProps}
                    styles={{label: {marginTop: 6, marginLeft: 4}, icon: {marginTop: 3}}}/>
            </div>
        );
    }
}