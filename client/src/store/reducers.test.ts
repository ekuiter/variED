import reducers from './reducers';
import actions from './actions';
import {layoutTypes, overlayTypes, MessageType} from '../types';
import constants from '../constants';
import {getSetting, defaultSettings} from './settings';
import {validFeatureModel, validFeatureModelWithRemovedFeatures} from '../fixtures';
import FeatureModel from '../server/FeatureModel';

describe('reducers', () => {
    const featureModelState = (state = reducers(undefined), featureModel = validFeatureModel) => {
        // TODO: change this when we can load feature models
        state.server.featureModel = undefined;
        state = reducers(state, {
            type: MessageType.FEATURE_DIAGRAM_FEATURE_MODEL,
            featureModel: featureModel
        });
        return state;
    };

    it('returns the initial state', () => {
        expect(reducers()).toBe(constants.store.initialState);
    });

    describe('settings', () => {
        it('sets a setting', () => {
            const state = reducers(undefined, actions.settings.set({path: 'featureDiagram.font.size', value: 42}));
            expect(getSetting(state.settings, 'featureDiagram.font.size')).toBe(42);
        });

        it('resets settings to defaults', () => {
            let state = reducers(undefined, actions.settings.set({path: 'featureDiagram.font.size', value: 42}));
            expect(getSetting(state.settings, 'featureDiagram.font.size')).toBe(42);
            state = reducers(state, actions.settings.reset());
            expect(state.settings).toEqual(defaultSettings);
        });
    });

    describe('user interface', () => {
        it('sets the feature diagram layout', () => {
            let state = reducers(undefined, actions.ui.featureDiagram.setLayout({layout: layoutTypes.horizontalTree}));
            expect(state.ui.featureDiagram.layout).toEqual(layoutTypes.horizontalTree);
            state = reducers(state, actions.ui.featureDiagram.setLayout({layout: layoutTypes.verticalTree}));
            expect(state.ui.featureDiagram.layout).toEqual(layoutTypes.verticalTree);
        });

        describe('feature', () => {
            it('is selected', () => {
                const state = reducers(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
            });

            it('is not selected multiple times', () => {
                let state = reducers(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.selectedFeatureNames.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
                state = reducers(state, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.selectedFeatureNames.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
            });

            it('is deselected', () => {
                let state = reducers(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
                state = reducers(state, actions.ui.featureDiagram.feature.deselect({featureName: 'FeatureIDE'}));
                expect(state.ui.selectedFeatureNames).not.toContain('FeatureIDE');
            });

            it('disables multiple feature selection when the last feature is deselected', () => {
                let state = reducers(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                state = reducers(state, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                state = reducers(state, actions.ui.featureDiagram.feature.select({featureName: 'Eclipse'}));
                expect(state.ui.isSelectMultipleFeatures).toBe(true);
                state = reducers(state, actions.ui.featureDiagram.feature.deselect({featureName: 'FeatureIDE'}));
                expect(state.ui.isSelectMultipleFeatures).toBe(true);
                state = reducers(state, actions.ui.featureDiagram.feature.deselect({featureName: 'Eclipse'}));
                expect(state.ui.isSelectMultipleFeatures).toBe(false);
            });

            it('is collapsed', () => {
                const state = reducers(undefined, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.collapsedFeatureNames).toContain('FeatureIDE');
            });

            it('is not collapsed multiple times', () => {
                let state = reducers(undefined, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.collapsedFeatureNames.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
                state = reducers(state, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.collapsedFeatureNames.filter((name: string) => name === 'FeatureIDE')).toHaveLength(1);
            });

            it('is expanded', () => {
                let state = reducers(undefined, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.collapsedFeatureNames).toContain('FeatureIDE');
                state = reducers(state, actions.ui.featureDiagram.feature.expand({featureNames: ['FeatureIDE']}));
                expect(state.ui.collapsedFeatureNames).not.toContain('FeatureIDE');
            });
        });

        describe('multiple features', () => {
            describe('multiple feature selection', () => {
                it('sets whether multiple features can be selected', () => {
                    const state = reducers(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    expect(state.ui.isSelectMultipleFeatures).toBe(true);
                });

                it('resets selected features when multiple feature selection is enabled', () => {
                    let state = reducers(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
                    state = reducers(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    expect(state.ui.selectedFeatureNames).not.toContain('FeatureIDE');
                });

                it('resets selected features when multiple feature selection is disabled', () => {
                    let state = reducers(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
                    state = reducers(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: false}));
                    expect(state.ui.selectedFeatureNames).not.toContain('FeatureIDE');
                });
            });

            describe('select all features', () => {
                it('selects all visibile features', () => {
                    const state = reducers(featureModelState(), actions.ui.featureDiagram.feature.selectAll());
                    expect(state.ui.selectedFeatureNames)
                        .toEqual(new FeatureModel(validFeatureModel, []).getVisibleFeatureNames());
                });

                it('does not select features of collapsed children', () => {
                    let state = reducers(featureModelState(), actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                    state = reducers(state, actions.ui.featureDiagram.feature.selectAll());
                    expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
                    expect(state.ui.selectedFeatureNames).not.toContain('FeatureHouse');
                });

                it('enables multiple feature selection', () => {
                    const state = reducers(featureModelState(), actions.ui.featureDiagram.feature.selectAll());
                    expect(state.ui.isSelectMultipleFeatures).toBe(true);
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducers(undefined, actions.ui.featureDiagram.feature.selectAll());
                    expect(state).toEqual(constants.store.initialState);
                });
            });

            describe('deselect all features', () => {
                it('deselects all features', () => {
                    let state = reducers(featureModelState(), actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    expect(state.ui.selectedFeatureNames).toHaveLength(1);
                    state = reducers(state, actions.ui.featureDiagram.feature.deselectAll());
                    expect(state.ui.selectedFeatureNames).toHaveLength(0);
                });

                it('disables multiple feature selection', () => {
                    let state = reducers(featureModelState(), actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    expect(state.ui.isSelectMultipleFeatures).toBe(true);
                    state = reducers(state, actions.ui.featureDiagram.feature.deselectAll());
                    expect(state.ui.isSelectMultipleFeatures).toBe(false);
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducers(undefined, actions.ui.featureDiagram.feature.deselectAll());
                    expect(state).toEqual(constants.store.initialState);
                });
            });

            describe('collapse all features', () => {
                it('collapses all features with actual children', () => {
                    const state = reducers(featureModelState(), actions.ui.featureDiagram.feature.collapseAll());
                    expect(state.ui.collapsedFeatureNames)
                        .toEqual(new FeatureModel(validFeatureModel, []).getFeatureNamesWithActualChildren());
                });

                it('does not collapse leaf features', () => {
                    let state = reducers(featureModelState(), actions.ui.featureDiagram.feature.collapseAll());
                    expect(state.ui.selectedFeatureNames).not.toContain('FeatureHouse');
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducers(undefined, actions.ui.featureDiagram.feature.collapseAll());
                    expect(state).toEqual(constants.store.initialState);
                });
            });

            describe('expand all features', () => {
                it('expands all features', () => {
                    let state = reducers(featureModelState(), actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                    expect(state.ui.collapsedFeatureNames).toHaveLength(1);
                    state = reducers(state, actions.ui.featureDiagram.feature.expandAll());
                    expect(state.ui.collapsedFeatureNames).toHaveLength(0);
                });

                it('does nothing if no feature model is available', () => {
                    const state = reducers(undefined, actions.ui.featureDiagram.feature.expandAll());
                    expect(state).toEqual(constants.store.initialState);
                });
            });
        });

        describe('overlay', () => {
            describe('show overlay', () => {
                it('shows the about panel', () => {
                    const state = reducers(undefined, actions.ui.overlay.show({overlay: overlayTypes.aboutPanel}));
                    expect(state.ui.overlay).toBe(overlayTypes.aboutPanel);
                    expect(state.ui.overlayProps).toBeUndefined();
                });
    
                it('shows a feature callout', () => {
                    let state = reducers(undefined, actions.ui.overlay.show({overlay: overlayTypes.featureCallout, overlayProps: {featureName: 'FeatureIDE'}}));
                    expect(state.ui.overlay).toBe(overlayTypes.featureCallout);
                    expect(state.ui.overlayProps).toEqual({featureName: 'FeatureIDE'});
                });

                it('selects a feature if specified', () => {
                    let state = reducers(undefined);
                    expect(state.ui.selectedFeatureNames).not.toContain('FeatureIDE');
                    state = reducers(state, actions.ui.overlay.show({overlay: overlayTypes.featureCallout, overlayProps: {featureName: 'FeatureIDE'}, selectOneFeature: 'FeatureIDE'}));
                    expect(state.ui.overlay).toBe(overlayTypes.featureCallout);
                    expect(state.ui.overlayProps).toEqual({featureName: 'FeatureIDE'});
                    expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
                });
            });

            describe('hide overlay', () => {
                it('hides an overlay after showing it', () => {
                    let state = reducers(undefined, actions.ui.overlay.show({overlay: overlayTypes.aboutPanel}));
                    expect(state.ui.overlay).toBe(overlayTypes.aboutPanel);
                    expect(state.ui.overlayProps).toBeUndefined();
                    state = reducers(state, actions.ui.overlay.hide({overlay: overlayTypes.aboutPanel}));
                    expect(state.ui.overlay).toBeUndefined();
                    expect(state.ui.overlayProps).toBeUndefined();
                });

                it('does nothing if the currently shown overlay is of another type', () => {
                    let state = reducers(undefined, actions.ui.overlay.show({overlay: overlayTypes.aboutPanel}));
                    expect(state.ui.overlay).toBe(overlayTypes.aboutPanel);
                    expect(state.ui.overlayProps).toBeUndefined();
                    state = reducers(state, actions.ui.overlay.hide({overlay: overlayTypes.featurePanel}));
                    expect(state.ui.overlay).toBe(overlayTypes.aboutPanel);
                    expect(state.ui.overlayProps).toBeUndefined();
                });

                it('deselects a feature when switching from a feature callout or ' +
                    'contextual menu in single feature selection mode', () => {
                    let state = reducers(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    state = reducers(state, actions.ui.overlay.show({overlay: overlayTypes.featureCallout, overlayProps: {featureName: 'FeatureIDE'}}));
                    expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
                    state = reducers(state, actions.ui.overlay.hide({overlay: overlayTypes.featureCallout}));
                    expect(state.ui.selectedFeatureNames).not.toContain('FeatureIDE');
                });
    
                it('does not deselect a feature in multiple feature selection mode', () => {
                    let state = reducers(undefined, actions.ui.featureDiagram.feature.setSelectMultiple({isSelectMultipleFeatures: true}));
                    state = reducers(state, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                    state = reducers(state, actions.ui.overlay.show({overlay: overlayTypes.featureCallout, overlayProps: {featureName: 'FeatureIDE'}}));
                    expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
                    state = reducers(state, actions.ui.overlay.hide({overlay: overlayTypes.featureCallout}));
                    expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
                });
            });
        });
    });

    describe('server and user interface interaction', () => {
        describe('feature model', () => {
            it('removes obsolete features from the list of collapsed features', () => {
                let state = reducers(featureModelState(), actions.ui.featureDiagram.feature.collapseAll());
                expect(state.ui.collapsedFeatureNames).toContain('FeatureIDE');
                state = featureModelState(state, validFeatureModelWithRemovedFeatures);
                expect(state.ui.collapsedFeatureNames).not.toContain('FeatureIDE');
            });
        });

        describe('feature rename', () => {
            it('renames features in the list of selected features', () => {
                let state = reducers(undefined, actions.ui.featureDiagram.feature.select({featureName: 'FeatureIDE'}));
                expect(state.ui.selectedFeatureNames).toContain('FeatureIDE');
                state = reducers(state, {
                    type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME,
                    oldFeature: 'FeatureIDE',
                    newFeature: 'new feature name'
                });
                expect(state.ui.selectedFeatureNames).not.toContain('FeatureIDE');
                expect(state.ui.selectedFeatureNames).toContain('new feature name');
            });

            it('renames features in the list of collapsed features', () => {
                let state = reducers(undefined, actions.ui.featureDiagram.feature.collapse({featureNames: ['FeatureIDE']}));
                expect(state.ui.collapsedFeatureNames).toContain('FeatureIDE');
                state = reducers(state, {
                    type: MessageType.FEATURE_DIAGRAM_FEATURE_RENAME,
                    oldFeature: 'FeatureIDE',
                    newFeature: 'new feature name'
                });
                expect(state.ui.selectedFeatureNames).not.toContain('FeatureIDE');
                expect(state.ui.collapsedFeatureNames).toContain('new feature name');
            });
        });
    });
});