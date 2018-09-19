import isFontInstalled from './isFontInstalled';
import {ComboBox, IComboBox, IComboBoxOption} from 'office-ui-fabric-react/lib/ComboBox';
import React from 'react';
import i18n from '../i18n';
import constants from '../constants';

interface Props {
    selectedFont: string,
    fonts?: string[],
    onChange: (font: string) => void
};

interface State {
    errorMessage?: string
};

export default class extends React.Component<Props, State> {
    static defaultProps: Partial<Props> = {fonts: constants.helpers.fontComboBox.suggestedFonts};
    state: State = {errorMessage: undefined};

    onChange = (_event: React.FormEvent<IComboBox>, option?: IComboBoxOption, index?: number, value?: string) => {
        const font = value || (option && option.key);
        if (typeof font !== 'string')
            return;
        if (isFontInstalled(font)) {
            this.setState({errorMessage: undefined});
            this.props.onChange(font);
        } else
            this.setState({errorMessage: i18n.t('overlays.settingsPanel.errors.fontNotInstalled')});
    };

    render() {
        let {selectedFont, fonts, ...props} = this.props;
        const options = fonts!
            .filter(isFontInstalled)
            .map(font => ({key: font, text: font}));

        return (
            <ComboBox
                text={this.state.errorMessage ? undefined : selectedFont}
                allowFreeform={true}
                autoComplete="on"
                options={options}
                onRenderOption={(props?: {text: string}) =>
                    <span className="ms-ComboBox-optionText" style={{fontFamily: `'${props!.text}'`}}>{props!.text}</span>}
                errorMessage={this.state.errorMessage}
                {...props}
                onChange={this.onChange}/>
        );
    }
}