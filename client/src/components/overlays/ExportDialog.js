import React from 'react';
import i18n from '../../i18n';
import PropTypes from 'prop-types';
import {Dialog, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import FontComboBox from '../../helpers/FontComboBox';
import SpinButton from '../../helpers/SpinButton';
import {getSetting} from '../../store/settings';
import {SettingsType, LayoutType, formatTypes, FormatType} from '../../types';
import {doExport} from '../featureDiagram/export';

export default class extends React.Component {
    static propTypes = {
        onDismiss: PropTypes.func.isRequired,
        isOpen: PropTypes.bool.isRequired,
        settings: SettingsType.isRequired,
        onSetSetting: PropTypes.func.isRequired,
        featureDiagramLayout: LayoutType.isRequired,
        format: FormatType.isRequired
    };

    state = {zoom: 100, quality: 80};
    onZoomChange = zoom => this.setState({zoom});
    onQualityChange = quality => this.setState({quality});

    onSubmit = () => {
        doExport(this.props.featureDiagramLayout, this.props.format, {
            scale: this.state.zoom / 100,
            quality: this.state.quality / 100
        });
        this.props.onDismiss();
    };

    renderZoomSpinButton = () => (
        <SpinButton
            className="setting"
            label={i18n.t('dialogs.exportDialog.zoom')}
            onChange={this.onZoomChange}
            value={this.state.zoom}
            min={10} max={1000} suffix=" %"/>
    );
    
    render() {
        return (
            <Dialog
                hidden={!this.props.isOpen}
                onDismiss={this.props.onDismiss}
                dialogContentProps={{title: i18n.t('dialogs.exportDialog', this.props.format, 'title')}}>
                {this.props.format === formatTypes.svg &&
                <React.Fragment>
                    {i18n.t('dialogs.exportDialog.svg.content')}
                    <FontComboBox
                        label={i18n.t('panels.settingsPanel.labels.featureDiagram.font.family')}
                        selectedFont={getSetting(this.props.settings, 'featureDiagram.font.family')}
                        onChange={font => this.props.onSetSetting('featureDiagram.font.family', font)}/>
                </React.Fragment>}
                {this.props.format === formatTypes.png && this.renderZoomSpinButton()}
                {this.props.format === formatTypes.jpg &&
                <React.Fragment>
                    {this.renderZoomSpinButton()}
                    <SpinButton
                        className="setting"
                        label={i18n.t('dialogs.exportDialog.jpg.quality')}
                        onChange={this.onQualityChange}
                        value={this.state.quality}
                        min={10} max={100} suffix=" %"/>
                </React.Fragment>}
                <DialogFooter>
                    <PrimaryButton onClick={this.onSubmit} text={i18n.t('dialogs.exportDialog.export')}/>
                </DialogFooter>
            </Dialog>
        );
    }
}