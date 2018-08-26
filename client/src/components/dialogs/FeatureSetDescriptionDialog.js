import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog} from '../../helpers/Dialog';

export default ({featureName, featureModel, ...props}) => {
    const feature = featureModel && featureName ? featureModel.getFeature(featureName) : null;
    if (props.isOpen && !feature)
        props.onDismiss();
    if (!feature)
        return null;
    return (
        <TextFieldDialog
            {...props}
            title={i18n.t('dialogs.featureSetDescriptionDialog.title')}
            submitText={i18n.t('dialogs.featureSetDescriptionDialog.rename')}
            defaultValue={feature.description}
            onSubmit={description => actions.server.feature.setDescription(featureName, description)}/>
    );
};