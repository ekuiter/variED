import React, {ChangeEvent} from 'react';
import i18n from '../../i18n';
import deferred from '../../helpers/deferred';
import {ITextField, TextField} from 'office-ui-fabric-react/lib/TextField';
import logger from '../../helpers/logger';
import Dialog, {DialogFooter} from 'office-ui-fabric-react/lib/Dialog';
import {PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import {OnAddArtifactFunction} from '../../store/types';
import {ComboBox, IComboBoxOption} from 'office-ui-fabric-react/lib/ComboBox';
import {ArtifactPath} from '../../types';
import {arrayUnique} from '../../helpers/array';

interface AddArtifactDialogProps {
    isOpen: boolean,
    onDismiss: () => void,
    onAddArtifact: OnAddArtifactFunction,
    artifactPaths: ArtifactPath[]
};

interface AddArtifactDialogState {
    project?: string,
    artifact?: string,
    encoding?: string,
    file?: File
};

const defaultEncoding = 'UTF-8';

export default class extends React.Component<AddArtifactDialogProps, AddArtifactDialogState> {
    state: AddArtifactDialogState = {};
    artifactRef = React.createRef<ITextField>();
   
    onProjectChange = (_event: any, option: IComboBoxOption, index: number, value: string) =>
        this.setState({project: value || (option ? option.text : undefined)});
    onArtifactChange = (_event: any, artifact?: string) => this.setState({artifact});
    onEncodingChange = (_event: any, option: IComboBoxOption, index: number, value: string) =>
        this.setState({encoding: value || (option ? option.text : undefined)});

    onSourceChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (files && files.length === 1)
            this.setState({file: files[0]});
        else if (files && files.length > 1)
            logger.warn(() => 'only one artifact can be added at a time');
    }

    onLayerDidMount = deferred(() => {
        this.artifactRef.current!.focus();
        this.artifactRef.current!.select();
    });

    onSubmit = () => {
        let {project, artifact, encoding, file} = this.state;
        project = project && project.trim();
        artifact = artifact && artifact.trim();
        encoding = encoding && encoding.trim();

        if (!project || !artifact) {
            logger.warn(() => 'no artifact path supplied'); // TODO: better error UI
            return;
        }
        if (!file) {
            logger.warn(() => 'no file supplied'); // TODO: better error UI
            return;
        }
        
        var reader = new FileReader();
        reader.onload = (e: any) => {
            const source = e.target.result;
            this.props.onAddArtifact({artifactPath: {project: project!, artifact: artifact!}, source});
            this.setState({project: undefined, artifact: undefined, encoding: undefined, file: undefined});
            this.props.onDismiss();
            // TODO: this does not immediately switch to the new model
            // further, large models are rejected by the server (traditional POST upload instead?)
            window.alert('After importing, the feature model will be available for joining in the command palette.');
        };
        reader.readAsText(file, encoding || defaultEncoding);
    };

    render() {
        const {isOpen, onDismiss} = this.props,
            projectOptions = arrayUnique(this.props.artifactPaths.map(artifactPath => artifactPath.project))
                .map(project => ({key: project, text: project}));

        return (
            <Dialog
                hidden={!isOpen}
                onDismiss={onDismiss}
                modalProps={{onLayerDidMount: this.onLayerDidMount}}
                dialogContentProps={{title: i18n.t('overlays.addArtifactDialog.title')}}>
                <ComboBox
                    text={this.state.project}
                    label={i18n.t('commandPalette.project')}
                    allowFreeform
                    autoComplete="on"
                    options={projectOptions}
                    onChange={this.onProjectChange}/>
                <TextField
                    componentRef={this.artifactRef}
                    label={i18n.t('commandPalette.artifact')}
                    value={this.state.artifact}
                    onChange={this.onArtifactChange}/>
                <ComboBox
                    text={this.state.encoding || defaultEncoding}
                    label={i18n.t('overlays.addArtifactDialog.encoding')}
                    allowFreeform
                    autoComplete="on"
                    options={['UTF-8', 'ISO-8859-1', 'Windows-1252']
                        .map(encoding => ({key: encoding, text: encoding}))}
                    onChange={this.onEncodingChange}/>
                {i18n.getElement('overlays.addArtifactDialog.formatNotice')}
                <input type="file" onChange={this.onSourceChange}/>
                <DialogFooter>
                    <PrimaryButton onClick={this.onSubmit} text={i18n.t('overlays.addArtifactDialog.upload')}/>
                </DialogFooter>
            </Dialog>
        );
    }
}