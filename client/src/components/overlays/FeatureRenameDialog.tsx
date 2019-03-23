/**
 * A Fabric dialog for renaming a feature.
 */

import React from 'react';
import i18n from '../../i18n';
import {TextFieldDialog} from '../../helpers/Dialog';
import FeatureComponent, {FeatureComponentProps} from './FeatureComponent';
import {Feature} from '../../modeling/types';
import {OnSetFeatureNameFunction} from '../../store/types';
import {preconditions} from '../../modeling/preconditions';

type Props = FeatureComponentProps & {
    isOpen: boolean,
    onDismiss: () => void,
    onSetFeatureName: OnSetFeatureNameFunction
};

export default class extends FeatureComponent()<Props> {
    renderIfFeature(feature: Feature) {
        return (
            <TextFieldDialog
                isOpen={this.props.isOpen}
                onDismiss={this.props.onDismiss}
                title={i18n.t('overlays.featureRenameDialog.title')}
                submitText={i18n.t('overlays.featureRenameDialog.rename')}
                defaultValue={feature.name}
                onSubmit={newFeatureName => {
                    if (newFeatureName && feature.name !== newFeatureName &&
                        preconditions.featureDiagram.feature.setName(feature.ID, this.props.featureModel))
                        this.props.onSetFeatureName({featureID: feature.ID, name: newFeatureName});
                    else
                        ;//TODO: show error
                }}/>
        );
    }
}