import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog} from '../../helpers/Dialog';

export default ({featureName, featureModel, ...props}) => {
    const feature = featureModel && featureModel.getFeatureOrDismiss(featureName, props.isOpen, props.onDismiss);
    if (!feature)
        return null;
    return (
        <TextFieldDialog
            {...props}
            title={i18n.t('dialogs.featureSetDescriptionDialog.title')}
            submitText={i18n.t('dialogs.featureSetDescriptionDialog.rename')}
            defaultValue={feature.description}
            onSubmit={description => actions.server.feature.setDescription(featureName, description)}
            submitOnEnter={false}
            styles={{
                main: {
                    selectors: {
                        '@media (min-width: 480px)': {minWidth: 400, maxWidth: 500},
                        '@media (min-width: 720px)': {minWidth: 500, maxWidth: 600}
                    }
                }
            }}
            textFieldProps={{multiline: true, rows: 5}}/>
    );
};