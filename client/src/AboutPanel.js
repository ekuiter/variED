import React from 'react';
import i18n from './i18n';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';

export default props => (
    <Panel
        isOpen={props.isOpen}
        type={PanelType.smallFixedFar}
        onDismiss={props.onDismiss}
        isLightDismiss={true}
        headerText={i18n.t('aboutPanel.title')}>
        {i18n.t('aboutPanel.content')}
    </Panel>
);