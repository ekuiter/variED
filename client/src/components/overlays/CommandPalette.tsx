import React from 'react';
import i18n from '../../i18n';
import {OnShowOverlayFunction, OnUndoFunction, OnRedoFunction} from '../../store/types';
import {getShortcutText} from '../../shortcuts';
import {OverlayType} from '../../types';
import Palette, {PaletteItem} from 'src/helpers/Palette';

interface Props {
    isOpen: boolean,
    onDismiss: () => void,
    onShowOverlay: OnShowOverlayFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction
};

interface State {
};

export default class extends React.Component<Props, State> {
    state: State = {};

    commands: PaletteItem[] = [
        { // TODO
            text: 'Join',
            action: () => (window as any).app.sendMessage({type:"JOIN", artifact: "FeatureModeling::CTV"})
        }, {
            text: i18n.t('commands.settings'),
            icon: 'Settings',
            shortcut: getShortcutText('settings'),
            action: () => this.props.onShowOverlay({overlay: OverlayType.settingsPanel, overlayProps: {}})
        }, {
            text: i18n.t('commands.about'),
            icon: 'Info',
            action: () => this.props.onShowOverlay({overlay: OverlayType.aboutPanel, overlayProps: {}})
        }, {
            text: i18n.t('commands.undo'),
            icon: 'Undo',
            shortcut: getShortcutText('undo'),
            action: this.props.onUndo
        }, {
            text: i18n.t('commands.redo'),
            icon: 'Redo',
            shortcut: getShortcutText('redo'),
            action: this.props.onRedo
        }
    ];

    render() {
        return (
            <Palette
                isOpen={this.props.isOpen}
                items={this.commands}
                onDismiss={this.props.onDismiss}/>
        );
    }
};