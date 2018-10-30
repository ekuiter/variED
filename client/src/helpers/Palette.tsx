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
    placeholder?: string,
    onDismiss: () => void,
    onSubmit: (item: PaletteItem) => void,
    allowFreeform?: (value: string) => PaletteAction,
    itemUsage: {
        [x: string]: number
    }
};

interface State {
    value?: string,
    selectedIndex: number
};

export const getKey = (item: PaletteItem) => item.key || item.text;

export default class extends React.Component<Props, State> {
    static defaultProps: Partial<Props> = {onSubmit: () => {}, itemUsage: {}};
    state: State = {selectedIndex: 0};
    results: PaletteItem[];

    componentDidMount() {
        document.addEventListener('keydown', this.onKeyPress);
    }

    componentWillUnmount() {
        document.removeEventListener('keydown', this.onKeyPress);
    }

    componentDidUpdate(prevProps: Props) {
        if (!prevProps.isOpen && this.props.isOpen)
            this.setState({value: undefined, selectedIndex: 0});
        if (this.state.selectedIndex >= this.results.length && this.state.selectedIndex > 0)
            this.setState({selectedIndex: 0});
    }

    onChange = (_event: any, value?: string) => this.setState({value, selectedIndex: 0});

    onKeyPress = (event: KeyboardEvent) => {
        if (event.key === 'Enter' && this.state.selectedIndex < this.results.length)
            this.onSubmit(this.results[this.state.selectedIndex]);
        if ((event.key === 'ArrowUp' || event.key === 'Up') && this.state.selectedIndex > 0)
            this.setState(({selectedIndex}) => ({selectedIndex: selectedIndex - 1}));
        if ((event.key === 'ArrowDown' || event.key === 'Down') && this.state.selectedIndex < this.results.length - 1)
            this.setState(({selectedIndex}) => ({selectedIndex: selectedIndex + 1}));
    };

    onMouseMove = (idx: number) => () => this.setState({selectedIndex: idx});
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
        const results = this.results = this.getSearchResults(this.state.value),
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
                        placeholder={this.props.placeholder}
                        styles={{
                            field: {fontSize: 21},
                            fieldGroup: {height: 48}
                        }}/>
                </div>
                <ul className={results.length > 0 && this.props.items.length > 0 ? 'scrollable' : undefined}>
                    {results.length > 0 && this.props.items.length > 0
                    ? results.map((item, idx) =>
                        <li key={getKey(item)}
                            onClick={this.onClick(item)}
                            onMouseMove={this.onMouseMove(idx)}
                            className={this.state.selectedIndex === idx ? 'selected' : undefined}>
                            {showIcons &&
                            (item.icon
                                ? <Icon iconName={item.icon} />
                                : <i>&nbsp;</i>)}
                            {item.text}
                            {showBeak &&
                            (item.action['isActionWithArguments']
                                ? <span><Icon iconName="ChevronRightMed"/></span>
                                : <span><i>&nbsp;</i></span>)}
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