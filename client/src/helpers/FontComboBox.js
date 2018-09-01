import isFontInstalled from './isFontInstalled';
import {ComboBox} from 'office-ui-fabric-react/lib/ComboBox';
import React from 'react';
import i18n from '../i18n';
import constants from '../constants';
import PropTypes from 'prop-types';

export default class extends React.Component {
    static propTypes = {
        selectedFont: PropTypes.string.isRequired,
        fonts: PropTypes.arrayOf(PropTypes.string),
        onChange: PropTypes.func.isRequired
    };

    static defaultProps = {fonts: constants.helpers.fontComboBox.suggestedFonts};
    state = {errorMessage: null};

    onChange = (option, index, value) => {
        const font = value || (option && option.key);
        if (!font)
            return;
        if (isFontInstalled(font))
            this.props.onChange(font);
        else
            this.setState({errorMessage: i18n.t('panels.settingsPanel.errors.fontNotInstalled')});
    };

    render() {
        let {selectedFont, fonts, ...props} = this.props;
        fonts = fonts
            .filter(isFontInstalled)
            .map(font => ({key: font, text: font, fontFamily: `'${font}'`}));

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
                onChange={this.onChange}/>
        );
    }
}