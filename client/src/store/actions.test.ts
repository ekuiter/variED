import actions, {SERVER_SEND_MESSAGE} from './actions';
import {FeatureDiagramLayoutType, OverlayType, MessageType, Func} from '../types';
import constants from '../constants';
import {sendMessage, sendBatchMessage} from '../server/webSocket';
import {defaultSettings} from './settings';

jest.mock('../server/webSocket');

const {propertyTypes, groupValueTypes} = constants.server;

async function expectMessageAction(thunk: Func, payload: any, isSendBatch = false, matcher = 'toEqual'): Promise<void> {
    const dispatch = jest.fn(action => action),
        getState = jest.fn(() => ({settings: defaultSettings})),
        action = await thunk(dispatch, getState);
    expect(action)[matcher]({type: SERVER_SEND_MESSAGE, payload});
    expect(dispatch).toBeCalledWith(action);
    if (matcher === 'toEqual')
        expect(isSendBatch ? sendBatchMessage : sendMessage).lastCalledWith(payload, undefined, 0);
}

const expectBatchMessageAction = (thunk: Func, payload: any) =>
    expectMessageAction(thunk, payload, true);

describe('actions', () => {
    describe('settings', () => {
        it('sets a setting', () => {
            expect(actions.settings.set({path: 'featureDiagram.font.size', value: 42}))
                .toEqual({type: 'settings/set', payload: {path: 'featureDiagram.font.size', value: 42}});
        });

        it('resets settings to defaults', () => {
            expect(actions.settings.reset()).toEqual({type: 'settings/reset'});
        });
    });

    describe('user interface', () => {
        it('sets the feature diagram layout', () => {
            expect(actions.ui.featureDiagram.setLayout({layout: FeatureDiagramLayoutType.verticalTree}))
                .toEqual({type: 'ui/featureDiagram/setLayout', payload: {layout: FeatureDiagramLayoutType.verticalTree}});
        });

        describe('feature', () => {
            it('is selected', () => {
                expect(actions.ui.featureDiagram.feature.select({featureUUID: 'FeatureIDE'}))
                    .toEqual({type: 'ui/featureDiagram/feature/select', payload: {featureUUID: 'FeatureIDE'}});
            });

            it('is deselected', () => {
                expect(actions.ui.featureDiagram.feature.deselect({featureUUID: 'FeatureIDE'}))
                    .toEqual({type: 'ui/featureDiagram/feature/deselect', payload: {featureUUID: 'FeatureIDE'}});
            });

            it('is collapsed', () => {
                expect(actions.ui.featureDiagram.feature.collapse({featureUUIDs: ['FeatureIDE']}))
                    .toEqual({type: 'ui/featureDiagram/feature/collapse', payload: {featureUUIDs: ['FeatureIDE']}});
            });

            it('is expanded', () => {
                expect(actions.ui.featureDiagram.feature.expand({featureUUIDs: ['FeatureIDE']}))
                    .toEqual({type: 'ui/featureDiagram/feature/expand', payload: {featureUUIDs: ['FeatureIDE']}});
            });
        });

        describe('multiple features', () => {
            it('sets whether multiple features can be selected', () => {
                expect(actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}))
                    .toEqual({type: 'ui/featureDiagram/feature/setSelectMultiple', payload: {isSelectMultipleFeatures: true}});
            });

            it('selects all', () => {
                expect(actions.ui.featureDiagram.feature.selectAll())
                    .toEqual({type: 'ui/featureDiagram/feature/selectAll'});
            });

            it('deselects all', () => {
                expect(actions.ui.featureDiagram.feature.deselectAll())
                    .toEqual({type: 'ui/featureDiagram/feature/deselectAll'});
            });

            it('collapses all', () => {
                expect(actions.ui.featureDiagram.feature.collapseAll())
                    .toEqual({type: 'ui/featureDiagram/feature/collapseAll'});
            });

            it('expands all', () => {
                expect(actions.ui.featureDiagram.feature.expandAll())
                    .toEqual({type: 'ui/featureDiagram/feature/expandAll'});
            });
        });

        describe('overlay', () => {
            it('shows the about panel', () => {
                expect(actions.ui.overlay.show({overlay: OverlayType.aboutPanel, overlayProps: {}}))
                    .toEqual({
                        type: 'ui/overlay/show', payload: {
                            overlay: OverlayType.aboutPanel, overlayProps: {}, selectOneFeature: undefined
                        }
                    });
            });

            it('shows the feature panel', () => {
                expect(actions.ui.overlay.show({overlay: OverlayType.featurePanel, overlayProps: {featureUUID: 'FeatureIDE'}}))
                    .toEqual({
                        type: 'ui/overlay/show', payload: {
                            overlay: OverlayType.featurePanel,
                            overlayProps: {featureUUID: 'FeatureIDE'},
                            selectFeature: undefined
                        }
                    });
            });

            it('shows the feature panel and selects a feature', () => {
                expect(actions.ui.overlay.show({overlay: OverlayType.featurePanel, overlayProps: {featureUUID: 'FeatureIDE'}, selectOneFeature: 'FeatureIDE'}))
                    .toEqual({
                        type: 'ui/overlay/show', payload: {
                            overlay: OverlayType.featurePanel,
                            overlayProps: {featureUUID: 'FeatureIDE'},
                            selectOneFeature: 'FeatureIDE'
                        }
                    });
            });

            it('hides a panel', () => {
                expect(actions.ui.overlay.hide({overlay: OverlayType.aboutPanel}))
                    .toEqual({type: 'ui/overlay/hide', payload: {overlay: OverlayType.aboutPanel}});
            });
        });
    });

    describe('server', () => {
        it('undoes a state change', () => {
            return expectMessageAction(actions.server.undo({}), {type: MessageType.UNDO});
        });
    
        it('redoes a state change', () => {
            return expectMessageAction(actions.server.redo({}), {type: MessageType.REDO});
        });
    
        describe('feature', () => {
            it('adds a feature below', () => {
                return expectMessageAction(actions.server.featureDiagram.feature.addBelow({belowFeatureUUID: 'FeatureIDE'}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowFeatureUUID: 'FeatureIDE'}, false, 'toMatchObject');
            });
    
            it('removes a feature', () => {
                return expectBatchMessageAction(actions.server.featureDiagram.feature.remove({featureUUIDs: ['FeatureIDE']}),
                    [{type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE, featureUUID: 'FeatureIDE'}]);
            });
    
            it('renames a feature', () => {
                return expectMessageAction(actions.server.featureDiagram.feature.rename({featureUUID: 'FeatureIDE', name: 'new feature name'}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME, featureUUID: 'FeatureIDE', name: 'new feature name'});
            });
    
            it('sets a feature description', () => {
                return expectMessageAction(actions.server.featureDiagram.feature.setDescription({featureUUID: 'FeatureIDE', description: 'some description'}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, featureUUID: 'FeatureIDE', description: 'some description'});
            });
    
            describe('properties', () => {
                it('sets the abstract property', () =>
                    expectBatchMessageAction(actions.server.featureDiagram.feature.properties.setAbstract({featureUUIDs: ['FeatureIDE'], value: true}),
                        [{type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, featureUUID: 'FeatureIDE', property: propertyTypes.abstract, value: true}]));
    
                it('sets the hidden property', () =>
                    expectBatchMessageAction(actions.server.featureDiagram.feature.properties.setHidden({featureUUIDs: ['FeatureIDE'], value: true}),
                        [{type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, featureUUID: 'FeatureIDE', property: propertyTypes.hidden, value: true}]));
    
                it('sets the mandatory property', () =>
                    expectBatchMessageAction(actions.server.featureDiagram.feature.properties.setMandatory({featureUUIDs: ['FeatureIDE'], value: true}),
                        [{type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, featureUUID: 'FeatureIDE', property: propertyTypes.mandatory, value: true}]));
    
                it('toggles the mandatory property', async () => {
                    await expectMessageAction(actions.server.featureDiagram.feature.properties.toggleMandatory({feature: <any>{uuid: 'FeatureIDE', isMandatory: true}}),
                        {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, featureUUID: 'FeatureIDE', property: propertyTypes.mandatory, value: false});
                    await expectMessageAction(actions.server.featureDiagram.feature.properties.toggleMandatory({feature: <any>{uuid: 'FeatureIDE', isMandatory: false}}),
                            {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, featureUUID: 'FeatureIDE', property: propertyTypes.mandatory, value: true});
                });
    
                it('changes the group type to and', () =>
                    expectBatchMessageAction(actions.server.featureDiagram.feature.properties.setAnd({featureUUIDs: ['FeatureIDE']}), [{
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        featureUUID: 'FeatureIDE',
                        property: propertyTypes.group,
                        value: groupValueTypes.and
                    }]));
    
                it('changes the group type to or', () =>
                    expectBatchMessageAction(actions.server.featureDiagram.feature.properties.setOr({featureUUIDs: ['FeatureIDE']}), [{
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        featureUUID: 'FeatureIDE',
                        property: propertyTypes.group,
                        value: groupValueTypes.or
                    }]));
    
                it('changes the group type to alternative', () =>
                    expectBatchMessageAction(actions.server.featureDiagram.feature.properties.setAlternative({featureUUIDs: ['FeatureIDE']}), [{
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        featureUUID: 'FeatureIDE',
                        property: propertyTypes.group,
                        value: groupValueTypes.alternative
                    }]));
    
                it('toggles the group type from and to or', () =>
                    expectMessageAction(
                        actions.server.featureDiagram.feature.properties.toggleGroup({
                            feature: <any>{
                                uuid: 'FeatureIDE',
                                isAnd: true,
                                isOr: false,
                                isAlternative: false
                            }
                        }), {
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID: 'FeatureIDE',
                            property: propertyTypes.group,
                            value: groupValueTypes.or
                        }));
    
                it('toggles the group type from or to alternative', () =>
                    expectMessageAction(
                        actions.server.featureDiagram.feature.properties.toggleGroup({
                            feature: <any>{
                                uuid: 'FeatureIDE',
                                isAnd: false,
                                isOr: true,
                                isAlternative: false
                            }
                        }), {
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID: 'FeatureIDE',
                            property: propertyTypes.group,
                            value: groupValueTypes.alternative
                        }));
    
                it('toggles the group type from alternative to and', () =>
                    expectMessageAction(
                        actions.server.featureDiagram.feature.properties.toggleGroup({
                            feature: <any>{
                                uuid: 'FeatureIDE',
                                isAnd: false,
                                isOr: false,
                                isAlternative: true
                            }
                        }), {
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            featureUUID: 'FeatureIDE',
                            property: propertyTypes.group,
                            value: groupValueTypes.and
                        }));
            });
        });
    
        describe('features', () => {
            it('adds a feature above', () =>
                expectMessageAction(actions.server.featureDiagram.feature.addAbove({aboveFeatureUUIDs: ['FeatureIDE', 'Eclipse']}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, aboveFeatureUUIDs: ['FeatureIDE', 'Eclipse']}, false, 'toMatchObject'));
        });
    });
});