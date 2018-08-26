import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog} from '../../helpers/Dialog';

export default ({featureName, ...props}) => (
    // todo: check for feature existence!
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