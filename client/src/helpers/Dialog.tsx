import {Dialog, DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {DefaultButton, PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import i18n from '../i18n';
import React from 'react';
import defer from './defer';
import {TextField, ITextFieldProps, ITextField} from 'office-ui-fabric-react/lib/TextField';
import {IContextualMenuItem} from 'office-ui-fabric-react/lib/ContextualMenu';
import {IIconProps} from 'office-ui-fabric-react/lib/Icon';

export const largeDialogStyle = {
    main: {
        selectors: {
            '@media (min-width: 480px)': {minWidth: 400, maxWidth: 500},
            '@media (min-width: 720px)': {minWidth: 500, maxWidth: 600}
        }
    }
};

export const DialogWrapper = ({isOpen, onDismiss, onApply, children, label}:
    {isOpen: boolean, onDismiss: () => void, onApply: () => void, children: JSX.Element[], label: string}) => (
    <Dialog
        hidden={!isOpen}
        onDismiss={onDismiss}
        dialogContentProps={{title: label}}>
        {children}
        <DialogFooter>
            <PrimaryButton onClick={onApply} text={i18n.t('overlays.settingsPanel.apply')}/>
        </DialogFooter>
    </Dialog>
);

interface DialogContextualMenuProps {
    onApply: (option: IContextualMenuItem) => void,
    onRender: (option: IContextualMenuItem) => void,
    options: IContextualMenuItem[],
    children: JSX.Element[],
    label: string
    iconProps?: IIconProps
};

interface DialogContextualMenuState {
    option?: IContextualMenuItem
};

export class DialogContextualMenu extends React.Component<DialogContextualMenuProps, DialogContextualMenuState> {
    state: DialogContextualMenuState = {option: undefined};
    onDialogDismiss = () => this.setState({option: undefined});

    onDialogOpen = (option: IContextualMenuItem) => () => {
        this.props.onRender(option);
        this.setState({option});
    };

    onApply = () => {
        this.props.onApply(this.state.option!);
        this.onDialogDismiss();
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
                    label={this.state.option!.text!}
                    isOpen={!!this.state.option}
                    onDismiss={this.onDialogDismiss}
                    onApply={this.onApply}>
                    {this.props.children}
                </DialogWrapper>}
            </div>
        );
    }
}

interface TextFieldDialogProps {
    isOpen: boolean,
    onDismiss: () => void,
    onSubmit: (value: string) => void,
    title: string,
    defaultValue?: string,
    submitText: string,
    submitOnEnter?: boolean,
    textFieldProps?: ITextFieldProps
};

interface TextFieldDialogState {
    value?: string
};

export class TextFieldDialog extends React.Component<TextFieldDialogProps, TextFieldDialogState> {
    static defaultProps: Partial<TextFieldDialogProps> = {submitOnEnter: true};
    state: TextFieldDialogState = {value: undefined};
    textFieldRef = React.createRef<ITextField>();
    onChange = (_event: any, value?: string) => this.setState({value});

    // does not work without defer, god knows why
    onLayerDidMount = defer(() => {
        this.textFieldRef.current!.focus();
        this.textFieldRef.current!.select();
    });

    getValue = (): string => typeof this.state.value === 'undefined' ? this.props.defaultValue || '' : this.state.value;

    onSubmit = () => {
        this.props.onSubmit(this.getValue());
        this.setState({value: undefined});
        this.props.onDismiss();
    };

    onKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter' && this.props.submitOnEnter)
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