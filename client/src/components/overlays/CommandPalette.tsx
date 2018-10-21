import React from 'react';
import {Modal} from 'office-ui-fabric-react/lib/Modal';
import {TextField} from 'office-ui-fabric-react/lib/TextField';
import i18n from '../../i18n';
import {OnShowOverlayFunction, OnUndoFunction, OnRedoFunction} from '../../store/types';
import {getShortcutText} from '../../shortcuts';
import {OverlayType} from '../../types';
import {Icon} from 'office-ui-fabric-react/lib/Icon';
import defer from 'src/helpers/defer';

interface Props {
    isOpen: boolean,
    onDismiss: () => void,
    onShowOverlay: OnShowOverlayFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction
};

interface State {
    value?: string
};

interface Command {
    title: string,
    action: () => void,
    icon?: string,
    shortcut?: string
};

export default class extends React.Component<Props, State> {
    state: State = {};
    commandUsage: {
        [x: string]: number
    } = {};

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.isOpen && this.props.isOpen)
            this.setState({value: undefined});
    }

    onChange = (_event: any, value?: string) => this.setState({value});

    onKeyPress = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            const results = this.getSearchResults(this.state.value);
            if (results.length > 0)
                this.runCommand(results[0]);
        }
    };

    onClick = (command: Command) => () => this.runCommand(command);

    runCommand(command: Command) {
        this.props.onDismiss();
        command.action();
        defer(() => this.commandUsage[command.title] = +new Date())();
    }

    commands: Command[] = [
        { // TODO
            title: 'Join',
            action: () => (window as any).app.sendMessage({type:"JOIN", artifact: "FeatureModeling::CTV"})
        }, {
            title: i18n.t('commands.settings'),
            icon: 'Settings',
            shortcut: getShortcutText('settings'),
            action: () => this.props.onShowOverlay({overlay: OverlayType.settingsPanel, overlayProps: {}})
        }, {
            title: i18n.t('commands.about'),
            icon: 'Info',
            action: () => this.props.onShowOverlay({overlay: OverlayType.aboutPanel, overlayProps: {}})
        }, {
            title: i18n.t('commands.undo'),
            icon: 'Undo',
            shortcut: getShortcutText('undo'),
            action: this.props.onUndo
        }, {
            title: i18n.t('commands.redo'),
            icon: 'Redo',
            shortcut: getShortcutText('redo'),
            action: this.props.onRedo
        }
    ];

    sortCommands(commands: Command[]): Command[] {
        const usedCommands = commands.filter(command => typeof this.commandUsage[command.title] !== 'undefined'),
            unusedCommands = commands.filter(command => !usedCommands.includes(command));
        usedCommands.sort((a, b) => this.commandUsage[b.title] - this.commandUsage[a.title]);
        return [...usedCommands, ...unusedCommands];
    }

    getSearchResults(search?: string): Command[] {
        return this.sortCommands(search
            ? this.commands.filter(command =>
                command.title.toLowerCase().includes(this.state.value!.toLowerCase()))
            : this.commands);
    }

    render() {
        const results = this.getSearchResults(this.state.value);

        return (
            <Modal
                className="commandPalette"
                isOpen={this.props.isOpen}
                onDismiss={this.props.onDismiss}>
                <div>
                    <TextField borderless
                        value={this.state.value}
                        onChange={this.onChange}
                        onKeyPress={this.onKeyPress}
                        styles={{
                            field: {fontSize: 21},
                            fieldGroup: {height: 48}
                        }}/>
                </div>
                <ul>
                    {results.length > 0
                    ? results.map(command =>
                        <li key={command.title} onClick={this.onClick(command)}>
                            {command.icon
                            ? <Icon iconName={command.icon} />
                            : <i>&nbsp;</i>}
                            {command.title}
                            <span>{command.shortcut}</span>
                        </li>)
                    : <li className="notFound">{i18n.t('overlays.commandPalette.notFound')}</li>}
                </ul>
            </Modal>
        );
    }
};