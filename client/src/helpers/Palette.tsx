import React from 'react';
import {Modal} from 'office-ui-fabric-react/lib/Modal';
import {TextField} from 'office-ui-fabric-react/lib/TextField';
import i18n from '../i18n';
import {Icon} from 'office-ui-fabric-react/lib/Icon';

export type PaletteAction = (...args: string[]) => void;

export interface PaletteItem {
    text: string,
    action: PaletteAction,
    key?: string,
    icon?: string,
    shortcut?: string,
    disabled?: () => boolean
};

interface Props {
    isOpen: boolean,
    items: PaletteItem[],
    onDismiss: () => void,
    onSubmit: (item: PaletteItem) => void,
    allowFreeform?: (value: string) => PaletteAction,
    itemUsage: {
        [x: string]: number
    }
};

interface State {
    value?: string
};

export const getKey = (item: PaletteItem) => item.key || item.text;

export default class extends React.Component<Props, State> {
    static defaultProps: Partial<Props> = {onSubmit: () => {}, itemUsage: {}};
    state: State = {};

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
        this.props.onSubmit(item);
    }

    sortItems(items: PaletteItem[]): PaletteItem[] {
        const usedItems = items.filter(item => typeof this.props.itemUsage[getKey(item)] !== 'undefined'),
            unusedItems = items.filter(item => !usedItems.includes(item));
        usedItems.sort((a, b) => this.props.itemUsage[getKey(b)] - this.props.itemUsage[getKey(a)]);
        return [...usedItems, ...unusedItems];
    }

    getSearchResults(search?: string): PaletteItem[] {
        const searchResults = this.sortItems(
            (search
                ? this.props.items.filter(item =>
                    item.text.toLowerCase().includes(this.state.value!.toLowerCase()))
                : this.props.items).filter(item => item.disabled ? !item.disabled() : true));
        return this.props.allowFreeform && this.state.value
            ? [{text: this.state.value, action: this.props.allowFreeform(this.state.value)}, ...searchResults]
            : searchResults;
    }

    render() {
        const results = this.getSearchResults(this.state.value),
            showIcons = this.props.items.some(item => typeof item.icon !== 'undefined'),
            showShortcuts = this.props.items.some(item => typeof item.shortcut !== 'undefined'),
            showBeak = this.props.items.some(item => item.action['isActionWithArguments']);

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
                        <li key={getKey(item)} onClick={this.onClick(item)}>
                            {showIcons &&
                            (item.icon
                                ? <Icon iconName={item.icon} />
                                : <i>&nbsp;</i>)}
                            {item.text}
                            {showBeak &&
                            (item.action['isActionWithArguments']
                                ? <span>&gt;</span>
                                : <span>&nbsp;</span>)}
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