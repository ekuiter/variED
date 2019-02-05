/**
 * A Fabric dialog for setting a feature description.
 */

import React from 'react';
import i18n from '../../i18n';
import {TextFieldDialog, largeDialogStyle} from '../../helpers/Dialog';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {Feature} from '../../modeling/types';
import {OnSetFeatureDescriptionFunction} from '../../store/types';

type Props = FeatureComponentProps & {
    isOpen: boolean,
    onDismiss: () => void,
    onSetFeatureDescription: OnSetFeatureDescriptionFunction
}

export default class extends FeatureComponent()<Props> {
    renderIfFeature(feature: Feature) {
        // TODO: warn the user if someone else updated the description (it may happen
        // that the user is working on a new description which is then replaced by
        // another users update)
        return (
            <TextFieldDialog
                isOpen={this.props.isOpen}
                onDismiss={this.props.onDismiss}
                title={i18n.t('overlays.featureSetDescriptionDialog.title')}
                submitText={i18n.t('overlays.featureSetDescriptionDialog.rename')}
                defaultValue={feature.description}
                onSubmit={description => this.props.onSetFeatureDescription({featureID: feature.ID, description})}
                submitOnEnter={false}
                dialogProps={{styles: largeDialogStyle}}
                textFieldProps={{multiline: true, rows: 5}}/>
        );
    }
}