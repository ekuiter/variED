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

    state = {zoom: 100};

    onSubmit = () => doExport(this.props.featureDiagramLayout, this.props.format, this.state.zoom / 100);
    onZoomChange = zoom => this.setState({zoom});

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
                {this.props.format === formatTypes.png &&
                <React.Fragment>
                    <SpinButton
                        label={i18n.t('dialogs.exportDialog.png.zoom')}
                        onChange={this.onZoomChange}
                        value={this.state.zoom}
                        min={10} max={1000} suffix=" %"/>
                </React.Fragment>}
                <DialogFooter>
                    <PrimaryButton onClick={this.onSubmit} text={i18n.t('dialogs.exportDialog.export')}/>
                </DialogFooter>
            </Dialog>
        );
    }
}