import isFontInstalled from './isFontInstalled';
import {ComboBox} from 'office-ui-fabric-react/lib/ComboBox';
import React from 'react';
import i18n from '../i18n';
import Constants from '../Constants';

export default class extends React.Component {
    static defaultProps = {
        selectedFont: null,
        fonts: Constants.helpers.fontComboBox.suggestedFonts,
        fallbacks: null,
        onChange: null
    };

    state = {errorMessage: null};

    onChanged = (option, index, value) => {
        const font = value || (option && option.key);
        if (!font)
            return;
        if (isFontInstalled(font))
            this.props.onChanged(font);
        else
            this.setState({errorMessage: i18n.t('settingsPanel.errors.fontNotInstalled')});
    };

    render() {
        let {selectedFont, fonts, fallbacks, ...props} = this.props;
        fallbacks = fallbacks ? `,${fallbacks.map(fallback => `'${fallback}'`).join(',')}` : '';
        fonts = fonts
            .filter(isFontInstalled)
            .map(font => ({key: font, text: font, fontFamily: `'${font}'${fallbacks}`}));

        return (
            <ComboBox
                text={this.state.errorMessage ? null : selectedFont}
                allowFreeform={true}
                autoComplete="on"
                options={fonts}
                onRenderOption={({text, fontFamily}) =>
                    <span className="ms-ComboBox-optionText" style={{fontFamily}}>{text}</span>}
                errorMessage={this.state.errorMessage}
                {...props}
                onChanged={this.onChanged}/>
        );
    }
};