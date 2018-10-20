import reducer from './reducer';
import actions from './actions';
import {FeatureDiagramLayoutType, OverlayType, MessageType} from '../types';
import {defaultSettings} from './settings';
import {validFeatureModel, validFeatureModelWithRemovedFeatures} from '../fixtures';
import FeatureModel from '../server/FeatureModel';
import {initialState} from './types';
import logger from '../helpers/logger';

jest.mock('../helpers/logger');

describe('reducer', () => {
    const featureModelState = (state = reducer(), featureModel = validFeatureModel) => {
        // TODO: change this when we can load feature models
        state.server.featureModel = undefined;
        state = reducer(state, actions.server.receive({
            type: MessageType.FEATURE_DIAGRAM_FEATURE_MODEL,
            featureModel: featureModel
        }));
        return state;
    };

    it('returns the initial state', () => {
        expect(reducer()).toBe(initialState);
    });

    describe('settings', () => {
        it('sets a setting', () => {
            const state = reducer(undefined, actions.settings.set({path: 'featureDiagram.font.size', value: 42}));
            expect(state.settings.featureDiagram.font.size).toBe(42);
        });

        it('resets settings to defaults', () => {
            let state = reducer(undefined, actions.settings.set({path: 'featureDiagram.font.size', value: 42}));
            expect(state.settings.featureDiagram.font.size).toBe(42);
            state = reducer(state, actions.settings.reset());
            expect(state.settings).toEqual(defaultSettings);
        });
    });

    describe('user interface', () => {
        it('sets the feature diagram layout', () => {
            let state = reducer(undefined, actions.ui.featureDiagram.setLayout({layout: FeatureDiagramLayoutType.horizontalTree}));
            expect(state.ui.featureDiagram.layout).toEqual(FeatureDiagramLayoutType.horizontalTree);
            state = reducer(state, actions.ui.featureDiagram.setLayout({layout: FeatureDiagramLayoutType.verticalTree}));
            expect(state.ui.featureDiagram.layout).toEqual(FeatureDiagramLayoutType.verticalTree);
        });

        describe('feature', () => {
            it('is selected', () => {
                const state = reducer(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
            });

            it('is not selected multiple times', () => {
                let state = reducer(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.featureDiagram.selectedFeatureNames.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
                state = reducer(state, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.featureDiagram.selectedFeatureNames.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
            });

            it('is deselected', () => {
                let state = reducer(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
                state = reducer(state, actions.ui.featureDiagram.feature.deselect({featureName: 'FeatureIDE'}));
                expect(state.ui.featureDiagram.selectedFeatureNames).not.toContain('FeatureIDE');
            });

            it('disables multiple feature selection when the last feature is deselected', () => {
                let state = reducer(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                state = reducer(state, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                state = reducer(state, actions.ui.featureDiagram.feature.select({featureName: 'Eclipse'}));
                expect(state.ui.featureDiagram.isSelectMultipleFeatures).toBe(true);
                state = reducer(state, actions.ui.featureDiagram.feature.deselect({featureName: 'FeatureIDE'}));
                expect(state.ui.featureDiagram.isSelectMultipleFeatures).toBe(true);
                state = reducer(state, actions.ui.featureDiagram.feature.deselect({featureName: 'Eclipse'}));
                expect(state.ui.featureDiagram.isSelectMultipleFeatures).toBe(false);
            });

            it('is collapsed', () => {
                const state = reducer(undefined, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.featureDiagram.collapsedFeatureNames).toContain('FeatureIDE');
            });

            it('is not collapsed multiple times', () => {
                let state = reducer(undefined, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.featureDiagram.collapsedFeatureNames.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
                state = reducer(state, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.featureDiagram.collapsedFeatureNames.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
            });

            it('is expanded', () => {
                let state = reducer(undefined, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.featureDiagram.collapsedFeatureNames).toContain('FeatureIDE');
                state = reducer(state, actions.ui.featureDiagram.feature.expand({featureNames: ['FeatureIDE']}));
                expect(state.ui.featureDiagram.collapsedFeatureNames).not.toContain('FeatureIDE');
            });
        });

        describe('multiple features', () => {
            describe('multiple feature selection', () => {
                it('sets whether multiple features can be selected', () => {
                    const state = reducer(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    expect(state.ui.featureDiagram.isSelectMultipleFeatures).toBe(true);
                });

                it('resets selected features when multiple feature selection is enabled', () => {
                    let state = reducer(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
                    state = reducer(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    expect(state.ui.featureDiagram.selectedFeatureNames).not.toContain('FeatureIDE');
                });

                it('resets selected features when multiple feature selection is disabled', () => {
                    let state = reducer(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
                    state = reducer(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: false}));
                    expect(state.ui.featureDiagram.selectedFeatureNames).not.toContain('FeatureIDE');
                });
            });

            describe('select all features', () => {
                it('selects all visibile features', () => {
                    const state = reducer(featureModelState(), actions.ui.featureDiagram.feature.selectAll());
                    expect(state.ui.featureDiagram.selectedFeatureNames)
                        .toEqual(new FeatureModel(validFeatureModel, []).getVisibleFeatureNames());
                });

                it('does not select features of collapsed children', () => {
                    let state = reducer(featureModelState(), actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                    state = reducer(state, actions.ui.featureDiagram.feature.selectAll());
                    expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
                    expect(state.ui.featureDiagram.selectedFeatureNames).not.toContain('FeatureHouse');
                });

                it('enables multiple feature selection', () => {
                    const state = reducer(featureModelState(), actions.ui.featureDiagram.feature.selectAll());
                    expect(state.ui.featureDiagram.isSelectMultipleFeatures).toBe(true);
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducer(undefined, actions.ui.featureDiagram.feature.selectAll());
                    expect(state).toEqual(initialState);
                });
            });

            describe('deselect all features', () => {
                it('deselects all features', () => {
                    let state = reducer(featureModelState(), actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    expect(state.ui.featureDiagram.selectedFeatureNames).toHaveLength(1);
                    state = reducer(state, actions.ui.featureDiagram.feature.deselectAll());
                    expect(state.ui.featureDiagram.selectedFeatureNames).toHaveLength(0);
                });

                it('disables multiple feature selection', () => {
                    let state = reducer(featureModelState(), actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    expect(state.ui.featureDiagram.isSelectMultipleFeatures).toBe(true);
                    state = reducer(state, actions.ui.featureDiagram.feature.deselectAll());
                    expect(state.ui.featureDiagram.isSelectMultipleFeatures).toBe(false);
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducer(undefined, actions.ui.featureDiagram.feature.deselectAll());
                    expect(state).toEqual(initialState);
                });
            });

            describe('collapse all features', () => {
                it('collapses all features with actual children', () => {
                    const state = reducer(featureModelState(), actions.ui.featureDiagram.feature.collapseAll());
                    expect(state.ui.featureDiagram.collapsedFeatureNames)
                        .toEqual(new FeatureModel(validFeatureModel, []).getFeatureNamesWithActualChildren());
                });

                it('does not collapse leaf features', () => {
                    let state = reducer(featureModelState(), actions.ui.featureDiagram.feature.collapseAll());
                    expect(state.ui.featureDiagram.selectedFeatureNames).not.toContain('FeatureHouse');
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducer(undefined, actions.ui.featureDiagram.feature.collapseAll());
                    expect(state).toEqual(initialState);
                });
            });

            describe('expand all features', () => {
                it('expands all features', () => {
                    let state = reducer(featureModelState(), actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                    expect(state.ui.featureDiagram.collapsedFeatureNames).toHaveLength(1);
                    state = reducer(state, actions.ui.featureDiagram.feature.expandAll());
                    expect(state.ui.featureDiagram.collapsedFeatureNames).toHaveLength(0);
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducer(undefined, actions.ui.featureDiagram.feature.expandAll());
                    expect(state).toEqual(initialState);
                });
            });
        });

        describe('overlay', () => {
            describe('show overlay', () => {
                it('shows the about panel', () => {
                    const state = reducer(undefined, actions.ui.overlay.show({overlay: OverlayType.aboutPanel, overlayProps: {}}));
                    expect(state.ui.overlay).toBe(OverlayType.aboutPanel);
                    expect(state.ui.overlayProps).toEqual({});
                });
    
                it('shows a feature callout', () => {
                    let state = reducer(undefined, actions.ui.overlay.show({overlay: OverlayType.featureCallout, overlayProps: {featureName: 'FeatureIDE'}}));
                    expect(state.ui.overlay).toBe(OverlayType.featureCallout);
                    expect(state.ui.overlayProps).toEqual({featureName: 'FeatureIDE'});
                });

                it('selects a feature if specified', () => {
                    let state = reducer();
                    expect(state.ui.featureDiagram.selectedFeatureNames).not.toContain('FeatureIDE');
                    state = reducer(state, actions.ui.overlay.show({overlay: OverlayType.featureCallout, overlayProps: {featureName: 'FeatureIDE'}, selectOneFeature: 'FeatureIDE'}));
                    expect(state.ui.overlay).toBe(OverlayType.featureCallout);
                    expect(state.ui.overlayProps).toEqual({featureName: 'FeatureIDE'});
                    expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
                });
            });

            describe('hide overlay', () => {
                it('hides an overlay after showing it', () => {
                    let state = reducer(undefined, actions.ui.overlay.show({overlay: OverlayType.aboutPanel, overlayProps: {}}));
                    expect(state.ui.overlay).toBe(OverlayType.aboutPanel);
                    expect(state.ui.overlayProps).toEqual({});
                    state = reducer(state, actions.ui.overlay.hide({overlay: OverlayType.aboutPanel}));
                    expect(state.ui.overlay).toBe(OverlayType.none);
                    expect(state.ui.overlayProps).toEqual({});
                });

                it('does nothing if the currently shown overlay is of another type', () => {
                    let state = reducer(undefined, actions.ui.overlay.show({overlay: OverlayType.aboutPanel, overlayProps: {}}));
                    expect(state.ui.overlay).toBe(OverlayType.aboutPanel);
                    expect(state.ui.overlayProps).toEqual({});
                    state = reducer(state, actions.ui.overlay.hide({overlay: OverlayType.featurePanel}));
                    expect(state.ui.overlay).toBe(OverlayType.aboutPanel);
                    expect(state.ui.overlayProps).toEqual({});
                });

                it('deselects a feature when switching from a feature callout or ' +
                    'contextual menu in single feature selection mode', () => {
                    let state = reducer(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    state = reducer(state, actions.ui.overlay.show({overlay: OverlayType.featureCallout, overlayProps: {featureName: 'FeatureIDE'}}));
                    expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
                    state = reducer(state, actions.ui.overlay.hide({overlay: OverlayType.featureCallout}));
                    expect(state.ui.featureDiagram.selectedFeatureNames).not.toContain('FeatureIDE');
                });
    
                it('does not deselect a feature in multiple feature selection mode', () => {
                    let state = reducer(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    state = reducer(state, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    state = reducer(state, actions.ui.overlay.show({overlay: OverlayType.featureCallout, overlayProps: {featureName: 'FeatureIDE'}}));
                    expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
                    state = reducer(state, actions.ui.overlay.hide({overlay: OverlayType.featureCallout}));
                    expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
                });
            });
        });
    });

    describe('server', () => {
        it('does not process messages with invalid type', () => {
            expect(reducer(initialState, actions.server.receive({type: 'invalid message type'} as any))).toBe(initialState);
        });
    
        it('warns on errors', () => {
            (logger.warnTagged as any).mockReset();
            expect(logger.warnTagged).not.toBeCalled();
            expect(reducer(initialState, actions.server.receive({type: MessageType.ERROR,error: 'some error'}))).toBe(initialState);
            expect(logger.warnTagged).toBeCalled();
        });
    
        it('lets users join', () => {
            const state = reducer(initialState, actions.server.receive({type: MessageType.JOIN, user: 'some user'}));
            expect(state.server.users).toContain('some user');
        });
    
        it('does not let users join multiple times', () => {
            let state = reducer(initialState, actions.server.receive({type: MessageType.JOIN, user: 'some user'}));
            expect(state.server.users).toHaveLength(1);
            state = reducer(state, actions.server.receive({type: MessageType.JOIN, user: 'some user'}));
            expect(state.server.users).toHaveLength(1);
        });
    
        it('lets users leave', () => {
            let state = reducer(initialState, actions.server.receive({type: MessageType.JOIN, user: 'some user'}));
            expect(state.server.users).toContain('some user');
            state = reducer(initialState, actions.server.receive({type: MessageType.LEAVE, user: 'some user'}));
            expect(state.server.users).not.toContain('some user');
        });
    
        it('updates the feature model', () => {
            let state = reducer(initialState, actions.server.receive({type: MessageType.FEATURE_DIAGRAM_FEATURE_MODEL, featureModel: validFeatureModel}));
            expect(state.server.featureModel).toBe(validFeatureModel);
            state = reducer(initialState, actions.server.receive({type: MessageType.FEATURE_DIAGRAM_FEATURE_MODEL, featureModel: validFeatureModelWithRemovedFeatures}));
            expect(state.server.featureModel).toBe(validFeatureModelWithRemovedFeatures);
        });

        describe('feature model', () => {
            it('removes obsolete features from the list of collapsed features', () => {
                let state = reducer(featureModelState(), actions.ui.featureDiagram.feature.collapseAll());
                expect(state.ui.featureDiagram.collapsedFeatureNames).toContain('FeatureIDE');
                state = featureModelState(state, validFeatureModelWithRemovedFeatures);
                expect(state.ui.featureDiagram.collapsedFeatureNames).not.toContain('FeatureIDE');
            });
        });

        describe('feature rename', () => {
            it('renames features in the list of selected features', () => {
                let state = reducer(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.featureDiagram.selectedFeatureNames).toContain('FeatureIDE');
                state = reducer(state, actions.server.receive({
                    type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME,
                    oldFeature: 'FeatureIDE',
                    newFeature: 'new feature name'
                }));
                expect(state.ui.featureDiagram.selectedFeatureNames).not.toContain('FeatureIDE');
                expect(state.ui.featureDiagram.selectedFeatureNames).toContain('new feature name');
            });

            it('renames features in the list of collapsed features', () => {
                let state = reducer(undefined, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.featureDiagram.collapsedFeatureNames).toContain('FeatureIDE');
                state = reducer(state, actions.server.receive({
                    type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME,
                    oldFeature: 'FeatureIDE',
                    newFeature: 'new feature name'
                }));
                expect(state.ui.featureDiagram.selectedFeatureNames).not.toContain('FeatureIDE');
                expect(state.ui.featureDiagram.collapsedFeatureNames).toContain('new feature name');
            });
        });
    });
});