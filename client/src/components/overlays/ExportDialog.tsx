/**
 * A Fabric dialog for exporting a feature diagram.
 */

import React from 'react';
import i18n from '../../i18n';
import {Dialog, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import FontComboBox from '../../helpers/FontComboBox';
import SpinButton from '../../helpers/SpinButton';
import {getSetting} from '../../store/settings';
import {formatTypes} from '../../types';
import {doExport} from '../featureDiagram/export';

interface Props {
    onDismiss: () => void,
    isOpen: boolean,
    settings: object,
    onSetSetting: (path: string, value: any) => void, // TODO
    featureDiagramLayout: string,
    format: string
};

interface State {
    zoom: number,
    quality: number
};

export default class extends React.Component<Props, State> {
    state: State = {zoom: 100, quality: 80};
    onZoomChange = (zoom: number) => this.setState({zoom});
    onQualityChange = (quality: number) => this.setState({quality});

    onSubmit = () => {
        doExport(this.props.featureDiagramLayout, this.props.format, {
            scale: this.state.zoom / 100,
            quality: this.state.quality / 100
        });
        this.props.onDismiss();
    };

    renderFontComboBox = () => (
        <React.Fragment>
            {i18n.getElement('overlays.exportDialog.fontNotice')}
            <FontComboBox
                comboBoxProps={{label: i18n.t('overlays.settingsPanel.labels.featureDiagram.font.family')}}
                selectedFont={getSetting(this.props.settings, 'featureDiagram.font.family')}
                onChange={(font: string) => this.props.onSetSetting('featureDiagram.font.family', font)}/>
        </React.Fragment>
    );

    renderZoomSpinButton = () => (
        <SpinButton
            className="setting"
            label={i18n.t('overlays.exportDialog.zoom')}
            onChange={this.onZoomChange}
            value={this.state.zoom}
            min={10} max={1000} suffix=" %"/>
    );
    
    render() {
        return (
            <Dialog
                hidden={!this.props.isOpen}
                onDismiss={this.props.onDismiss}
                dialogContentProps={{title: i18n.t('overlays.exportDialog', this.props.format, 'title')}}>
                {this.props.format === formatTypes.svg && this.renderFontComboBox()}
                {this.props.format === formatTypes.png && this.renderZoomSpinButton()}
                {this.props.format === formatTypes.jpg &&
                <React.Fragment>
                    {this.renderZoomSpinButton()}
                    <SpinButton
                        className="setting"
                        label={i18n.t('overlays.exportDialog.jpg.quality')}
                        onChange={this.onQualityChange}
                        value={this.state.quality}
                        min={10} max={100} suffix=" %"/>
                </React.Fragment>}
                {this.props.format === formatTypes.pdf && this.renderFontComboBox()}
                <DialogFooter>
                    <PrimaryButton onClick={this.onSubmit} text={i18n.t('overlays.exportDialog.export')}/>
                </DialogFooter>
            </Dialog>
        );
    }
}