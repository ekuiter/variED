import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog} from '../../helpers/Dialog';
import PropTypes from 'prop-types';
import {FeatureModelType} from '../../types';

const FeatureRenameDialog = ({featureName, featureModel, ...props}) => {
    const feature = featureModel && featureModel.getFeatureOrDismiss(featureName, props.isOpen, props.onDismiss);
    if (!feature)
        return null;
    return (
        <TextFieldDialog
            {...props}
            title={i18n.t('dialogs.featureRenameDialog.title')}
            submitText={i18n.t('dialogs.featureRenameDialog.rename')}
            defaultValue={featureName}
            onSubmit={newFeatureName => {
                if (newFeatureName && featureName !== newFeatureName)
                    actions.server.feature.rename(featureName, newFeatureName);
                else
                    ;//TODO: show error
            }}/>
    );
};

FeatureRenameDialog.propTypes = {
    onDismiss: PropTypes.func.isRequired,
    featureModel: FeatureModelType.isRequired,
    featureName: PropTypes.string.isRequired,
    isOpen: PropTypes.bool.isRequired
};

export default FeatureRenameDialog;