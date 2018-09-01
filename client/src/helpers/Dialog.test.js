import React from 'react';
import {shallow, mount} from 'enzyme';
import {DialogContextualMenu, TextFieldDialog, DialogWrapper} from './Dialog';
import {DefaultButton, PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import {Dialog} from 'office-ui-fabric-react/lib/Dialog';
import {TextField} from 'office-ui-fabric-react/lib/TextField';

describe('Dialog', () => {
    describe('DialogWrapper', () => {
        it('renders correctly', () => {
            const mock = jest.fn(),
                wrapper = shallow(
                    <DialogWrapper
                        label="label"
                        isOpen={true}
                        onDismiss={mock}
                        onApply={mock}>
                    content
                    </DialogWrapper>
                );
            expect(wrapper.prop('dialogContentProps').title).toBe('label');
            expect(wrapper).toMatchSnapshot();
        });
    });

    describe('DialogContextualMenu', () => {
        const dialogContextualMenu = (onApply = jest.fn(), onRender = jest.fn()) =>
            shallow(
                <DialogContextualMenu
                    label="label"
                    options={[{key: 'key', text: 'text'}]}
                    onApply={onApply}
                    onRender={onRender}>
                content
                </DialogContextualMenu>
            );

        it('renders correctly', () => {
            const wrapper = dialogContextualMenu();
            expect(wrapper.find(DefaultButton).prop('text')).toBe('label');
            expect(wrapper.find(DefaultButton).prop('menuProps').items[0].key).toBe('key');
            expect(wrapper.contains('content')).not.toBe(true);
            expect(wrapper).toMatchSnapshot();
        });

        it('opens a dialog when clicking an option', () => {
            const onApply = jest.fn(),
                onRender = jest.fn(),
                wrapper = dialogContextualMenu(onApply, onRender);
            wrapper.find(DefaultButton).prop('menuProps').items[0].onClick();
            expect(onRender).toBeCalledWith({key: 'key', text: 'text'});
        });

        it('closes the dialog when it is applied', () => {
            const onApply = jest.fn(),
                onRender = jest.fn(),
                wrapper = dialogContextualMenu(onApply, onRender),
                dialogWrapper = wrapper => wrapper.find(DialogWrapper);
            expect(dialogWrapper(wrapper).get(0)).toBeFalsy();
            wrapper.find(DefaultButton).prop('menuProps').items[0].onClick();
            expect(dialogWrapper(wrapper).get(0)).toBeTruthy();
            dialogWrapper(wrapper).simulate('apply');
            expect(onApply).toBeCalledWith({key: 'key', text: 'text'});
            expect(dialogWrapper(wrapper).get(0)).toBeFalsy();
        });
    });

    describe('TextFieldDialog', () => {
        const textFieldDialog = (onSubmit = jest.fn(), onDismiss = jest.fn(), isOpen = true, render = shallow) =>
            render(
                <TextFieldDialog
                    isOpen={isOpen}
                    title="title"
                    submitText="submitText"
                    onSubmit={onSubmit}
                    onDismiss={onDismiss}/>
            );

        it('renders correctly', () => {
            const wrapper = textFieldDialog();
            expect(wrapper.find(Dialog).prop('dialogContentProps').title).toBe('title');
            expect(wrapper.find(PrimaryButton).prop('text')).toBe('submitText');
            expect(wrapper).toMatchSnapshot();
        });

        it('focuses a text when it opens', () => {
            jest.useFakeTimers();
            const wrapper = textFieldDialog(jest.fn(), jest.fn(), false, mount);
            const onLayerDidMount = jest.spyOn(wrapper.instance(), 'onLayerDidMount');
            expect(onLayerDidMount).not.toBeCalled();
            wrapper.setProps({isOpen: true});
            expect(onLayerDidMount).toBeCalled();
            
            const focus = jest.spyOn(wrapper.instance().textFieldRef.current, 'focus'),
                select = jest.spyOn(wrapper.instance().textFieldRef.current, 'focus');
            expect(focus).not.toBeCalled();
            expect(select).not.toBeCalled();
            wrapper.instance().onLayerDidMount();
            jest.runAllTimers();
            expect(focus).toBeCalled();
            expect(select).toBeCalled();
        });

        it('submits a text', () => {
            const onSubmit = jest.fn(),
                onDismiss = jest.fn(),
                wrapper = textFieldDialog(onSubmit, onDismiss);
            wrapper.find(TextField).simulate('change', null, 'some value');
            wrapper.find(PrimaryButton).simulate('click');
            expect(onSubmit).toBeCalledWith('some value');
            expect(onDismiss).toBeCalled();
        });

        it('submits a text on enter when enabled', () => {
            const onSubmit = jest.fn(),
                onDismiss = jest.fn(),
                wrapper = textFieldDialog(onSubmit, onDismiss);
            wrapper.find(TextField).simulate('change', null, 'some value');
            wrapper.find(TextField).simulate('keyPress', {key: 'Enter'});
            expect(onSubmit).toBeCalledWith('some value');
            expect(onDismiss).toBeCalled();
        });

        it('does not submit a text on enter when disabled', () => {
            const onSubmit = jest.fn(),
                onDismiss = jest.fn(),
                wrapper = textFieldDialog(onSubmit, onDismiss);
            wrapper.setProps({submitOnEnter: false});
            wrapper.find(TextField).simulate('change', null, 'some value');
            wrapper.find(TextField).simulate('keyPress', {key: 'Enter'});
            expect(onSubmit).not.toBeCalled();
            expect(onDismiss).not.toBeCalled();
        });
    });
});