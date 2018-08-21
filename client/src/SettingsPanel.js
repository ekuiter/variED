import React from 'react';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import {Toggle} from 'office-ui-fabric-react/lib/Toggle';
import {SpinButton} from 'office-ui-fabric-react/lib/SpinButton';
import {getSetting} from './settings';
import Actions from './Actions';
import i18n from './i18n';
import FontComboBox from './helpers/FontComboBox';

function defer(fn) {
    return (...args) => window.setTimeout(() => fn(...args), 0);
}

const getSettingComponents = (settings, dispatch) => {
    const getLabel = path => i18n.t('settingsPanel.labels', path);
    return {
        Toggle: ({path}) => (
            <Toggle
                className="setting"
                label={getLabel(path)}
                checked={getSetting(settings, path)}
                onText={i18n.t('settingsPanel.toggleOn')}
                offText={i18n.t('settingsPanel.toggleOn')}
                onClick={() => dispatch(Actions.setSetting(path, bool => !bool))}/>
        ),
        FontComboBox: ({path}) => (
            <FontComboBox
                className="setting"
                label={getLabel(path)}
                selectedFont={getSetting(settings, path)}
                onChanged={font => dispatch(Actions.setSetting(path, font))}/>
        ),
        SpinButton: class extends React.Component {
            static defaultProps = {
                path: null, min: null, max: null, step: 1, suffix: ''
            };

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

            getValue = path => getSetting(settings, path) + this.props.suffix;

            onChange = value => dispatch(Actions.setSetting(this.props.path, value));

            onValidate = value => {
                value = this.removeSuffix(value);
                if (value.trim().length === 0 || isNaN(+value))
                    return this.getValue(this.props.path);
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
                    <div className="setting">
                        <SpinButton
                            label={getLabel(this.props.path)}
                            value={this.getValue(this.props.path)}
                            onValidate={this.onValidate}
                            onIncrement={this.onIncrement}
                            onDecrement={this.onDecrement}
                            styles={{labelWrapper: {marginTop: 6}}}/>
                    </div>
                );
            }
        }
    };
};

export default class extends React.Component {
    static defaultProps = {
        isOpen: false, onDismiss: null
    };

    render() {
        const {settings, dispatch} = this.props,
            Setting = getSettingComponents(settings, defer(dispatch));
        return (
            <Panel
                className="settingsPanel"
                isOpen={this.props.isOpen}
                type={PanelType.smallFixedFar}
                onDismiss={this.props.onDismiss}
                isLightDismiss={true}
                headerText={i18n.t('settingsPanel.title')}>
                <h4>{i18n.t('settingsPanel.headings.featureDiagram')}</h4>
                <Setting.FontComboBox path="featureDiagram.font.family"/>
                <Setting.SpinButton path="featureDiagram.font.size" min={5} max={50} suffix=" px"/>
                <Setting.Toggle path="featureDiagram.treeLayout.useTransitions"/>
                <Setting.Toggle path="featureDiagram.treeLayout.debug"/>
                <h4>{i18n.t('settingsPanel.headings.features')}</h4>
                <Setting.SpinButton path="featureDiagram.treeLayout.node.paddingX" min={0} max={100} suffix=" px"/>
                <Setting.SpinButton path="featureDiagram.treeLayout.node.paddingY" min={0} max={100} suffix=" px"/>
                <Setting.SpinButton path="featureDiagram.treeLayout.node.strokeWidth" min={0} max={50} step={0.5} suffix=" px"/>
            </Panel>
        );
    }
}
;