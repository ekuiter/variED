/**
 * A Fabric dialog for setting a feature description.
 */

import React from 'react';
import i18n from '../../i18n';
import actions from '../../store/actions';
import {TextFieldDialog, largeDialogStyle} from '../../helpers/Dialog';
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
        // TODO: warn the user if someone else updated the description (it may happen
        // that the user is working on a new description which is then replaced by
        // another users update)
        return (
            <TextFieldDialog
                {...this.props}
                title={i18n.t('overlays.featureSetDescriptionDialog.title')}
                submitText={i18n.t('overlays.featureSetDescriptionDialog.rename')}
                defaultValue={feature.description}
                onSubmit={description => actions.server.featureDiagram.feature.setDescription(feature.name, description)}
                submitOnEnter={false}
                styles={largeDialogStyle}
                textFieldProps={{multiline: true, rows: 5}}/>
        );
    }
}