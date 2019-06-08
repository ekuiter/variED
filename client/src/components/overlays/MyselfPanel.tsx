import React from 'react';
import i18n from '../../i18n';
import {TextField} from 'office-ui-fabric-react/lib/TextField';
import logger from '../../helpers/logger';
import {PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import {OnSetMyselfNameFunction, Collaborator} from '../../store/types';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';

interface MyselfPanelProps {
    isOpen: boolean,
    onDismissed: () => void,
    onSetMyselfName: OnSetMyselfNameFunction,
    myself: Collaborator
};

interface MyselfPanelState {
    name?: string
};

export default class extends React.Component<MyselfPanelProps, MyselfPanelState> {
    state: MyselfPanelState = {};
   
    getValue = (): string => typeof this.state.name === 'undefined' ? this.props.myself.name || '' : this.state.name;
    onNameChange = (_event: any, name?: string) => this.setState({name});

    onSubmit = () => {
        let name = this.getValue();
        name = name && name.trim();

        if (!name) {
            logger.warn(() => 'no name supplied'); // TODO: better error UI
            return;
        }

        this.props.onSetMyselfName({name});
        this.setState({name: undefined});
        this.props.onDismissed();
    };

    onRenderFooterContent = () =>
        <PrimaryButton onClick={this.onSubmit} text={i18n.t('overlays.myselfPanel.save')}/>;

    render() {
        const {isOpen, onDismissed} = this.props;

        return (
            <Panel
                type={PanelType.smallFixedFar}
                isOpen={isOpen}
                onDismissed={onDismissed}
                isLightDismiss={true}
                headerText={i18n.t('overlays.myselfPanel.title')}
                onRenderFooterContent={this.onRenderFooterContent}>
                <TextField
                    label={i18n.t('overlays.myselfPanel.name')}
                    value={this.getValue()}
                    onChange={this.onNameChange}/>
            </Panel>
        );
    }
}