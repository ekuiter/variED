import React from 'react';
import {Modal} from 'office-ui-fabric-react/lib/Modal';
import {TextField} from 'office-ui-fabric-react/lib/TextField';
import i18n from '../i18n';
import {Icon} from 'office-ui-fabric-react/lib/Icon';
import defer from './defer';

export type PaletteAction = (...args: string[]) => void;

export interface PaletteItem {
    text: string,
    action: PaletteAction,
    icon?: string,
    shortcut?: string
};

interface Props {
    isOpen: boolean,
    items: PaletteItem[],
    onDismiss: () => void,
    allowFreeform?: (value: string) => PaletteAction
};

interface State {
    value?: string
};

export default class extends React.Component<Props, State> {
    state: State = {};
    itemUsage: {
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
                this.onSubmit(results[0]);
        }
    };

    onClick = (item: PaletteItem) => () => this.onSubmit(item);

    onSubmit(item: PaletteItem) {
        item.action();
        defer(() => this.itemUsage[item.text] = +new Date())();
    }

    sortItems(items: PaletteItem[]): PaletteItem[] {
        const usedItems = items.filter(item => typeof this.itemUsage[item.text] !== 'undefined'),
            unusedItems = items.filter(item => !usedItems.includes(item));
        usedItems.sort((a, b) => this.itemUsage[b.text] - this.itemUsage[a.text]);
        return [...usedItems, ...unusedItems];
    }

    getSearchResults(search?: string): PaletteItem[] {
        const searchResults = this.sortItems(search
            ? this.props.items.filter(item =>
                item.text.toLowerCase().includes(this.state.value!.toLowerCase()))
            : this.props.items);
        return this.props.allowFreeform && this.state.value
            ? [{text: this.state.value, action: this.props.allowFreeform(this.state.value)}, ...searchResults]
            : searchResults;
    }

    render() {
        const results = this.getSearchResults(this.state.value),
            showIcons = this.props.items.some(item => typeof item.icon !== 'undefined'),
            showShortcuts = this.props.items.some(item => typeof item.shortcut !== 'undefined');

        return (
            <Modal
                className="palette"
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
                    {results.length > 0 && this.props.items.length > 0
                    ? results.map(item =>
                        <li key={item.text} onClick={this.onClick(item)}>
                            {showIcons &&
                            (item.icon
                                ? <Icon iconName={item.icon} />
                                : <i>&nbsp;</i>)}
                            {item.text}
                            {showShortcuts &&
                            <span>{item.shortcut}</span>}
                        </li>)
                    : !this.props.allowFreeform
                        ? <li className="notFound">{i18n.t('overlays.palette.notFound')}</li>
                        : null}
                </ul>
            </Modal>
        );
    }
};