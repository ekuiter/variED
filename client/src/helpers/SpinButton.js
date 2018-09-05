import React from 'react';
import {SpinButton} from 'office-ui-fabric-react/lib/SpinButton';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

export default class extends React.Component {
    static propTypes = exact({
        label: PropTypes.string,
        value: PropTypes.number.isRequired,
        onChange: PropTypes.func.isRequired,
        className: PropTypes.string,
        min: PropTypes.number,
        max: PropTypes.number,
        step: PropTypes.number,
        suffix: PropTypes.string,
        iconProps: PropTypes.object
    });

    static defaultProps = {step: 1, suffix: ''};

    removeSuffix = value =>
        this.props.suffix && String(value).endsWith(this.props.suffix)
            ? String(value).substr(0, value.length - this.props.suffix.length)
            : String(value);

    sanitizeValue = value => {
        if (this.props.min !== null && value < this.props.min)
            value = this.props.min;
        if (this.props.max !== null && value > this.props.max)
            value = this.props.max;
        return value;
    };

    getValue = () => this.props.value + this.props.suffix;
    onChange = value => this.props.onChange(value);

    onValidate = value => {
        value = this.removeSuffix(value);
        if (value.trim().length === 0 || isNaN(+value))
            return this.getValue();
        value = this.sanitizeValue(+value);
        this.onChange(+value);
        return String(value) + this.props.suffix;
    };

    onIncrement = value => {
        value = this.removeSuffix(value);
        value = this.sanitizeValue(+value + this.props.step);
        this.onChange(value);
        return String(value) + this.props.suffix;
    };

    onDecrement = value => {
        value = this.removeSuffix(value);
        value = this.sanitizeValue(+value - this.props.step);
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