/**
 * A Fabric dialog for renaming a feature.
 */

import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog} from '../../helpers/Dialog';
import PropTypes from 'prop-types';
import {FeatureModelType} from '../../server/FeatureModel';
import FeatureComponent from './FeatureComponent';

export default class extends FeatureComponent() {
    static propTypes = {
        onDismiss: PropTypes.func.isRequired,
        featureModel: FeatureModelType.isRequired,
        featureName: PropTypes.string.isRequired,
        isOpen: PropTypes.bool.isRequired
    };

    renderIfFeature(feature) {
        return (
            <TextFieldDialog
                {...this.props}
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