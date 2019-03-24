import React, {ChangeEvent} from 'react';
import i18n from '../../i18n';
import deferred from '../../helpers/deferred';
import {ITextField, TextField} from 'office-ui-fabric-react/lib/TextField';
import logger from '../../helpers/logger';
import {PrimaryButton} from 'office-ui-fabric-react/lib/Button';
import {OnAddArtifactFunction} from '../../store/types';
import {ComboBox, IComboBoxOption} from 'office-ui-fabric-react/lib/ComboBox';
import {ArtifactPath} from '../../types';
import {arrayUnique} from '../../helpers/array';
import {Panel, PanelType} from 'office-ui-fabric-react/lib/Panel';
import {redirectToArtifactPath} from 'src/router';

interface AddArtifactPanelProps {
    isOpen: boolean,
    onDismissed: () => void,
    onAddArtifact: OnAddArtifactFunction,
    artifactPaths: ArtifactPath[]
};

interface AddArtifactPanelState {
    project?: string,
    artifact?: string,
    encoding?: string,
    file?: File
};

const defaultEncoding = 'UTF-8';

export default class extends React.Component<AddArtifactPanelProps, AddArtifactPanelState> {
    state: AddArtifactPanelState = {};
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

        const artifactPath = {project, artifact};
        const proceed = (source?: string) => {
            this.props.onAddArtifact({artifactPath, source});
            this.setState({project: undefined, artifact: undefined, encoding: undefined, file: undefined});
            this.props.onDismissed();
            redirectToArtifactPath(artifactPath);
            // TODO: large models are rejected by the server (traditional POST upload instead?)
        };

        if (file) {
            var reader = new FileReader();
            reader.onload = (e: any) => {
                proceed(e.target.result);
            };
            reader.readAsText(file, encoding || defaultEncoding);
        } else
            proceed();
    };

    onRenderFooterContent = () =>
        <PrimaryButton onClick={this.onSubmit} text={i18n.t('overlays.addArtifactPanel.create')}/>;

    render() {
        const {isOpen, onDismissed} = this.props,
            projectOptions = arrayUnique(this.props.artifactPaths.map(artifactPath => artifactPath.project))
                .map(project => ({key: project, text: project}));

        return (
            <Panel
                type={PanelType.smallFixedFar}
                isOpen={isOpen}
                onDismissed={onDismissed}
                isLightDismiss={true}
                layerProps={{onLayerDidMount: this.onLayerDidMount}}
                headerText={i18n.t('overlays.addArtifactPanel.title')}
                onRenderFooterContent={this.onRenderFooterContent}>
                <ComboBox
                    text={this.state.project}
                    label={i18n.t('commandPalette.project')}
                    allowFreeform
                    autoComplete="on"
                    options={projectOptions}
                    onChange={this.onProjectChange}
                    required/>
                <TextField
                    componentRef={this.artifactRef}
                    label={i18n.t('commandPalette.artifact')}
                    value={this.state.artifact}
                    onChange={this.onArtifactChange}
                    required/>
                {i18n.getElement('overlays.addArtifactPanel.formatNotice')}
                <p>
                    <input type="file" onChange={this.onSourceChange}/>
                </p>
                <ComboBox
                    text={this.state.encoding || defaultEncoding}
                    label={i18n.t('overlays.addArtifactPanel.encoding')}
                    allowFreeform
                    autoComplete="on"
                    options={['UTF-8', 'ISO-8859-1', 'Windows-1252']
                        .map(encoding => ({key: encoding, text: encoding}))}
                    onChange={this.onEncodingChange}/>
            </Panel>
        );
    }
}