/**
 * A Fabric dialog for setting a feature description.
 */

import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog, largeDialogStyle} from '../../helpers/Dialog';
import FeatureComponent, { FeatureComponentProps } from './FeatureComponent';
import {Feature} from '../../types';

type Props = FeatureComponentProps & {
    isOpen: boolean
}

export default class extends FeatureComponent()<Props> {
    renderIfFeature(feature: Feature) {
        // TODO: warn the user if someone else updated the description (it may happen
        // that the user is working on a new description which is then replaced by
        // another users update)
        return (
            <TextFieldDialog
                title={i18n.t('overlays.featureSetDescriptionDialog.title')}
                submitText={i18n.t('overlays.featureSetDescriptionDialog.rename')}
                defaultValue={feature.description}
                onSubmit={description => actions.server.featureDiagram.feature.setDescription(feature.name, description)}
                submitOnEnter={false}
                dialogProps={{styles: largeDialogStyle}}
                textFieldProps={{multiline: true, rows: 5}}/>
        );
    }
}