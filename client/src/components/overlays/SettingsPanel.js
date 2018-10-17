/**
 * The application's main settings panel.
 * It exposes context-sensitive settings. Changes are reflected in the application at once.
 */

import React from 'react';
import {getSetting} from '../../store/settings';
import i18n from '../../i18n';
import FontComboBox from '../../helpers/FontComboBox';
import SpinButton from '../../helpers/SpinButton';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import {Toggle} from 'office-ui-fabric-react/lib/Toggle';
import {ColorPicker} from 'office-ui-fabric-react/lib/ColorPicker';
import {Slider} from 'office-ui-fabric-react/lib/Slider';
import {DialogContextualMenu} from '../../helpers/Dialog';
import {DefaultButton} from 'office-ui-fabric-react/lib/Button';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';
import {LayoutType, layoutTypes, SettingsType} from '../../types';
import debounce from '../../helpers/debounce';

const getLabel = path => i18n.t('overlays.settingsPanel.labels', path);

export const Setting = {
    Toggle: ({settings, onSetSetting, path}) => (
        <Toggle
            className="setting"
            label={getLabel(path)}
            checked={getSetting(settings, path)}
            onText={i18n.t('overlays.settingsPanel.toggleOn')}
            offText={i18n.t('overlays.settingsPanel.toggleOn')}
            onClick={() => onSetSetting(path, bool => !bool)}/>
    ),

    FontComboBox: ({settings, onSetSetting, path}) => (
        <FontComboBox
            className="setting"
            label={getLabel(path)}
            selectedFont={getSetting(settings, path)}
            onChange={font => onSetSetting(path, font)}/>
    ),

    SpinButton: ({settings, onSetSetting, path, ...props}) => (
        <SpinButton
            className="setting"
            label={getLabel(path)}
            value={getSetting(settings, path)}
            onChange={value => onSetSetting(path, value)}
            {...props}/>
    ),
    
    ColorPickerContextualMenu: class extends React.Component {
        static propTypes = exact({
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
                    label={i18n.t('overlays.settingsPanel.customizeColors')}
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
    },

    Slider: class extends React.Component {
        static propTypes = exact({
            settings: SettingsType.isRequired,
            onSetSetting: PropTypes.func.isRequired,
            path: PropTypes.string.isRequired,
            min: PropTypes.number.isRequired,
            max: PropTypes.number.isRequired,
            step: PropTypes.number.isRequired
        });

        onChange = debounce(value => this.props.onSetSetting(this.props.path, value),
            getSetting(this.props.settings, 'overlays.settingsPanel.debounceUpdate'));

        render() {
            return (
                <div className="setting">
                    <Slider
                        label={getLabel(this.props.path)}
                        min={this.props.min}
                        max={this.props.max}
                        step={this.props.step}
                        value={getSetting(this.props.settings, this.props.path)}
                        onChange={this.onChange}/>
                </div>
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

Setting.SpinButton.propTypes = {
    settings: SettingsType.isRequired,
    onSetSetting: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired
};

export default class extends React.Component {
    static propTypes = {
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
                headerText={i18n.t('overlays.settingsPanel.title')}>

                <DefaultButton
                    onClick={this.onReset}
                    disabled={!this.state.canReset}
                    text={i18n.t('overlays.settingsPanel.resetToDefaults')}/>

                <h4>{i18n.t('overlays.settingsPanel.headings.featureDiagram')}</h4>
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
                        path="featureDiagram.treeLayout.debug"/>
                    <Setting.Toggle
                        {...props}
                        path="featureDiagram.treeLayout.useTransitions"/>
                    {getSetting(props.settings, 'featureDiagram.treeLayout.useTransitions') &&
                    <Setting.Slider
                        {...props}
                        path="featureDiagram.treeLayout.transitionDuration"
                        min={0} max={1000} step={10}/>}

                    <h4>{i18n.t('overlays.settingsPanel.headings.features')}</h4>
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

                    <h4>{i18n.t('overlays.settingsPanel.headings.edges')}</h4>
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
                            <h4>{i18n.t('overlays.settingsPanel.headings.verticalTree')}</h4>
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
                        : <React.Fragment>
                            <h4>{i18n.t('overlays.settingsPanel.headings.horizontalTree')}</h4>
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
                        </React.Fragment>}
                </React.Fragment>}
            </Panel>
        );
    }
}