import React from 'react';
import i18n from '../../i18n';
import {OnShowOverlayFunction, OnUndoFunction, OnRedoFunction} from '../../store/types';
import {getShortcutText} from '../../shortcuts';
import {OverlayType, Omit, MessageType} from '../../types';
import Palette, {PaletteItem, PaletteAction} from 'src/helpers/Palette';

interface Props {
    isOpen: boolean,
    onDismiss: () => void,
    onShowOverlay: OnShowOverlayFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction
};

interface State {
    rerenderPalette: number,
    argumentItems?: PaletteItem[],
    allowFreeform?: (value: string) => PaletteAction
};

type PaletteItemDescriptor = Omit<PaletteItem, 'action'>;
type PaletteItemsFunction = ((...args: string[]) => PaletteItemDescriptor[] | Promise<PaletteItemDescriptor[]>);

interface ArgumentDescriptor {
    items?: PaletteItemsFunction,
    allowFreeform?: boolean
};

export default class extends React.Component<Props, State> {
    state: State = {rerenderPalette: +new Date()};

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.isOpen && this.props.isOpen)
            this.setState({argumentItems: undefined, allowFreeform: undefined});
    }

    action = (action: PaletteAction): PaletteAction => {
        return () => {
            this.props.onDismiss();
            action();
        };
    };

    actionWithArguments = (args: (ArgumentDescriptor | PaletteItemsFunction)[], action: PaletteAction): PaletteAction => {
        if (args.length === 0)
            return this.action(action);

        return () => {
            const toArgumentDescriptor = (argument: ArgumentDescriptor | PaletteItemsFunction) =>
                    typeof argument === 'function' ? {items: argument} : argument,
                    toPaletteItemsFunction = (items?: PaletteItemsFunction) => items || (() => []),
                argumentDescriptor: ArgumentDescriptor = toArgumentDescriptor(args[0]),
                // bind current argument and recurse (until all arguments are bound)
                recurse = (value: string) =>
                    this.actionWithArguments(
                        args.slice(1).map(toArgumentDescriptor).map(argument => ({
                            ...argument, items: toPaletteItemsFunction(argument.items).bind(undefined, value)
                        })),
                        action.bind(undefined, value));

            Promise.resolve(toPaletteItemsFunction(argumentDescriptor.items)()).then(items =>
                this.setState({
                    rerenderPalette: +new Date(),
                    argumentItems: items.map(item => ({
                        ...item, action: recurse(item.text)
                    })),
                    allowFreeform: !!argumentDescriptor.allowFreeform ? recurse : undefined
                }));
        };
    };

    commands: PaletteItem[] = [
        {
            text: 'Join',
            action: this.actionWithArguments([
                    () => [{text: 'FeatureModeling'}],
                    () => [{text: 'CTV'}, {text: 'FeatureIDE'}, {text: 'Automotive'}]
                ],
                (project, artifact) => // TODO
                    (window as any).app.sendMessage({type: MessageType.JOIN, artifact: `${project}::${artifact}`}))
        }, {
            text: i18n.t('commands.settings'),
            icon: 'Settings',
            shortcut: getShortcutText('settings'),
            action: this.action(() => this.props.onShowOverlay({overlay: OverlayType.settingsPanel, overlayProps: {}}))
        }, {
            text: i18n.t('commands.about'),
            icon: 'Info',
            action: this.action(() => this.props.onShowOverlay({overlay: OverlayType.aboutPanel, overlayProps: {}}))
        }, {
            text: i18n.t('commands.undo'),
            icon: 'Undo',
            shortcut: getShortcutText('undo'),
            action: this.action(this.props.onUndo)
        }, {
            text: i18n.t('commands.redo'),
            icon: 'Redo',
            shortcut: getShortcutText('redo'),
            action: this.action(this.props.onRedo)
        }
    ];

    render() {
        const items = this.state.argumentItems || this.commands;
        return (
            <Palette
                key={this.state.rerenderPalette}
                isOpen={this.props.isOpen}
                items={items}
                onDismiss={this.props.onDismiss}
                allowFreeform={this.state.allowFreeform}/>
        );
    }
};