import React from 'react';
import {connect} from 'react-redux';
import actions from '../../store/actions';
import FeatureRenameDialog from '../../components/dialogs/FeatureRenameDialog';
import FeatureSetDescriptionDialog from '../../components/dialogs/FeatureSetDescriptionDialog';
import {getFeatureModel} from '../../store/selectors';

const DialogContainer = props => (
    <React.Fragment>
        <FeatureRenameDialog
            isOpen={props.dialog === 'featureRename'}
            onDismiss={props.onHideDialog}
            {...props.dialogProps}/>
        <FeatureSetDescriptionDialog
            isOpen={props.dialog === 'featureSetDescription'}
            onDismiss={props.onHideDialog}
            featureModel={props.featureModel}
            {...props.dialogProps}/>
    </React.Fragment>
);

export default connect(
    state => ({
        dialog: state.ui.dialog,
        dialogProps: state.ui.dialogProps,
        featureModel: getFeatureModel(state)
    }),
    dispatch => ({
        onHideDialog: () => dispatch(actions.ui.hideDialog())
    })
)(DialogContainer);