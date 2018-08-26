import isFontInstalled from './isFontInstalled';
import {ComboBox} from 'office-ui-fabric-react/lib/ComboBox';
import React from 'react';
import i18n from '../i18n';
import constants from '../constants';
import PropTypes from 'prop-types';

class FontComboBox extends React.Component {
    static defaultProps = {fonts: constants.helpers.fontComboBox.suggestedFonts};
    state = {errorMessage: null};

    onChanged = (option, index, value) => {
        const font = value || (option && option.key);
        if (!font)
            return;
        if (isFontInstalled(font))
            this.props.onChanged(font);
        else
            this.setState({errorMessage: i18n.t('panels.settingsPanel.errors.fontNotInstalled')});
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
}

FontComboBox.propTypes = {
    selectedFont: PropTypes.string.isRequired,
    fonts: PropTypes.arrayOf(PropTypes.string).isRequired,
    fallbacks: PropTypes.arrayOf(PropTypes.string),
    onChanged: PropTypes.func.isRequired
};

export default FontComboBox;