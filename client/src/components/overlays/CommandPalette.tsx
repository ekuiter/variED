import React from 'react';
import i18n from '../../i18n';
import {OnShowOverlayFunction, OnUndoFunction, OnRedoFunction, OnSetFeatureDiagramLayoutFunction, OnFitToScreenFunction, OnCreateFeatureAboveFunction, OnCreateFeatureBelowFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnRemoveFeatureFunction, OnRemoveFeatureSubtreeFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureOptionalFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction, OnExpandAllFeaturesFunction, OnCollapseAllFeaturesFunction, OnJoinRequestFunction, OnLeaveRequestFunction, CollaborativeSession, OnSetCurrentArtifactPathFunction, OnSetSettingFunction} from '../../store/types';
import {getShortcutText} from '../../shortcuts';
import {OverlayType, Omit, FeatureDiagramLayoutType, FormatType, isArtifactPathEqual, ArtifactPath} from '../../types';
import Palette, {PaletteItem, PaletteAction, getKey} from '../../helpers/Palette';
import {canExport} from '../featureDiagramView/export';
import FeatureModel from '../../modeling/FeatureModel';
import {arrayUnique} from '../../helpers/array';
import defer from '../../helpers/defer';
import logger from '../../helpers/logger';

interface Props {
    artifactPaths: ArtifactPath[],
    collaborativeSessions: CollaborativeSession[],
    isOpen: boolean,
    featureDiagramLayout?: FeatureDiagramLayoutType,
    featureModel?: FeatureModel,
    onDismiss: () => void,
    onShowOverlay: OnShowOverlayFunction,
    onJoinRequest: OnJoinRequestFunction,
    onLeaveRequest: OnLeaveRequestFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction,
    onFitToScreen: OnFitToScreenFunction,
    onCollapseAllFeatures: OnCollapseAllFeaturesFunction,
    onExpandAllFeatures: OnExpandAllFeaturesFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
    onRemoveFeature: OnRemoveFeatureFunction,
    onRemoveFeatureSubtree: OnRemoveFeatureSubtreeFunction,
    onCreateFeatureBelow: OnCreateFeatureBelowFunction,
    onCreateFeatureAbove: OnCreateFeatureAboveFunction,
    onSetFeatureAbstract: OnSetFeatureAbstractFunction,
    onSetFeatureHidden: OnSetFeatureHiddenFunction,
    onSetFeatureOptional: OnSetFeatureOptionalFunction,
    onSetFeatureAnd: OnSetFeatureAndFunction,
    onSetFeatureOr: OnSetFeatureOrFunction,
    onSetFeatureAlternative: OnSetFeatureAlternativeFunction
    onSetFeatureDiagramLayout: OnSetFeatureDiagramLayoutFunction,
    onSetCurrentArtifactPath: OnSetCurrentArtifactPathFunction,
    onSetSetting: OnSetSettingFunction
};

interface State {
    rerenderPalette: number,
    getArgumentItems?: () => Promise<PaletteItem[]>,
    argumentItems?: PaletteItem[],
    allowFreeform?: (value: string) => PaletteAction,
    title?: string
};

type PaletteItemDescriptor = Omit<PaletteItem, 'action'> | string;
type PaletteItemsFunction = ((...args: string[]) => PaletteItemDescriptor[] | Promise<PaletteItemDescriptor[]>);

interface ArgumentDescriptor {
    items?: PaletteItemsFunction,
    allowFreeform?: boolean,
    title?: string
};

export default class extends React.Component<Props, State> {
    state: State = {rerenderPalette: +new Date()};
    commandUsage: {
        [x: string]: number
    } = {};

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (!prevProps.isOpen && this.props.isOpen)
            this.setState({getArgumentItems: undefined, argumentItems: undefined, allowFreeform: undefined, title: undefined});

        if (this.state.getArgumentItems &&
            (prevState.getArgumentItems !== this.state.getArgumentItems ||
                prevProps.featureModel !== this.props.featureModel))
            this.state.getArgumentItems()
                .then(argumentItems => this.setState({argumentItems}));
    }

    onSubmit = (command: PaletteItem) => {
        defer(() => this.commandUsage[getKey(command)] = +new Date())();
    }

    action = (action: PaletteAction): PaletteAction => {
        return () => {
            this.props.onDismiss();
            action();
        };
    };

    actionWithArguments = (args: (ArgumentDescriptor | PaletteItemsFunction)[], action: PaletteAction): PaletteAction => {
        if (args.length === 0)
            return this.action(action);

        const wrappedAction = () => {
            const toArgumentDescriptor = (argument: ArgumentDescriptor | PaletteItemsFunction) =>
                    typeof argument === 'function' ? {items: argument} : argument,
                    toPaletteItemsFunction = (items?: PaletteItemsFunction) => items || (() => []),
                argumentDescriptor: ArgumentDescriptor = toArgumentDescriptor(args[0]),
                // bind current argument and recurse (until all arguments are bound)
                recurse = (value: string) =>
                    this.actionWithArguments(
                        args.slice(1).map(toArgumentDescriptor).map(argument => ({
                            ...argument, items: toPaletteItemsFunction(argument.items).bind(undefined, value)
                        })),
                        action.bind(undefined, value));

            this.setState({
                rerenderPalette: +new Date(),
                // instead of directly setting the argument items, we save a function that can recompute
                // the argument items, for example in case the feature model was updated
                getArgumentItems: () => Promise.resolve(toPaletteItemsFunction(argumentDescriptor.items)()).then(items => items.map(item => {
                    if (typeof item === 'string')
                        item = {text: item};
                    return {...item, action: recurse(item.key || item.text)};
                })),
                allowFreeform: !!argumentDescriptor.allowFreeform ? recurse : undefined,
                title: argumentDescriptor.title
            });
        };
        wrappedAction.isActionWithArguments = true;
        return wrappedAction;
    };

    featureCommand(command: Omit<PaletteItem, 'action'>, action: PaletteAction): PaletteItem {
        return {
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.feature'),
                    items: () => this.props.featureModel!.getVisiblefeatureIDs().map(featureID => ({
                        key: featureID, text: this.props.featureModel!.getFeature(featureID)!.name
                    }))
                }],
                action),
            ...command
        };
    }

    isEditing = (artifactPath: ArtifactPath) =>
        this.props.collaborativeSessions.find(collaborativeSession =>
            isArtifactPathEqual(collaborativeSession.artifactPath, artifactPath));

    commands: PaletteItem[] = [
        {
            text: i18n.t('commandPalette.joinRequest'),
            icon: 'JoinOnlineMeeting',
            disabled: () => this.props.artifactPaths.length === 0,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.project'),
                    items: () => arrayUnique(this.props.artifactPaths.map(artifactPath => artifactPath.project))
                }, {
                    title: i18n.t('commandPalette.artifact'),
                    items: (project: string) =>
                        this.props.artifactPaths
                            .filter(artifactPath => artifactPath.project === project)
                            .map(artifactPath => ({
                                text: artifactPath.artifact,
                                icon: this.isEditing(artifactPath) ? 'FolderOpen' : 'Folder'
                            }))
                }],
                (project, artifact) => {
                    if (this.isEditing({project, artifact}))
                        this.props.onSetCurrentArtifactPath({artifactPath: {project, artifact}});
                    else
                        this.props.onJoinRequest({artifactPath: {project, artifact}});
                })
        },
        {
            text: i18n.t('commandPalette.leaveRequest'),
            icon: 'JoinOnlineMeeting',
            disabled: () => this.props.collaborativeSessions.length === 0,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.project'),
                    items: () => arrayUnique(
                        this.props.collaborativeSessions
                            .map(collaborativeSession => collaborativeSession.artifactPath.project))
                }, {
                    title: i18n.t('commandPalette.artifact'),
                    items: (project: string) =>
                    this.props.collaborativeSessions
                        .filter(collaborativeSession => collaborativeSession.artifactPath.project === project)
                        .map(collaborativeSession => collaborativeSession.artifactPath.artifact)
                }],
                (project, artifact) => this.props.onLeaveRequest({artifactPath: {project, artifact}}))
        },
        {
            text: i18n.t('commandPalette.settings'),
            icon: 'Settings',
            shortcut: getShortcutText('settings'),
            action: this.action(() => this.props.onShowOverlay({overlay: OverlayType.settingsPanel, overlayProps: {}}))
        }, {
            text: i18n.t('commandPalette.about'),
            icon: 'Info',
            action: this.action(() => this.props.onShowOverlay({overlay: OverlayType.aboutPanel, overlayProps: {}}))
        }, {
            text: i18n.t('commands.undo'),
            icon: 'Undo',
            disabled: () => !this.props.featureModel,
            shortcut: getShortcutText('undo'),
            action: this.action(this.props.onUndo)
        }, {
            text: i18n.t('commands.redo'),
            icon: 'Redo',
            disabled: () => !this.props.featureModel,
            shortcut: getShortcutText('redo'),
            action: this.action(this.props.onRedo)
        }, {
            text: i18n.t('commandPalette.featureDiagram.export'),
            icon: 'Share',
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.format'),
                    items: () => Object.values(FormatType).map(format => ({text: i18n.t('commandPalette.featureDiagram', format), key: format}))
                }],
                formatString => {
                    const format = FormatType[formatString];
                    if (canExport(this.props.featureDiagramLayout!, format))
                        this.props.onShowOverlay({overlay: OverlayType.exportDialog, overlayProps: {format}});
                })
        }, {
            text: i18n.t('commandPalette.featureDiagram.setLayout'),
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.layout'),
                    items: () => Object.values(FeatureDiagramLayoutType).map(layout => ({text: i18n.t('commands.featureDiagram', layout), key: layout}))
                }],
                layoutString => this.props.onSetFeatureDiagramLayout({layout: FeatureDiagramLayoutType[layoutString]}))
        }, {
            key: 'fitToScreen',
            icon: 'FullScreen',
            text: i18n.t('commandPalette.featureDiagram.fitToScreen'),
            disabled: () => !this.props.featureModel,
            action: this.action(this.props.onFitToScreen)
        },
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.newMenu.newBelow'),
            shortcut: getShortcutText('featureDiagram.feature.new'),
            icon: 'Add'
        }, featureID => this.props.onCreateFeatureBelow({featureParentID: featureID})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.newMenu.newAbove'),
            icon: 'Add'
        }, featureID => this.props.onCreateFeatureAbove({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.getFunction('commands.featureDiagram.feature.removeMenu.remove')({length: 1}),
            shortcut: getShortcutText('featureDiagram.feature.remove'),
            icon: 'Remove'
        }, featureID => this.props.onRemoveFeature({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.removeMenu.removeBelow'),
            icon: 'Remove'
        }, featureID => this.props.onRemoveFeatureSubtree({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.t('commandPalette.featureDiagram.feature.details'),
            shortcut: getShortcutText('featureDiagram.feature.details'),
            icon: 'Info'
        }, featureID => this.props.onShowOverlay({overlay: OverlayType.featurePanel, overlayProps: {featureID}})),
        
        this.featureCommand({
            text: i18n.t('commandPalette.featureDiagram.feature.rename'),
            shortcut: getShortcutText('featureDiagram.feature.rename'),
            icon: 'Rename'
        }, featureID => this.props.onShowOverlay({overlay: OverlayType.featureRenameDialog, overlayProps: {featureID}})),
        
        this.featureCommand({
            text: i18n.t('commandPalette.featureDiagram.feature.setDescription'),
            icon: 'TextDocument',
        }, featureID => this.props.onShowOverlay({overlay: OverlayType.featureSetDescriptionDialog, overlayProps: {featureID}})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.abstract')},
            featureID => this.props.onSetFeatureAbstract({featureIDs: [featureID], value: true})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.concrete')},
            featureID => this.props.onSetFeatureAbstract({featureIDs: [featureID], value: false})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.hidden')},
            featureID => this.props.onSetFeatureHidden({featureIDs: [featureID], value: !this.props.featureModel!.getFeature(featureID)!.isHidden})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.optional')},
            featureID => this.props.onSetFeatureOptional({featureIDs: [featureID], value: true})),
    
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.mandatory')},
            featureID => this.props.onSetFeatureOptional({featureIDs: [featureID], value: false})),
                
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.and')},
            featureID => this.props.onSetFeatureAnd({featureIDs: [featureID]})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.or')},
            featureID => this.props.onSetFeatureOr({featureIDs: [featureID]})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.alternative')},
            featureID => this.props.onSetFeatureAlternative({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.getFunction('commands.featureDiagram.feature.collapseMenu.collapse')(false),
            shortcut: getShortcutText('featureDiagram.feature.collapse'),
            icon: 'CollapseContentSingle'
        }, featureID => this.props.onCollapseFeatures({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.getFunction('commands.featureDiagram.feature.collapseMenu.collapse')(true),
            shortcut: getShortcutText('featureDiagram.feature.expand'),
            icon: 'ExploreContentSingle'
        }, featureID => this.props.onExpandFeatures({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapseBelow'),
            icon: 'CollapseContent'
        }, featureID => this.props.onCollapseFeaturesBelow({featureIDs: [featureID]})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.collapseMenu.expandBelow'),
            icon: 'ExploreContent'
        }, featureID => this.props.onExpandFeaturesBelow({featureIDs: [featureID]})),
        
        {
            text: i18n.t('commands.featureDiagram.feature.collapseAll'),
            shortcut: getShortcutText('featureDiagram.feature.collapse'),
            icon: 'CollapseContent',
            disabled: () => !this.props.featureModel,
            action: this.action(this.props.onCollapseAllFeatures)
        }, {
            text: i18n.t('commands.featureDiagram.feature.expandAll'),
            shortcut: getShortcutText('featureDiagram.feature.expand'),
            icon: 'ExploreContent',
            disabled: () => !this.props.featureModel,
            action: this.action(this.props.onExpandAllFeatures)
        }, {
            text: i18n.t('commandPalette.developer.debug'),
            icon: 'DeveloperTools',
            action: this.action(() => this.props.onSetSetting({path: 'developer.debug', value: (bool: boolean) => !bool}))
        }, {
            text: i18n.t('commandPalette.developer.delay'),
            icon: 'DeveloperTools',
            action: this.actionWithArguments(
                [{
                    title: i18n.t('commandPalette.delay'),
                    allowFreeform: true
                }],
                delayString => {
                    const delay = parseInt(delayString);
                    if (isNaN(delay) || delay < 0)
                        logger.warn(() => 'invalid delay specified');
                    else
                        this.props.onSetSetting({path: 'developer.delay', value: delay});
                })
        }
    ];

    render() {
        const items = this.state.argumentItems || this.commands;
        return (
            <Palette
                key={this.state.rerenderPalette}
                isOpen={this.props.isOpen}
                items={items}
                onDismiss={this.props.onDismiss}
                allowFreeform={this.state.allowFreeform}
                placeholder={this.state.title}
                onSubmit={this.onSubmit}
                itemUsage={this.state.argumentItems ? undefined : this.commandUsage}/>
        );
    }
};