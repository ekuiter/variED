/**
 * A Fabric dialog for renaming a feature.
 */

import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog} from '../../helpers/Dialog';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {Feature} from '../../types';

type Props = FeatureComponentProps & {
    isOpen: boolean
};

export default class extends FeatureComponent()<Props> {
    renderIfFeature(feature: Feature) {
        return (
            <TextFieldDialog
                title={i18n.t('overlays.featureRenameDialog.title')}
                submitText={i18n.t('overlays.featureRenameDialog.rename')}
                defaultValue={feature.name}
                onSubmit={newFeatureName => {
                    if (newFeatureName && feature.name !== newFeatureName)
                        actions.server.featureDiagram.feature.rename(feature.name, newFeatureName);
                    else
                        ;//TODO: show error
                }}/>
        );
    }
}