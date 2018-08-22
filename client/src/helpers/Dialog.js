import {Dialog, DialogFooter} from '../../node_modules/office-ui-fabric-react/lib/Dialog';
import {DefaultButton, PrimaryButton} from '../../node_modules/office-ui-fabric-react/lib/Button';
import i18n from '../i18n';
import React from 'react';
import {Dropdown} from '../../node_modules/office-ui-fabric-react/lib/Dropdown';

const DialogWrapper = ({isOpen, onDismiss, onApply, children, label}) => (
    <Dialog
        hidden={!isOpen}
        onDismiss={onDismiss}
        dialogContentProps={{title: label}}>
        {children}
        <DialogFooter>
            <PrimaryButton onClick={onApply} text={i18n.t('settingsPanel.apply')}/>
        </DialogFooter>
    </Dialog>
);

export class DialogButton extends React.Component {
    static defaultProps = {label: null, onApply: null};
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

export class DialogDropdown extends React.Component {
    static defaultProps = {label: null, options: null, onApply: null, onRender: null};
    state = {isDialogOpen: false, option: null};
    onDialogDismiss = () => this.setState({isDialogOpen: false});
    onChanged = option => this.setState({option});

    onDialogOpen = () => {
        if (this.state.option) {
            this.props.onRender(this.state.option);
            this.setState({isDialogOpen: true});
        }
    };

    onApply = () => {
        this.onDialogDismiss();
        this.props.onApply(this.state.option);
    };

    render() {
        return (
            <div className="setting">
                <Dropdown
                    selectedKey={this.state.option ? this.state.option.key : null}
                    options={this.props.options}
                    onChanged={this.onChanged}/>
                <DefaultButton
                    className="setting"
                    onClick={this.onDialogOpen}
                    disabled={!this.state.option}
                    text={this.props.label}/>
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

export class DialogContextualMenu extends React.Component {
    static defaultProps = {label: null, options: null, iconProps: null, onApply: null, onRender: null};
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