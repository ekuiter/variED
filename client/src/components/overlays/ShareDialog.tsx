import React from 'react';
import i18n from '../../i18n';
import {TextFieldDialog} from '../../helpers/Dialog';
import {ArtifactPath} from '../../types';
import {getShareableURL} from '../../router';

interface AddArtifactDialogProps {
    isOpen: boolean,
    onDismiss: () => void,
    currentArtifactPath?: ArtifactPath
};

export default class extends React.Component<AddArtifactDialogProps> {
    render() {
        return (
            <TextFieldDialog
                isOpen={this.props.isOpen}
                onDismiss={this.props.onDismiss}
                title={i18n.t('overlays.shareDialog.title')}
                submitText={i18n.t('overlays.shareDialog.copy')}
                textFieldProps={{value: this.props.currentArtifactPath
                    ? getShareableURL(this.props.currentArtifactPath)
                    : undefined}}
                onSubmit={(_, textFieldRef) => {
                    textFieldRef.current!.select();
                    document.execCommand('copy');
                }}/>
        );
    }
}