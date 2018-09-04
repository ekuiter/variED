import React from 'react';
import i18n from '../../i18n';
import PropTypes from 'prop-types';
import {Dialog, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import FontComboBox from '../../helpers/FontComboBox';
import {getSetting} from '../../store/settings';
import {SettingsType} from '../../types';

export default class extends React.Component {
    static propTypes = {
        onDismiss: PropTypes.func.isRequired,
        isOpen: PropTypes.bool.isRequired,
        settings: SettingsType.isRequired,
        onSetSetting: PropTypes.func.isRequired
    };

    onSubmit = () => window.alert('TODO');

    render() {
        return (
            <Dialog
                hidden={!this.props.isOpen}
                onDismiss={this.props.onDismiss}
                dialogContentProps={{title: i18n.t('dialogs.exportSvgDialog.title')}}>
                {i18n.t('dialogs.exportSvgDialog.content')}
                <FontComboBox
                    label={i18n.t('panels.settingsPanel.labels.featureDiagram.font.family')}
                    selectedFont={getSetting(this.props.settings, 'featureDiagram.font.family')}
                    onChange={font => this.props.onSetSetting('featureDiagram.font.family', font)}/>
                <DialogFooter>
                    <PrimaryButton onClick={this.onSubmit} text={i18n.t('dialogs.exportSvgDialog.export')}/>
                </DialogFooter>
            </Dialog>
        );
    }
}