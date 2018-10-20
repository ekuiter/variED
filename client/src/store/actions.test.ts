import actions, {SERVER_SEND_MESSAGE} from './actions';
import {FeatureDiagramLayoutType, OverlayType, MessageType, Func} from '../types';
import constants from '../constants';
import {sendMessage, sendMultipleMessages} from '../server/webSocket';

jest.mock('../server/webSocket');

const {propertyTypes, groupValueTypes} = constants.server;

async function expectServerAction(thunk: Func, payload: any, isSendMultiple = false): Promise<void> {
    const dispatch = jest.fn(action => action);
    const action = await thunk(dispatch);
    expect(action).toEqual({type: SERVER_SEND_MESSAGE, payload});
    expect(dispatch).toBeCalledWith(action);
    expect(isSendMultiple ? sendMultipleMessages : sendMessage).lastCalledWith(payload);
}

const expectMultipleServerAction = (thunk: Func, payload: any) =>
    expectServerAction(thunk, payload, true);

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
                expect(actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}))
                    .toEqual({type: 'ui/featureDiagram/feature/select', payload: {featureName: 'FeatureIDE'}});
            });

            it('is deselected', () => {
                expect(actions.ui.featureDiagram.feature.deselect({featureName: 'FeatureIDE'}))
                    .toEqual({type: 'ui/featureDiagram/feature/deselect', payload: {featureName: 'FeatureIDE'}});
            });

            it('is collapsed', () => {
                expect(actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}))
                    .toEqual({type: 'ui/featureDiagram/feature/collapse', payload: {featureNames: ['FeatureIDE']}});
            });

            it('is expanded', () => {
                expect(actions.ui.featureDiagram.feature.expand({featureNames: ['FeatureIDE']}))
                    .toEqual({type: 'ui/featureDiagram/feature/expand', payload: {featureNames: ['FeatureIDE']}});
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
                expect(actions.ui.overlay.show({overlay: OverlayType.featurePanel, overlayProps: {featureName: 'FeatureIDE'}}))
                    .toEqual({
                        type: 'ui/overlay/show', payload: {
                            overlay: OverlayType.featurePanel,
                            overlayProps: {featureName: 'FeatureIDE'},
                            selectFeature: undefined
                        }
                    });
            });

            it('shows the feature panel and selects a feature', () => {
                expect(actions.ui.overlay.show({overlay: OverlayType.featurePanel, overlayProps: {featureName: 'FeatureIDE'}, selectOneFeature: 'FeatureIDE'}))
                    .toEqual({
                        type: 'ui/overlay/show', payload: {
                            overlay: OverlayType.featurePanel,
                            overlayProps: {featureName: 'FeatureIDE'},
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
            return expectServerAction(actions.server.undo({}), {type: MessageType.UNDO});
        });
    
        it('redoes a state change', () => {
            return expectServerAction(actions.server.redo({}), {type: MessageType.REDO});
        });
    
        describe('feature', () => {
            it('adds a feature below', () => {
                return expectServerAction(actions.server.featureDiagram.feature.addBelow({belowFeatureName: 'FeatureIDE'}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_BELOW, belowFeature: 'FeatureIDE'});
            });
    
            it('removes a feature', () => {
                return expectMultipleServerAction(actions.server.featureDiagram.feature.remove({featureNames: ['FeatureIDE']}),
                    [{type: MessageType.FEATURE_DIAGRAM_FEATURE_REMOVE, feature: 'FeatureIDE'}]);
            });
    
            it('renames a feature', () => {
                return expectServerAction(actions.server.featureDiagram.feature.rename({oldFeatureName: 'FeatureIDE', newFeatureName: 'new feature name'}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME, oldFeature: 'FeatureIDE', newFeature: 'new feature name'});
            });
    
            it('sets a feature description', () => {
                return expectServerAction(actions.server.featureDiagram.feature.setDescription({featureName: 'FeatureIDE', description: 'some description'}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_DESCRIPTION, feature: 'FeatureIDE', description: 'some description'});
            });
    
            describe('properties', () => {
                it('sets the abstract property', () =>
                    expectMultipleServerAction(actions.server.featureDiagram.feature.properties.setAbstract({featureNames: ['FeatureIDE'], value: true}),
                        [{type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.abstract, value: true}]));
    
                it('sets the hidden property', () =>
                    expectMultipleServerAction(actions.server.featureDiagram.feature.properties.setHidden({featureNames: ['FeatureIDE'], value: true}),
                        [{type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.hidden, value: true}]));
    
                it('sets the mandatory property', () =>
                    expectMultipleServerAction(actions.server.featureDiagram.feature.properties.setMandatory({featureNames: ['FeatureIDE'], value: true}),
                        [{type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.mandatory, value: true}]));
    
                it('toggles the mandatory property', async () => {
                    await expectServerAction(actions.server.featureDiagram.feature.properties.toggleMandatory({feature: <any>{name: 'FeatureIDE', isMandatory: true}}),
                        {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.mandatory, value: false});
                    await expectServerAction(actions.server.featureDiagram.feature.properties.toggleMandatory({feature: <any>{name: 'FeatureIDE', isMandatory: false}}),
                            {type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY, feature: 'FeatureIDE', property: propertyTypes.mandatory, value: true});
                });
    
                it('changes the group type to and', () =>
                    expectMultipleServerAction(actions.server.featureDiagram.feature.properties.setAnd({featureNames: ['FeatureIDE']}), [{
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: 'FeatureIDE',
                        property: propertyTypes.group,
                        value: groupValueTypes.and
                    }]));
    
                it('changes the group type to or', () =>
                    expectMultipleServerAction(actions.server.featureDiagram.feature.properties.setOr({featureNames: ['FeatureIDE']}), [{
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: 'FeatureIDE',
                        property: propertyTypes.group,
                        value: groupValueTypes.or
                    }]));
    
                it('changes the group type to alternative', () =>
                    expectMultipleServerAction(actions.server.featureDiagram.feature.properties.setAlternative({featureNames: ['FeatureIDE']}), [{
                        type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                        feature: 'FeatureIDE',
                        property: propertyTypes.group,
                        value: groupValueTypes.alternative
                    }]));
    
                it('toggles the group type from and to or', () =>
                    expectServerAction(
                        actions.server.featureDiagram.feature.properties.toggleGroup({
                            feature: <any>{
                                name: 'FeatureIDE',
                                isAnd: true,
                                isOr: false,
                                isAlternative: false
                            }
                        }), {
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: 'FeatureIDE',
                            property: propertyTypes.group,
                            value: groupValueTypes.or
                        }));
    
                it('toggles the group type from or to alternative', () =>
                    expectServerAction(
                        actions.server.featureDiagram.feature.properties.toggleGroup({
                            feature: <any>{
                                name: 'FeatureIDE',
                                isAnd: false,
                                isOr: true,
                                isAlternative: false
                            }
                        }), {
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: 'FeatureIDE',
                            property: propertyTypes.group,
                            value: groupValueTypes.alternative
                        }));
    
                it('toggles the group type from alternative to and', () =>
                    expectServerAction(
                        actions.server.featureDiagram.feature.properties.toggleGroup({
                            feature: <any>{
                                name: 'FeatureIDE',
                                isAnd: false,
                                isOr: false,
                                isAlternative: true
                            }
                        }), {
                            type: MessageType.FEATURE_DIAGRAM_FEATURE_SET_PROPERTY,
                            feature: 'FeatureIDE',
                            property: propertyTypes.group,
                            value: groupValueTypes.and
                        }));
            });
        });
    
        describe('features', () => {
            it('adds a feature above', () =>
                expectServerAction(actions.server.featureDiagram.feature.addAbove({aboveFeaturesNames: ['FeatureIDE', 'Eclipse']}),
                    {type: MessageType.FEATURE_DIAGRAM_FEATURE_ADD_ABOVE, aboveFeatures: ['FeatureIDE', 'Eclipse']}));
        });
    });
});