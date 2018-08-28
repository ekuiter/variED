import {Dialog, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {DefaultButton, PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import i18n from '../i18n';
import React from 'react';
import defer from './defer';
import {TextField} from '../../node_modules/office-ui-fabric-react/lib/TextField';
import PropTypes from 'prop-types';
import exact from 'prop-types-exact';

const DialogWrapper = ({isOpen, onDismiss, onApply, children, label}) => (
    <Dialog
        hidden={!isOpen}
        onDismiss={onDismiss}
        dialogContentProps={{title: label}}>
        {children}
        <DialogFooter>
            <PrimaryButton onClick={onApply} text={i18n.t('panels.settingsPanel.apply')}/>
        </DialogFooter>
    </Dialog>
);

DialogWrapper.propTypes = exact({
    isOpen: PropTypes.bool.isRequired,
    onDismiss: PropTypes.func.isRequired,
    onApply: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
    label: PropTypes.string.isRequired
});

export class DialogButton extends React.Component {
    propTypes = exact({
        onApply: PropTypes.func.isRequired,
        children: PropTypes.node.isRequired,
        label: PropTypes.string.isRequired
    });

    state = {isDialogOpen: false};
    onDialogOpen = () => this.setState({isDialogOpen: true});
    onDialogDismiss = () => this.setState({isDialogOpen: false});

    onApply = () => {
        this.props.onApply();
        this.onDialogDismiss();
    };

    render() {
        return (
            <React.Fragment>
                <DefaultButton
                    className="setting"
                    onClick={this.onDialogOpen}
                    text={this.props.label}/>
                <DialogWrapper
                    label={this.props.label}
                    isOpen={this.state.isDialogOpen}
                    onDismiss={this.onDialogDismiss}
                    onApply={this.onApply}>
                    {this.props.children}
                </DialogWrapper>
            </React.Fragment>
        );
    }
}

export class DialogContextualMenu extends React.Component {
    propTypes = exact({
        onApply: PropTypes.func.isRequired,
        onRender: PropTypes.func.isRequired,
        options: PropTypes.arrayOf(PropTypes.object).isRequired,
        children: PropTypes.node.isRequired,
        label: PropTypes.string.isRequired,
        iconProps: PropTypes.object
    });

    state = {isDialogOpen: false, option: null};
    onDialogDismiss = () => this.setState({isDialogOpen: false});

    onDialogOpen = option => () => {
        this.props.onRender(option);
        this.setState({option, isDialogOpen: true});
    };

    onApply = () => {
        this.onDialogDismiss();
        this.props.onApply(this.state.option);
    };

    render() {
        return (
            <div className="setting">
                <DefaultButton
                    text={this.props.label}
                    iconProps={this.props.iconProps}
                    menuProps={{
                        items: this.props.options.map(option =>
                            ({...option, onClick: this.onDialogOpen(option)}))
                    }}/>
                {this.state.option &&
                <DialogWrapper
                    label={this.state.option.text}
                    isOpen={this.state.isDialogOpen}
                    onDismiss={this.onDialogDismiss}
                    onApply={this.onApply}>
                    {this.props.children}
                </DialogWrapper>}
            </div>
        );
    }
}

export class TextFieldDialog extends React.Component {
    propTypes = {
        isOpen: PropTypes.bool.isRequired,
        onDismiss: PropTypes.func.isRequired,
        onSubmit: PropTypes.func.isRequired,
        title: PropTypes.string.isRequired,
        defaultValue: PropTypes.string,
        submitText: PropTypes.string.isRequired,
        submitOnEnter: PropTypes.bool.isRequired,
        textFieldProps: PropTypes.object
    };

    static defaultProps = {submitOnEnter: true};
    state = {value: null};
    textFieldRef = React.createRef();
    onChange = (e, value) => this.setState({value});
    onLayerDidMount = defer(() => {
        this.textFieldRef.current.focus();
        this.textFieldRef.current.select();
    });

    getValue = () => this.state.value === null ? this.props.defaultValue || '' : this.state.value;

    onSubmit = () => {
        this.props.onSubmit(this.getValue());
        this.setState({value: null});
        this.props.onDismiss();
    };

    onKeyPress = e => {
        if (e.key === 'Enter' && this.props.submitOnEnter)
            this.onSubmit();
    };

    render() {
        const {isOpen, onDismiss, onSubmit: _onSubmit, title, defaultValue: _defaultValue,
            submitText, submitOnEnter: _submitOnEnter, textFieldProps, ...props} = this.props;
        return (
            <Dialog
                hidden={!isOpen}
                onDismiss={onDismiss}
                modalProps={{onLayerDidMount: this.onLayerDidMount}}
                dialogContentProps={{title}}
                {...props}>
                <TextField
                    componentRef={this.textFieldRef}
                    value={this.getValue()}
                    onChange={this.onChange}
                    onKeyPress={this.onKeyPress}
                    {...textFieldProps}/>
                <DialogFooter>
                    <PrimaryButton onClick={this.onSubmit} text={submitText}/>
                </DialogFooter>
            </Dialog>
        );
    }
}