/**
 * A Fabric panel that contains further information about the application.
 */

import React from 'react';
import i18n from '../../i18n';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';

export default ({isOpen, onDismissed}: {isOpen: boolean, onDismissed: () => void}) => (
    <Panel
        isOpen={isOpen}
        type={PanelType.smallFixedFar}
        onDismissed={onDismissed}
        isLightDismiss={true}
        headerText={i18n.t('overlays.aboutPanel.title')}>
        {i18n.getElement('overlays.aboutPanel.content')}
    </Panel>
);