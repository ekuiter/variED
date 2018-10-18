import actions from './actions';
import {layoutTypes, overlayTypes} from '../types';

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
            expect(actions.ui.featureDiagram.setLayout({layout: layoutTypes.verticalTree}))
                .toEqual({type: 'ui/featureDiagram/setLayout', payload: {layout: layoutTypes.verticalTree}});
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
                expect(actions.ui.overlay.show({overlay: overlayTypes.aboutPanel}))
                    .toEqual({
                        type: 'ui/overlay/show', payload: {
                            overlay: overlayTypes.aboutPanel, overlayProps: undefined, selectFeature: undefined
                        }
                    });
            });

            it('shows the feature panel', () => {
                expect(actions.ui.overlay.show({overlay: overlayTypes.featurePanel, overlayProps: {featureName: 'FeatureIDE'}}))
                    .toEqual({
                        type: 'ui/overlay/show', payload: {
                            overlay: overlayTypes.featurePanel,
                            overlayProps: {featureName: 'FeatureIDE'},
                            selectFeature: undefined
                        }
                    });
            });

            it('shows the feature panel and selects a feature', () => {
                expect(actions.ui.overlay.show({overlay: overlayTypes.featurePanel, overlayProps: {featureName: 'FeatureIDE'}, selectOneFeature: 'FeatureIDE'}))
                    .toEqual({
                        type: 'ui/overlay/show', payload: {
                            overlay: overlayTypes.featurePanel,
                            overlayProps: {featureName: 'FeatureIDE'},
                            selectOneFeature: 'FeatureIDE'
                        }
                    });
            });

            it('hides a panel', () => {
                expect(actions.ui.overlay.hide({overlay: overlayTypes.aboutPanel}))
                    .toEqual({type: 'ui/overlay/hide', payload: {overlay: overlayTypes.aboutPanel}});
            });
        });
    });
});