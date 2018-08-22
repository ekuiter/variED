import React from 'react';
import {getSetting} from './settings';
import Actions from './Actions';
import i18n from './i18n';
import FontComboBox from './helpers/FontComboBox';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import {Toggle} from 'office-ui-fabric-react/lib/Toggle';
import {SpinButton} from 'office-ui-fabric-react/lib/SpinButton';
import {ColorPicker} from 'office-ui-fabric-react/lib/ColorPicker';
import {DialogContextualMenu} from './helpers/Dialog';

const defer = fn => (...args) => window.setTimeout(() => fn(...args), 0),
    getLabel = path => i18n.t('settingsPanel.labels', path);

const Setting = {
    Toggle: ({settings, dispatch, path}) => (
        <Toggle
            className="setting"
            label={getLabel(path)}
            checked={getSetting(settings, path)}
            onText={i18n.t('settingsPanel.toggleOn')}
            offText={i18n.t('settingsPanel.toggleOn')}
            onClick={() => dispatch(Actions.settings.set(path, bool => !bool))}/>
    ),

    FontComboBox: ({settings, dispatch, path}) => (
        <FontComboBox
            className="setting"
            label={getLabel(path)}
            selectedFont={getSetting(settings, path)}
            onChanged={font => dispatch(Actions.settings.set(path, font))}/>
    ),

    SpinButton: class extends React.Component {
        static defaultProps = {
            settings: null, dispatch: null, path: null, min: null, max: null, step: 1, suffix: '', iconProps: null
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

        getValue = path => getSetting(this.props.settings, path) + this.props.suffix;
        onChange = value => this.props.dispatch(Actions.settings.set(this.props.path, value));

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
        static defaultProps = {settings: null, dispatch: null, paths: null};
        state = {color: null};
        onColorChanged = color => this.setState({color});
        onApply = option => this.props.dispatch(Actions.settings.set(option.key, this.state.color));
        onRender = option => this.setState({color: getSetting(this.props.settings, option.key)});

        render() {
            return (
                <DialogContextualMenu
                    label={i18n.t('settingsPanel.customizeColors')}
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

export default class extends React.Component {
    static defaultProps = {
        isOpen: false, onDismiss: null, featureDiagramLayout: null, settings: null, dispatch: null
    };

    render() {
        const {settings, dispatch} = this.props,
            deferredDispatch = defer(dispatch),
            props = {settings, dispatch},
            deferredProps = {settings, dispatch: deferredDispatch},
            featureDiagramLayout = this.props.featureDiagramLayout;
        return (
            <Panel
                className="settingsPanel"
                isOpen={this.props.isOpen}
                type={PanelType.smallFixedFar}
                onDismiss={this.props.onDismiss}
                isLightDismiss={true}
                headerText={i18n.t('settingsPanel.title')}>

                <h4>{i18n.t('settingsPanel.headings.featureDiagram')}</h4>
                <Setting.FontComboBox
                    {...deferredProps}
                    path="featureDiagram.font.family"/>
                <Setting.SpinButton
                    {...deferredProps}
                    path="featureDiagram.font.size"
                    min={5} max={50} suffix=" px"/>

                {(featureDiagramLayout === 'verticalTree' || featureDiagramLayout === 'horizontalTree') &&
                <React.Fragment>
                    <Setting.Toggle
                        {...deferredProps}
                        path="featureDiagram.treeLayout.useTransitions"/>
                    <Setting.Toggle
                        {...deferredProps}
                        path="featureDiagram.treeLayout.debug"/>

                    <h4>{i18n.t('settingsPanel.headings.features')}</h4>
                    <Setting.SpinButton
                        {...deferredProps}
                        path="featureDiagram.treeLayout.node.paddingX"
                        iconProps={{
                            iconName: 'Padding',
                            styles: {root: {transform: 'rotate(90deg)', marginLeft: -2, marginRight: 2}}
                        }}
                        min={0} max={100} suffix=" px"/>
                    <Setting.SpinButton
                        {...deferredProps}
                        path="featureDiagram.treeLayout.node.paddingY"
                        iconProps={{iconName: 'Padding'}}
                        min={0} max={100} suffix=" px"/>
                    <Setting.SpinButton
                        {...deferredProps}
                        path="featureDiagram.treeLayout.node.strokeWidth"
                        iconProps={{iconName: 'LineThickness'}}
                        min={0} max={50} step={0.5} suffix=" px"/>
                    <Setting.SpinButton
                        {...deferredProps}
                        path="featureDiagram.treeLayout.link.circleRadius"
                        iconProps={{iconName: 'StatusCircleInner'}}
                        min={0} max={50} step={0.5} suffix=" px"/>
                    <Setting.ColorPickerContextualMenu
                        {...props}
                        paths={[
                            'featureDiagram.treeLayout.node.abstractFill',
                            'featureDiagram.treeLayout.node.abstractStroke',
                            'featureDiagram.treeLayout.node.concreteFill',
                            'featureDiagram.treeLayout.node.concreteStroke',
                            'featureDiagram.treeLayout.node.hiddenFill']}/>

                    <h4>{i18n.t('settingsPanel.headings.edges')}</h4>
                    <Setting.SpinButton
                        {...deferredProps}
                        path="featureDiagram.treeLayout.link.strokeWidth"
                        iconProps={{iconName: 'LineThickness'}}
                        min={0} max={50} step={0.5} suffix=" px"/>
                    <Setting.ColorPickerContextualMenu
                        {...props}
                        paths={['featureDiagram.treeLayout.link.stroke']}/>

                    {featureDiagramLayout === 'verticalTree'
                        ? <React.Fragment>
                            <h4>{i18n.t('settingsPanel.headings.verticalTree')}</h4>
                            <Setting.SpinButton
                                {...deferredProps}
                                path="featureDiagram.treeLayout.vertical.marginX"
                                iconProps={{
                                    iconName: 'Spacer',
                                    styles: {root: {transform: 'rotate(90deg)', marginLeft: -2, marginRight: 2}}
                                }}
                                min={0} max={200} suffix=" px"/>
                            <Setting.SpinButton
                                {...deferredProps}
                                path="featureDiagram.treeLayout.vertical.layerHeight"
                                iconProps={{iconName: 'Spacer'}}
                                min={0} max={200} suffix=" px"/>
                            <Setting.SpinButton
                                {...deferredProps}
                                path="featureDiagram.treeLayout.vertical.groupRadius"
                                iconProps={{iconName: 'QuarterCircle'}}
                                min={0} max={50} step={0.5} suffix=" px"/>
                        </React.Fragment>

                        : featureDiagramLayout === 'horizontalTree'
                            ? <React.Fragment>
                                <h4>{i18n.t('settingsPanel.headings.horizontalTree')}</h4>
                                <Setting.SpinButton
                                    {...deferredProps}
                                    path="featureDiagram.treeLayout.horizontal.layerMargin"
                                    iconProps={{
                                        iconName: 'Spacer',
                                        styles: {root: {transform: 'rotate(90deg)', marginLeft: -2, marginRight: 2}}
                                    }}
                                    min={0} max={200} suffix=" px"/>
                                <Setting.SpinButton
                                    {...deferredProps}
                                    path="featureDiagram.treeLayout.horizontal.marginY"
                                    iconProps={{iconName: 'Spacer'}}
                                    min={0} max={200} suffix=" px"/>
                            </React.Fragment>
                            : null}
                </React.Fragment>}
            </Panel>
        );
    }
};