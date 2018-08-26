import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog} from '../../helpers/Dialog';
import PropTypes from 'prop-types';
import {FeatureModelType} from '../../server/FeatureModel';
import FeatureComponent from './FeatureComponent';

class FeatureRenameDialog extends FeatureComponent() {
    renderIfFeature(feature) {
        return (
            <TextFieldDialog
                {...this.props}
                title={i18n.t('dialogs.featureRenameDialog.title')}
                submitText={i18n.t('dialogs.featureRenameDialog.rename')}
                defaultValue={feature.name}
                onSubmit={newFeatureName => {
                    if (newFeatureName && feature.name !== newFeatureName)
                        actions.server.feature.rename(feature.name, newFeatureName);
                    else
                        ;//TODO: show error
                }}/>
        );
    }
}

FeatureRenameDialog.propTypes = {
    onDismiss: PropTypes.func.isRequired,
    featureModel: FeatureModelType.isRequired,
    featureName: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default FeatureRenameDialog;