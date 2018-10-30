import React from 'react';
import i18n from '../../i18n';
import {OnShowOverlayFunction, OnUndoFunction, OnRedoFunction, OnSetFeatureDiagramLayoutFunction, OnFitToScreenFunction, OnAddFeatureAboveFunction, OnAddFeatureBelowFunction, OnCollapseFeaturesFunction, OnCollapseFeaturesBelowFunction, OnExpandFeaturesFunction, OnExpandFeaturesBelowFunction, OnRemoveFeaturesFunction, OnRemoveFeaturesBelowFunction, OnSetFeatureAbstractFunction, OnSetFeatureHiddenFunction, OnSetFeatureMandatoryFunction, OnSetFeatureAndFunction, OnSetFeatureOrFunction, OnSetFeatureAlternativeFunction, OnExpandAllFeaturesFunction, OnCollapseAllFeaturesFunction, OnJoinFunction, OnLeaveFunction, CollaborativeSession, OnSetCurrentArtifactPathFunction} from '../../store/types';
import {getShortcutText} from '../../shortcuts';
import {OverlayType, Omit, FeatureDiagramLayoutType, FormatType, isArtifactPathEqual, ArtifactPath} from '../../types';
import Palette, {PaletteItem, PaletteAction, getKey} from '../../helpers/Palette';
import {canExport} from '../featureDiagram/export';
import FeatureModel from '../../server/FeatureModel';
import {arrayUnique} from '../../helpers/array';
import defer from '../../helpers/defer';

interface Props {
    artifactPaths: ArtifactPath[],
    collaborativeSessions: CollaborativeSession[],
    isOpen: boolean,
    featureDiagramLayout?: FeatureDiagramLayoutType,
    featureModel?: FeatureModel,
    onDismiss: () => void,
    onShowOverlay: OnShowOverlayFunction,
    onJoin: OnJoinFunction,
    onLeave: OnLeaveFunction,
    onUndo: OnUndoFunction,
    onRedo: OnRedoFunction,
    onFitToScreen: OnFitToScreenFunction,
    onCollapseAllFeatures: OnCollapseAllFeaturesFunction,
    onExpandAllFeatures: OnExpandAllFeaturesFunction,
    onCollapseFeatures: OnCollapseFeaturesFunction,
    onCollapseFeaturesBelow: OnCollapseFeaturesBelowFunction,
    onExpandFeatures: OnExpandFeaturesFunction,
    onExpandFeaturesBelow: OnExpandFeaturesBelowFunction,
    onRemoveFeatures: OnRemoveFeaturesFunction,
    onRemoveFeaturesBelow: OnRemoveFeaturesBelowFunction,
    onAddFeatureBelow: OnAddFeatureBelowFunction,
    onAddFeatureAbove: OnAddFeatureAboveFunction,
    onSetFeatureAbstract: OnSetFeatureAbstractFunction,
    onSetFeatureHidden: OnSetFeatureHiddenFunction,
    onSetFeatureMandatory: OnSetFeatureMandatoryFunction,
    onSetFeatureAnd: OnSetFeatureAndFunction,
    onSetFeatureOr: OnSetFeatureOrFunction,
    onSetFeatureAlternative: OnSetFeatureAlternativeFunction
    onSetFeatureDiagramLayout: OnSetFeatureDiagramLayoutFunction,
    onSetCurrentArtifactPath: OnSetCurrentArtifactPathFunction
};

interface State {
    rerenderPalette: number,
    getArgumentItems?: () => Promise<PaletteItem[]>,
    argumentItems?: PaletteItem[],
    allowFreeform?: (value: string) => PaletteAction
};

type PaletteItemDescriptor = Omit<PaletteItem, 'action'> & {key?: string} | string;
type PaletteItemsFunction = ((...args: string[]) => PaletteItemDescriptor[] | Promise<PaletteItemDescriptor[]>);

interface ArgumentDescriptor {
    items?: PaletteItemsFunction,
    allowFreeform?: boolean
};

export default class extends React.Component<Props, State> {
    state: State = {rerenderPalette: +new Date()};
    commandUsage: {
        [x: string]: number
    } = {};

    componentDidUpdate(prevProps: Props, prevState: State) {
        if (!prevProps.isOpen && this.props.isOpen)
            this.setState({argumentItems: undefined, allowFreeform: undefined});

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
                allowFreeform: !!argumentDescriptor.allowFreeform ? recurse : undefined
            });
        };
        wrappedAction.isActionWithArguments = true;
        return wrappedAction;
    };

    featureCommand(command: Omit<PaletteItem, 'action'>, action: PaletteAction): PaletteItem {
        return {
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [() => this.props.featureModel!.getVisibleFeatureNames()],
                action),
            ...command
        };
    }

    isEditing = (artifactPath: ArtifactPath) =>
        this.props.collaborativeSessions.find(collaborativeSession =>
            isArtifactPathEqual(collaborativeSession.artifactPath, artifactPath));

    commands: PaletteItem[] = [
        {
            text: i18n.t('commandPalette.join'),
            icon: 'JoinOnlineMeeting',
            disabled: () => this.props.artifactPaths.length === 0,
            action: this.actionWithArguments(
                [
                    () => arrayUnique(this.props.artifactPaths.map(artifactPath => artifactPath.project)),
                    (project: string) =>
                        this.props.artifactPaths
                            .filter(artifactPath => artifactPath.project === project)
                            .map(artifactPath => ({
                                text: artifactPath.artifact,
                                icon: this.isEditing(artifactPath) ? 'FolderOpen' : 'Folder'
                            }))
                ],
                (project, artifact) => {
                    if (this.isEditing({project, artifact}))
                        this.props.onSetCurrentArtifactPath({artifactPath: {project, artifact}});
                    else
                        this.props.onJoin({artifactPath: {project, artifact}});
                })
        },
        {
            text: i18n.t('commandPalette.leave'),
            icon: 'JoinOnlineMeeting',
            disabled: () => this.props.collaborativeSessions.length === 0,
            action: this.actionWithArguments(
                [
                    () => arrayUnique(
                        this.props.collaborativeSessions
                            .map(collaborativeSession => collaborativeSession.artifactPath.project)),
                    (project: string) =>
                        this.props.collaborativeSessions
                            .filter(collaborativeSession => collaborativeSession.artifactPath.project === project)
                            .map(collaborativeSession => collaborativeSession.artifactPath.artifact)
                ],
                (project, artifact) => this.props.onLeave({artifactPath: {project, artifact}}))
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
            shortcut: getShortcutText('undo'),
            action: this.action(this.props.onUndo)
        }, {
            text: i18n.t('commands.redo'),
            icon: 'Redo',
            shortcut: getShortcutText('redo'),
            action: this.action(this.props.onRedo)
        }, {
            text: i18n.t('commandPalette.featureDiagram.export'),
            icon: 'Share',
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [() => Object.values(FormatType).map(format => ({text: i18n.t('commandPalette.featureDiagram', format), key: format}))],
                formatString => {
                    const format = FormatType[formatString];
                    if (canExport(this.props.featureDiagramLayout!, format))
                        this.props.onShowOverlay({overlay: OverlayType.exportDialog, overlayProps: {format}});
                })
        }, {
            text: i18n.t('commandPalette.featureDiagram.setLayout'),
            disabled: () => !this.props.featureModel,
            action: this.actionWithArguments(
                [() => Object.values(FeatureDiagramLayoutType).map(layout => ({text: i18n.t('commands.featureDiagram', layout), key: layout}))],
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
        }, featureName => this.props.onAddFeatureBelow({belowFeatureName: featureName})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.newMenu.newAbove'),
            icon: 'Add'
        }, featureName => this.props.onAddFeatureAbove({aboveFeatureNames: [featureName]})),
        
        this.featureCommand({
            text: i18n.getFunction('commands.featureDiagram.feature.removeMenu.remove')({length: 1}),
            shortcut: getShortcutText('featureDiagram.feature.remove'),
            icon: 'Remove'
        }, featureName => this.props.onRemoveFeatures({featureNames: [featureName]})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.removeMenu.removeBelow'),
            icon: 'Remove'
        }, featureName => this.props.onRemoveFeaturesBelow({featureNames: [featureName]})),
        
        this.featureCommand({
            text: i18n.t('commandPalette.featureDiagram.feature.details'),
            shortcut: getShortcutText('featureDiagram.feature.details'),
            icon: 'Info'
        }, featureName => this.props.onShowOverlay({overlay: OverlayType.featurePanel, overlayProps: {featureName}})),
        
        this.featureCommand({
            text: i18n.t('commandPalette.featureDiagram.feature.rename'),
            shortcut: getShortcutText('featureDiagram.feature.rename'),
            icon: 'Rename'
        }, featureName => this.props.onShowOverlay({overlay: OverlayType.featureRenameDialog, overlayProps: {featureName}})),
        
        this.featureCommand({
            text: i18n.t('commandPalette.featureDiagram.feature.setDescription'),
            icon: 'TextDocument',
        }, featureName => this.props.onShowOverlay({overlay: OverlayType.featureSetDescriptionDialog, overlayProps: {featureName}})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.abstract')},
            featureName => this.props.onSetFeatureAbstract({featureNames: [featureName], value: true})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.concrete')},
            featureName => this.props.onSetFeatureAbstract({featureNames: [featureName], value: false})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.hidden')},
            featureName => this.props.onSetFeatureHidden({featureNames: [featureName], value: !this.props.featureModel!.getFeature(featureName)!.isHidden})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.mandatory')},
            featureName => this.props.onSetFeatureMandatory({featureNames: [featureName], value: true})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.optional')},
            featureName => this.props.onSetFeatureMandatory({featureNames: [featureName], value: false})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.and')},
            featureName => this.props.onSetFeatureAnd({featureNames: [featureName]})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.or')},
            featureName => this.props.onSetFeatureOr({featureNames: [featureName]})),
        
        this.featureCommand(
            {text: i18n.t('commandPalette.featureDiagram.feature.propertiesMenu.alternative')},
            featureName => this.props.onSetFeatureAlternative({featureNames: [featureName]})),
        
        this.featureCommand({
            text: i18n.getFunction('commands.featureDiagram.feature.collapseMenu.collapse')(false),
            shortcut: getShortcutText('featureDiagram.feature.collapse'),
            icon: 'CollapseContentSingle'
        }, featureName => this.props.onCollapseFeatures({featureNames: [featureName]})),
        
        this.featureCommand({
            text: i18n.getFunction('commands.featureDiagram.feature.collapseMenu.collapse')(true),
            shortcut: getShortcutText('featureDiagram.feature.expand'),
            icon: 'ExploreContentSingle'
        }, featureName => this.props.onExpandFeatures({featureNames: [featureName]})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.collapseMenu.collapseBelow'),
            icon: 'CollapseContent'
        }, featureName => this.props.onCollapseFeaturesBelow({featureNames: [featureName]})),
        
        this.featureCommand({
            text: i18n.t('commands.featureDiagram.feature.collapseMenu.expandBelow'),
            icon: 'ExploreContent'
        }, featureName => this.props.onExpandFeaturesBelow({featureNames: [featureName]})),
        
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
                onSubmit={this.onSubmit}
                itemUsage={this.state.argumentItems ? undefined : this.commandUsage}/>
        );
    }
};