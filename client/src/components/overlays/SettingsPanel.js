import React from 'react';
import {getSetting} from '../../store/settings';
import i18n from '../../i18n';
import FontComboBox from '../../helpers/FontComboBox';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import {Toggle} from 'office-ui-fabric-react/lib/Toggle';
import {SpinButton} from 'office-ui-fabric-react/lib/SpinButton';
import {ColorPicker} from 'office-ui-fabric-react/lib/ColorPicker';
import {DialogContextualMenu} from '../../helpers/Dialog';
import {DefaultButton} from 'office-ui-fabric-react/lib/Button';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {LayoutType, layoutTypes, SettingsType} from '../../types';

const getLabel = path => i18n.t('panels.settingsPanel.labels', path);

export const Setting = {
    Toggle: ({settings, onSetSetting, path}) => (
        <Toggle
            className="setting"
            label={getLabel(path)}
            checked={getSetting(settings, path)}
            onText={i18n.t('panels.settingsPanel.toggleOn')}
            offText={i18n.t('panels.settingsPanel.toggleOn')}
            onClick={() => onSetSetting(path, bool => !bool)}/>
    ),

    FontComboBox: ({settings, onSetSetting, path}) => (
        <FontComboBox
            className="setting"
            label={getLabel(path)}
            selectedFont={getSetting(settings, path)}
            onChanged={font => onSetSetting(path, font)}/>
    ),

    SpinButton: class extends React.Component {
        propTypes = exact({
            settings: SettingsType.isRequired,
            onSetSetting: PropTypes.func.isRequired,
            path: PropTypes.string.isRequired,
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

        getValue = path => getSetting(this.props.settings, path) + this.props.suffix;
        onChange = value => this.props.onSetSetting(this.props.path, value);

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
                        iconProps={this.props.iconProps}
                        styles={{label: {marginTop: 6, marginLeft: 4}, icon: {marginTop: 3}}}/>
                </div>
            );
        }
    },

    ColorPickerContextualMenu: class extends React.Component {
        propTypes = exact({
            settings: SettingsType.isRequired,
            onSetSetting: PropTypes.func.isRequired,
            paths: PropTypes.arrayOf(PropTypes.string).isRequired
        });
        
        state = {color: null};
        onColorChanged = color => this.setState({color});
        onApply = option => this.props.onSetSetting(option.key, this.state.color);
        onRender = option => this.setState({color: getSetting(this.props.settings, option.key)});

        render() {
            return (
                <DialogContextualMenu
                    label={i18n.t('panels.settingsPanel.customizeColors')}
                    options={this.props.paths.map(path => ({key: path, text: getLabel(path)}))}
                    onApply={this.onApply}
                    onRender={this.onRender}
                    iconProps={{iconName: 'Color'}}>
                    <ColorPicker
                        color={this.state.color}
                        onColorChanged={this.onColorChanged}/>
                </DialogContextualMenu>
            );
        }
    }
};

Setting.Toggle.propTypes = exact({
    settings: SettingsType.isRequired,
    onSetSetting: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired
});

Setting.FontComboBox.propTypes = exact({
    settings: SettingsType.isRequired,
    onSetSetting: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired
});

export default class extends React.Component {
    propTypes = {
        onDismissed: PropTypes.func.isRequired,
        isOpen: PropTypes.bool.isRequired,
        settings: SettingsType.isRequired,
        featureDiagramLayout: LayoutType.isRequired,
        onSetSetting: PropTypes.func.isRequired,
        onResetSettings: PropTypes.func.isRequired
    };

    state = {canReset: false};

    resettableSetSetting = (...args) => {
        this.setState({canReset: true});
        this.props.onSetSetting(...args);
    };

    onReset = () => {
        this.setState({canReset: false});
        this.props.onResetSettings();
    };

    render() {
        const props = {settings: this.props.settings, onSetSetting: this.resettableSetSetting},
            featureDiagramLayout = this.props.featureDiagramLayout;
        return (
            <Panel
                className="settingsPanel"
                isOpen={this.props.isOpen}
                type={PanelType.smallFixedFar}
                onDismissed={this.props.onDismissed}
                isLightDismiss={true}
                headerText={i18n.t('panels.settingsPanel.title')}>

                <DefaultButton
                    onClick={this.onReset}
                    disabled={!this.state.canReset}
                    text={i18n.t('panels.settingsPanel.resetToDefaults')}/>

                <h4>{i18n.t('panels.settingsPanel.headings.featureDiagram')}</h4>
                <Setting.FontComboBox
                    {...props}
                    path="featureDiagram.font.family"/>
                <Setting.SpinButton
                    {...props}
                    path="featureDiagram.font.size"
                    min={5} max={50} suffix=" px"/>

                {(featureDiagramLayout === layoutTypes.verticalTree || featureDiagramLayout === layoutTypes.horizontalTree) &&
                <React.Fragment>
                    <Setting.Toggle
                        {...props}
                        path="featureDiagram.treeLayout.useTransitions"/>
                    <Setting.Toggle
                        {...props}
                        path="featureDiagram.treeLayout.debug"/>

                    <h4>{i18n.t('panels.settingsPanel.headings.features')}</h4>
                    <Setting.SpinButton
                        {...props}
                        path="featureDiagram.treeLayout.node.paddingX"
                        iconProps={{
                            iconName: 'Padding',
                            styles: {root: {transform: 'rotate(90deg)', marginLeft: -2, marginRight: 2}}
                        }}
                        min={0} max={100} suffix=" px"/>
                    <Setting.SpinButton
                        {...props}
                        path="featureDiagram.treeLayout.node.paddingY"
                        iconProps={{iconName: 'Padding'}}
                        min={0} max={100} suffix=" px"/>
                    <Setting.SpinButton
                        {...props}
                        path="featureDiagram.treeLayout.node.strokeWidth"
                        iconProps={{iconName: 'LineThickness'}}
                        min={0} max={50} step={0.5} suffix=" px"/>
                    <Setting.SpinButton
                        {...props}
                        path="featureDiagram.treeLayout.link.circleRadius"
                        iconProps={{iconName: 'StatusCircleInner'}}
                        min={0} max={50} step={0.5} suffix=" px"/>
                    <Setting.ColorPickerContextualMenu
                        {...props}
                        paths={[
                            'featureDiagram.treeLayout.node.visibleFill',
                            'featureDiagram.treeLayout.node.hiddenFill',
                            'featureDiagram.treeLayout.node.abstractFill',
                            'featureDiagram.treeLayout.node.abstractStroke',
                            'featureDiagram.treeLayout.node.concreteFill',
                            'featureDiagram.treeLayout.node.concreteStroke'
                        ]}/>

                    <h4>{i18n.t('panels.settingsPanel.headings.edges')}</h4>
                    <Setting.SpinButton
                        {...props}
                        path="featureDiagram.treeLayout.link.strokeWidth"
                        iconProps={{iconName: 'LineThickness'}}
                        min={0} max={50} step={0.5} suffix=" px"/>
                    <Setting.ColorPickerContextualMenu
                        {...props}
                        paths={['featureDiagram.treeLayout.link.stroke']}/>

                    {featureDiagramLayout === layoutTypes.verticalTree
                        ? <React.Fragment>
                            <h4>{i18n.t('panels.settingsPanel.headings.verticalTree')}</h4>
                            <Setting.SpinButton
                                {...props}
                                path="featureDiagram.treeLayout.vertical.marginX"
                                iconProps={{
                                    iconName: 'Spacer',
                                    styles: {root: {transform: 'rotate(90deg)', marginLeft: -2, marginRight: 2}}
                                }}
                                min={0} max={200} suffix=" px"/>
                            <Setting.SpinButton
                                {...props}
                                path="featureDiagram.treeLayout.vertical.layerHeight"
                                iconProps={{iconName: 'Spacer'}}
                                min={0} max={200} suffix=" px"/>
                            <Setting.SpinButton
                                {...props}
                                path="featureDiagram.treeLayout.vertical.groupRadius"
                                iconProps={{iconName: 'QuarterCircle'}}
                                min={0} max={50} step={0.5} suffix=" px"/>
                        </React.Fragment>

                        : featureDiagramLayout === layoutTypes.horizontalTree
                            ? <React.Fragment>
                                <h4>{i18n.t('panels.settingsPanel.headings.horizontalTree')}</h4>
                                <Setting.SpinButton
                                    {...props}
                                    path="featureDiagram.treeLayout.horizontal.layerMargin"
                                    iconProps={{
                                        iconName: 'Spacer',
                                        styles: {root: {transform: 'rotate(90deg)', marginLeft: -2, marginRight: 2}}
                                    }}
                                    min={0} max={200} suffix=" px"/>
                                <Setting.SpinButton
                                    {...props}
                                    path="featureDiagram.treeLayout.horizontal.marginY"
                                    iconProps={{iconName: 'Spacer'}}
                                    min={0} max={200} suffix=" px"/>
                            </React.Fragment>
                            : null}
                </React.Fragment>}
            </Panel>
        );
    }
}