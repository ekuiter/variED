import React from 'react';
import {connect} from 'react-redux';
import actions from '../../store/actions';
import FeatureRenameDialog from '../../components/dialogs/FeatureRenameDialog';

const DialogContainer = props => (
    <React.Fragment>
        <FeatureRenameDialog
            isOpen={props.dialog === 'featureRename'}
            onDismiss={props.onHideDialog}
            {...props.dialogProps}/>
    </React.Fragment>
);

export default connect(
    state => ({
        dialog: state.ui.dialog,
        dialogProps: state.ui.dialogProps
    }),
    dispatch => ({
        onHideDialog: () => dispatch(actions.ui.hideDialog())
    })
)(DialogContainer);