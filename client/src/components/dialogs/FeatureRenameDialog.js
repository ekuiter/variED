import React from 'react';
import {Dialog, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import {TextField} from 'office-ui-fabric-react/lib/TextField';
import i18n from '../../i18n';
import actions from '../../store/actions';
import defer from '../../helpers/defer';

export default class extends React.Component {
    state = {newFeatureName: null};
    textFieldRef = React.createRef();
    onChange = (e, newFeatureName) => this.setState({newFeatureName});
    onLayerDidMount = defer(() => this.textFieldRef.current.focus());

    onRename = () => {
        if (this.state.newFeatureName && this.props.featureName !== this.state.newFeatureName)
            actions.server.featureNameChanged(this.props.featureName, this.state.newFeatureName);
        else
            ;//TODO: show error
        this.props.onDismiss();
    };

    onKeyPress = e => {
        if (e.key === 'Enter')
            this.onRename();
    };

    render() {
        return (
            <Dialog
                hidden={!this.props.isOpen}
                onDismiss={this.props.onDismiss}
                modalProps={{onLayerDidMount: this.onLayerDidMount}}
                dialogContentProps={{title: i18n.t('dialogs.featureRenameDialog.title')}}>
                <TextField
                    componentRef={this.textFieldRef}
                    value={this.state.newFeatureName === null ? this.props.featureName : this.state.newFeatureName}
                    onChange={this.onChange}
                    onKeyPress={this.onKeyPress}/>
                <DialogFooter>
                    <PrimaryButton onClick={this.onRename} text={i18n.t('dialogs.featureRenameDialog.rename')}/>
                </DialogFooter>
            </Dialog>
        );
    }
};