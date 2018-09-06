import React from 'react';
import i18n from '../../i18n';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import PropTypes from 'prop-types';

const AboutPanel = props => (
    <Panel
        isOpen={props.isOpen}
        type={PanelType.smallFixedFar}
        onDismissed={props.onDismissed}
        isLightDismiss={true}
        headerText={i18n.t('overlays.aboutPanel.title')}>
        {i18n.t('overlays.aboutPanel.content')}
    </Panel>
);

AboutPanel.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onDismissed: PropTypes.func.isRequired
};

export default AboutPanel;